import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { Transaction, Category, TransactionType, TransactionSource } from '@database/entities';
import { SendMessageDto, ProcessCommandDto } from './dto/chat.dto';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ConversationContext {
  messages: ChatMessage[];
  userId: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private conversations: Map<string, ConversationContext> = new Map();

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async sendMessage(userId: string, sendDto: SendMessageDto) {
    this.checkOpenAIAvailability();

    const conversationId = sendDto.conversationId || `${userId}-${Date.now()}`;
    let context = this.conversations.get(conversationId);

    if (!context) {
      context = {
        userId,
        messages: [
          {
            role: 'system',
            content: `You are a helpful financial assistant. You can help users:
1. Create transactions (e.g., "Add $50 expense for groceries")
2. Answer questions about their finances
3. Provide financial advice
4. Analyze spending patterns

When user wants to create a transaction, extract the details and respond in this JSON format:
{
  "action": "create_transaction",
  "data": {
    "description": "...",
    "amount": number,
    "type": "income" or "expense",
    "category": "...",
    "date": "YYYY-MM-DD"
  }
}

For other queries, respond conversationally.`,
          },
        ],
        metadata: sendDto.context,
      };
      this.conversations.set(conversationId, context);
    }

    // Add user message
    context.messages.push({
      role: 'user',
      content: sendDto.message,
    });

    try {
      // Get AI response
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: context.messages as any, // OpenAI SDK type compatibility
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim() || '';

      // Add AI response to context
      context.messages.push({
        role: 'assistant',
        content: aiResponse,
      });

      // Check if response contains action
      let action = null;
      try {
        if (aiResponse) {
          const jsonMatch = aiResponse.match(/\{[\s\S]*"action"[\s\S]*\}/);
          if (jsonMatch) {
            action = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (e) {
        // Not a JSON action, just regular text
      }

      // Execute action if present
      let actionResult = null;
      if (action && action.action === 'create_transaction') {
        actionResult = await this.executeCreateTransaction(userId, action.data);
      }

      return {
        conversationId,
        message: aiResponse,
        action: action?.action,
        actionResult,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException('Chat failed: ' + error.message);
    }
  }

  async getConversationHistory(userId: string, conversationId: string) {
    const context = this.conversations.get(conversationId);

    if (!context || context.userId !== userId) {
      return { messages: [] };
    }

    return {
      conversationId,
      messages: context.messages.filter(m => m.role !== 'system'),
    };
  }

  async clearConversation(userId: string, conversationId: string) {
    const context = this.conversations.get(conversationId);

    if (context && context.userId === userId) {
      this.conversations.delete(conversationId);
    }

    return { message: 'Conversation cleared' };
  }

  async processCommand(userId: string, commandDto: ProcessCommandDto) {
    const { command, params } = commandDto;

    switch (command.toLowerCase()) {
      case 'create_transaction':
      case 'add_transaction':
        return this.executeCreateTransaction(userId, params);

      case 'get_balance':
        return this.getAccountBalance(userId, params.accountId);

      case 'get_spending':
        return this.getSpending(userId, params);

      default:
        throw new BadRequestException('Unknown command: ' + command);
    }
  }

  async getSuggestions(userId: string) {
    // Return common suggestions for quick actions
    return {
      suggestions: [
        { text: 'Add an expense', command: 'Add $10 expense for coffee' },
        { text: 'Add income', command: 'Add $500 income from freelance' },
        { text: 'Check my balance', command: 'What is my total balance?' },
        { text: 'Spending this month', command: 'How much did I spend this month?' },
        { text: 'Budget status', command: 'Show my budget status' },
      ],
    };
  }

  private async executeCreateTransaction(userId: string, data: any) {
    try {
      const transaction = this.transactionRepository.create({
        ...data,
        userId,
        date: data.date || new Date().toISOString().split('T')[0],
        source: TransactionSource.CHAT,
      });

      const saved = await this.transactionRepository.save(transaction) as unknown as Transaction;

      return {
        success: true,
        transaction: saved,
        message: `Transaction created: ${saved.description} - $${saved.amount}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to create transaction. Please provide more details.',
      };
    }
  }

  private async getAccountBalance(userId: string, accountId?: string) {
    // Simplified - would need to join with accounts
    const transactions = await this.transactionRepository.find({
      where: accountId ? { userId, accountId } : { userId },
      select: ['amount', 'type'] as any,
    });

    const balance = transactions.reduce((sum, t) => {
      return t.type === TransactionType.INCOME ? sum + Number(t.amount) : sum - Number(t.amount);
    }, 0);

    return {
      balance: Number(balance.toFixed(2)),
      message: `Your balance is $${balance.toFixed(2)}`,
    };
  }

  private async getSpending(userId: string, params: any) {
    const startDate = params.startDate || new Date();
    if (!params.startDate) {
      (startDate as Date).setMonth((startDate as Date).getMonth() - 1);
    }

    const endDate = params.endDate || new Date();

    const transactions = await this.transactionRepository.find({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: Between(startDate, endDate) as any,
      },
    });

    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      total: Number(total.toFixed(2)),
      count: transactions.length,
      message: `You spent $${total.toFixed(2)} (${transactions.length} transactions)`,
    };
  }

  private checkOpenAIAvailability() {
    if (!this.openai) {
      throw new BadRequestException(
        'Chat features require OpenAI API key to be configured.',
      );
    }
  }
}
