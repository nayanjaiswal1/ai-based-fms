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
      .map((c) => `- ${c.name}: ${c.description || 'No description'}`)
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
        (c) => c.name.toLowerCase() === suggestedCategoryName?.toLowerCase(),
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
      if (!responseText) {
        throw new Error('No response from AI');
      }

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
   * Detect duplicate transactions with enhanced multi-factor matching
   */
  async detectDuplicates(userId: string, dto: DetectDuplicatesDto) {
    const threshold = dto.threshold || 60;
    const timeWindow = dto.timeWindow || 3;
    const includeCategories = dto.includeCategories !== false;

    // Get all user transactions that are not merged
    const allTransactions = await this.transactionRepository.find({
      where: { userId, isDeleted: false, isMerged: false },
      relations: ['account', 'category'],
      order: { date: 'DESC' },
    });

    // Group potential duplicates
    const duplicateGroups: Array<{
      transactions: Array<{
        id: string;
        description: string;
        amount: number;
        date: Date;
        accountId: string;
        accountName: string;
        categoryId: string;
        categoryName: string;
        confidence: number;
      }>;
      confidence: number;
    }> = [];

    const processedIds = new Set<string>();

    for (let i = 0; i < allTransactions.length; i++) {
      const transaction = allTransactions[i];

      if (processedIds.has(transaction.id)) continue;

      const duplicates = [];

      // Check against remaining transactions
      for (let j = i + 1; j < allTransactions.length; j++) {
        const candidate = allTransactions[j];

        if (processedIds.has(candidate.id)) continue;

        // Check if this pair is in exclusion list
        if (
          transaction.duplicateExclusions?.includes(candidate.id) ||
          candidate.duplicateExclusions?.includes(transaction.id)
        ) {
          continue;
        }

        // Calculate multi-factor confidence score
        const confidence = this.calculateDuplicateConfidence(
          transaction,
          candidate,
          timeWindow,
          includeCategories,
        );

        if (confidence >= threshold) {
          duplicates.push({
            id: candidate.id,
            description: candidate.description,
            amount: Number(candidate.amount),
            date: candidate.date,
            accountId: candidate.accountId,
            accountName: candidate.account?.name || 'Unknown',
            categoryId: candidate.categoryId,
            categoryName: candidate.category?.name || 'Uncategorized',
            confidence: Math.round(confidence),
          });
          processedIds.add(candidate.id);
        }
      }

      // If we found duplicates, create a group
      if (duplicates.length > 0) {
        const groupConfidence =
          duplicates.reduce((sum, d) => sum + d.confidence, 0) / duplicates.length;

        duplicateGroups.push({
          transactions: [
            {
              id: transaction.id,
              description: transaction.description,
              amount: Number(transaction.amount),
              date: transaction.date,
              accountId: transaction.accountId,
              accountName: transaction.account?.name || 'Unknown',
              categoryId: transaction.categoryId,
              categoryName: transaction.category?.name || 'Uncategorized',
              confidence: 100, // Primary transaction
            },
            ...duplicates,
          ],
          confidence: Math.round(groupConfidence),
        });

        processedIds.add(transaction.id);
      }
    }

    // Sort by confidence (highest first)
    duplicateGroups.sort((a, b) => b.confidence - a.confidence);

    return {
      totalGroups: duplicateGroups.length,
      groups: duplicateGroups,
    };
  }

  /**
   * Calculate duplicate confidence score using multi-factor matching
   */
  private calculateDuplicateConfidence(
    t1: any,
    t2: any,
    timeWindow: number,
    includeCategories: boolean,
  ): number {
    // Amount matching (40 points)
    const amount1 = Number(t1.amount);
    const amount2 = Number(t2.amount);
    const amountDiff = Math.abs(amount1 - amount2);
    const amountMatch = amountDiff < amount1 * 0.01 ? 100 : 0;
    const amountScore = (amountMatch / 100) * 40;

    // Date matching (30 points)
    const date1 = new Date(t1.date);
    const date2 = new Date(t2.date);
    const daysDiff = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    let dateMatch = 0;
    if (daysDiff === 0) dateMatch = 100;
    else if (daysDiff === 1) dateMatch = 66;
    else if (daysDiff === 2) dateMatch = 33;
    else if (daysDiff <= timeWindow) dateMatch = 10;
    const dateScore = (dateMatch / 100) * 30;

    // Description matching (20 points)
    const desc1 = this.normalizeDescription(t1.description);
    const desc2 = this.normalizeDescription(t2.description);
    const descSimilarity = this.calculateStringSimilarity(desc1, desc2);
    const descScore = descSimilarity * 20;

    // Account matching (5 points)
    const accountMatch = t1.accountId === t2.accountId ? 100 : 0;
    const accountScore = (accountMatch / 100) * 5;

    // Category matching (5 points)
    let categoryScore = 0;
    if (includeCategories && t1.categoryId && t2.categoryId) {
      const categoryMatch = t1.categoryId === t2.categoryId ? 100 : 0;
      categoryScore = (categoryMatch / 100) * 5;
    }

    return amountScore + dateScore + descScore + accountScore + categoryScore;
  }

  /**
   * Normalize transaction description for better matching
   */
  private normalizeDescription(desc: string): string {
    return desc
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
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
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryBreakdown = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) => {
          const catName = t.category?.name || 'Uncategorized';
          acc[catName] = (acc[catName] || 0) + Number(t.amount);
          return acc;
        },
        {} as Record<string, number>,
      );

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`);

    const budgetStatus = budgets.map((b) => ({
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
- Savings Rate: ${income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0}%

Top Spending Categories:
${topCategories.join('\n')}

Budget Status:
${budgetStatus.map((b) => `- ${b.name}: ${b.percentage}% used ($${b.spent}/$${b.budget})`).join('\n')}

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

      const insights = completion.choices[0]?.message?.content?.trim() || '';

      return {
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
        summary: {
          income: Number(income.toFixed(2)),
          expenses: Number(expenses.toFixed(2)),
          netCashFlow: Number((income - expenses).toFixed(2)),
          savingsRate: income > 0 ? Number((((income - expenses) / income) * 100).toFixed(2)) : 0,
        },
        insights: insights.split('\n').filter((line) => line.trim().length > 0),
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
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = recentTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const prompt = `You are a financial assistant AI with access to the user's transaction data. Answer the following question based on the provided financial data.

