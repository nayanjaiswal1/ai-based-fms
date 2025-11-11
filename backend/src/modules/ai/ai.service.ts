import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { Transaction, Category, Budget } from '@database/entities';
import {
  AutoCategorizeDto,
  ParseReceiptDto,
  DetectDuplicatesDto,
  GenerateInsightsDto,
  NaturalLanguageQueryDto,
} from './dto/ai.dto';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  /**
   * Auto-categorize transaction using AI
   */
  async autoCategorize(userId: string, dto: AutoCategorizeDto) {
    this.checkOpenAIAvailability();

    // Get user's categories
    const categories = await this.categoryRepository.find({
      where: [{ userId }, { isDefault: true }],
    });

    const categoryList = categories
      .map(c => `- ${c.name}: ${c.description || 'No description'}`)
      .join('\n');

    const prompt = `You are a financial categorization assistant. Categorize the following transaction into one of the available categories.

Transaction Details:
- Description: ${dto.description}
- Amount: $${dto.amount}
${dto.merchantName ? `- Merchant: ${dto.merchantName}` : ''}

Available Categories:
${categoryList}

Return ONLY the exact category name that best matches this transaction. If no category fits well, return "Uncategorized".`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 50,
      });

      const suggestedCategoryName = completion.choices[0]?.message?.content?.trim();
      const matchedCategory = categories.find(
        c => c.name.toLowerCase() === suggestedCategoryName?.toLowerCase(),
      );

      return {
        suggestedCategory: matchedCategory?.name || 'Uncategorized',
        categoryId: matchedCategory?.id || null,
        confidence: matchedCategory ? 'high' : 'low',
      };
    } catch (error) {
      throw new BadRequestException('Failed to categorize transaction: ' + error.message);
    }
  }

  /**
   * Parse receipt text/image and extract transaction details
   */
  async parseReceipt(dto: ParseReceiptDto) {
    this.checkOpenAIAvailability();

    const prompt = `You are a receipt parsing assistant. Extract transaction details from the following receipt data and return them in JSON format.

Receipt Data:
${dto.receiptData}

Extract and return ONLY a valid JSON object with these fields:
{
  "merchantName": "merchant name",
  "amount": number,
  "date": "YYYY-MM-DD",
  "items": ["item1", "item2"],
  "category": "suggested category",
  "paymentMethod": "cash/card/etc"
}

If a field cannot be determined, use null.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('Could not parse receipt data');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      throw new BadRequestException('Failed to parse receipt: ' + error.message);
    }
  }

  /**
   * Detect duplicate transactions
   */
  async detectDuplicates(userId: string, dto: DetectDuplicatesDto) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: dto.transactionId, userId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    // Look for potential duplicates within 3 days window
    const startDate = new Date(transaction.date);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(transaction.date);
    endDate.setDate(endDate.getDate() + 3);

    const potentialDuplicates = await this.transactionRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
        isDeleted: false,
      },
    });

    const duplicates = potentialDuplicates.filter(t => {
      if (t.id === transaction.id) return false;

      // Check amount match (exact or within 1%)
      const amountDiff = Math.abs(Number(t.amount) - Number(transaction.amount));
      const amountMatch = amountDiff < Number(transaction.amount) * 0.01;

      // Check description similarity (simple string matching)
      const descSimilarity = this.calculateStringSimilarity(
        t.description.toLowerCase(),
        transaction.description.toLowerCase(),
      );

      return amountMatch && descSimilarity > 0.7;
    });

    return {
      hasDuplicates: duplicates.length > 0,
      duplicateCount: duplicates.length,
      duplicates: duplicates.map(d => ({
        id: d.id,
        description: d.description,
        amount: d.amount,
        date: d.date,
        similarity: this.calculateStringSimilarity(
          d.description.toLowerCase(),
          transaction.description.toLowerCase(),
        ),
      })),
    };
  }

  /**
   * Generate AI-powered financial insights
   */
  async generateInsights(userId: string, dto: GenerateInsightsDto) {
    this.checkOpenAIAvailability();

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    if (!dto.startDate) {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const endDate = dto.endDate ? new Date(dto.endDate) : new Date();

    // Get user's financial data
    const [transactions, budgets] = await Promise.all([
      this.transactionRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate),
          isDeleted: false,
        },
        relations: ['category'],
      }),
      this.budgetRepository.find({
        where: { userId, isActive: true },
      }),
    ]);

    // Calculate summary statistics
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryBreakdown = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const catName = t.category?.name || 'Uncategorized';
        acc[catName] = (acc[catName] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`);

    const budgetStatus = budgets.map(b => ({
      name: b.name,
      spent: b.spent,
      budget: b.amount,
      percentage: ((b.spent / b.amount) * 100).toFixed(1),
    }));

    const prompt = `You are a personal financial advisor AI. Analyze the following financial data and provide 3-5 actionable insights and recommendations.

Period: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}

Financial Summary:
- Total Income: $${income.toFixed(2)}
- Total Expenses: $${expenses.toFixed(2)}
- Net Cash Flow: $${(income - expenses).toFixed(2)}
- Savings Rate: ${income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%

Top Spending Categories:
${topCategories.join('\n')}

Budget Status:
${budgetStatus.map(b => `- ${b.name}: ${b.percentage}% used ($${b.spent}/$${b.budget})`).join('\n')}

Provide insights in the following format:
1. [Insight about spending patterns]
2. [Recommendation for improvement]
3. [Observation about savings or budget adherence]
4. [Warning about concerning trends, if any]
5. [Positive reinforcement or achievement highlight]

Keep insights concise, actionable, and personalized.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const insights = completion.choices[0]?.message?.content?.trim();

      return {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
        summary: {
          income: Number(income.toFixed(2)),
          expenses: Number(expenses.toFixed(2)),
          netCashFlow: Number((income - expenses).toFixed(2)),
          savingsRate: income > 0 ? Number(((income - expenses) / income * 100).toFixed(2)) : 0,
        },
        insights: insights.split('\n').filter(line => line.trim().length > 0),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException('Failed to generate insights: ' + error.message);
    }
  }

  /**
   * Process natural language query about finances
   */
  async processNaturalLanguageQuery(userId: string, dto: NaturalLanguageQueryDto) {
    this.checkOpenAIAvailability();

    // Get recent transactions for context
    const recentTransactions = await this.transactionRepository.find({
      where: { userId, isDeleted: false },
      order: { date: 'DESC' },
      take: 100,
      relations: ['category'],
    });

    const categories = await this.categoryRepository.find({
      where: [{ userId }, { isDefault: true }],
    });

    // Build context
    const income = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prompt = `You are a financial assistant AI with access to the user's transaction data. Answer the following question based on the provided financial data.

User Question: ${dto.query}

Available Data Summary:
- Total Recent Transactions: ${recentTransactions.length}
- Total Income: $${income.toFixed(2)}
- Total Expenses: $${expenses.toFixed(2)}
- Available Categories: ${categories.map(c => c.name).join(', ')}

Transaction Sample (last 10):
${recentTransactions.slice(0, 10).map(t =>
  `- ${t.date.toISOString().split('T')[0]}: ${t.description} - $${t.amount} (${t.type}) [${t.category?.name || 'Uncategorized'}]`
).join('\n')}

Provide a clear, concise answer to the user's question. If you need to calculate something, show your work. If the data is insufficient, explain what additional information would be helpful.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 300,
      });

      const answer = completion.choices[0]?.message?.content?.trim();

      return {
        query: dto.query,
        answer,
        contextUsed: {
          transactionCount: recentTransactions.length,
          dateRange: {
            from: recentTransactions[recentTransactions.length - 1]?.date.toISOString().split('T')[0],
            to: recentTransactions[0]?.date.toISOString().split('T')[0],
          },
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to process query: ' + error.message);
    }
  }

  /**
   * Get smart suggestions for budgeting and saving
   */
  async getSmartSuggestions(userId: string, limit: number = 3) {
    this.checkOpenAIAvailability();

    // Get last 3 months of data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [transactions, budgets] = await Promise.all([
      this.transactionRepository.find({
        where: {
          userId,
          date: Between(threeMonthsAgo, new Date()),
          isDeleted: false,
        },
        relations: ['category'],
      }),
      this.budgetRepository.find({
        where: { userId },
      }),
    ]);

    // Analyze spending patterns
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const catName = t.category?.name || 'Uncategorized';
        if (!acc[catName]) {
          acc[catName] = { total: 0, count: 0, transactions: [] };
        }
        acc[catName].total += Number(t.amount);
        acc[catName].count += 1;
        acc[catName].transactions.push(t);
        return acc;
      }, {} as Record<string, { total: number; count: number; transactions: any[] }>);

    const prompt = `You are a financial optimization AI. Based on the spending patterns, provide ${limit} smart, actionable suggestions for saving money or improving financial habits.

Spending Analysis (Last 3 Months):
${Object.entries(categorySpending).slice(0, 10).map(([cat, data]) =>
  `- ${cat}: $${data.total.toFixed(2)} (${data.count} transactions, avg $${(data.total / data.count).toFixed(2)})`
).join('\n')}

Current Budgets:
${budgets.map(b => `- ${b.name}: $${b.amount} ${b.period}`).join('\n')}

Provide ${limit} specific suggestions in this format:
1. [Category]: [Actionable suggestion with estimated savings]

Example: "Dining Out: Consider meal prepping 2-3 times per week. Could save ~$150/month"

Focus on high-impact, realistic changes.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      });

      const suggestions = completion.choices[0]?.message?.content
        ?.trim()
        .split('\n')
        .filter(line => line.trim().length > 0);

      return {
        suggestions,
        analysisDate: new Date().toISOString(),
        periodAnalyzed: {
          from: threeMonthsAgo.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to generate suggestions: ' + error.message);
    }
  }

  /**
   * Helper: Check if OpenAI is configured
   */
  private checkOpenAIAvailability() {
    if (!this.openai) {
      throw new BadRequestException(
        'AI features are not available. OpenAI API key is not configured.',
      );
    }
  }

  /**
   * Helper: Calculate string similarity (Levenshtein-based)
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Helper: Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}