User Question: ${dto.query}

Available Data Summary:
- Total Recent Transactions: ${recentTransactions.length}
- Total Income: $${income.toFixed(2)}
- Total Expenses: $${expenses.toFixed(2)}
- Available Categories: ${categories.map((c) => c.name).join(', ')}

Transaction Sample (last 10):
${recentTransactions
  .slice(0, 10)
  .map(
    (t) =>
      `- ${t.date.toISOString().split('T')[0]}: ${t.description} - $${t.amount} (${t.type}) [${t.category?.name || 'Uncategorized'}]`,
  )
  .join('\n')}

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
            from: recentTransactions[recentTransactions.length - 1]?.date
              .toISOString()
              .split('T')[0],
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
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) => {
          const catName = t.category?.name || 'Uncategorized';
          if (!acc[catName]) {
            acc[catName] = { total: 0, count: 0, transactions: [] };
          }
          acc[catName].total += Number(t.amount);
          acc[catName].count += 1;
          acc[catName].transactions.push(t);
          return acc;
        },
        {} as Record<string, { total: number; count: number; transactions: any[] }>,
      );

    const prompt = `You are a financial optimization AI. Based on the spending patterns, provide ${limit} smart, actionable suggestions for saving money or improving financial habits.

Spending Analysis (Last 3 Months):
${Object.entries(categorySpending)
  .slice(0, 10)
  .map(
    ([cat, data]) =>
      `- ${cat}: $${data.total.toFixed(2)} (${data.count} transactions, avg $${(data.total / data.count).toFixed(2)})`,
  )
  .join('\n')}

Current Budgets:
${budgets.map((b) => `- ${b.name}: $${b.amount} ${b.period}`).join('\n')}

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
        .filter((line) => line.trim().length > 0);

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
