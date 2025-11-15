import { Injectable, Logger } from '@nestjs/common';
// import { AiService } from '@modules/ai/ai.service';
import * as cheerio from 'cheerio';

export interface ParsedTransaction {
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: string;
  merchant?: string;
  confidence: number;
  metadata: {
    from: string;
    subject: string;
    extractedAt: string;
    source: 'email';
    orderNumber?: string;
    trackingNumber?: string;
  };
}

export interface ParsedOrder {
  orderNumber: string;
  merchant: string;
  totalAmount: number;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  trackingNumber?: string;
  deliveryDate?: string;
  metadata: {
    from: string;
    subject: string;
    extractedAt: string;
  };
}

@Injectable()
export class EmailParserService {
  private readonly logger = new Logger(EmailParserService.name);

  // constructor(private readonly aiService: AiService) {}

  // Common e-commerce senders
  private readonly knownMerchants = [
    { domain: 'amazon.com', name: 'Amazon' },
    { domain: 'flipkart.com', name: 'Flipkart' },
    { domain: 'myntra.com', name: 'Myntra' },
    { domain: 'zomato.com', name: 'Zomato' },
    { domain: 'swiggy.com', name: 'Swiggy' },
    { domain: 'uber.com', name: 'Uber' },
    { domain: 'olacabs.com', name: 'Ola' },
    { domain: 'paytm.com', name: 'Paytm' },
    { domain: 'phonepe.com', name: 'PhonePe' },
    { domain: 'netflix.com', name: 'Netflix' },
    { domain: 'spotify.com', name: 'Spotify' },
  ];

  // constructor(private readonly aiService: AiService) {}

  /**
   * Parse email for transactions using AI and pattern matching
   */
  async parseTransactions(
    from: string,
    subject: string,
    body: string,
    html: string,
  ): Promise<ParsedTransaction[]> {
    const transactions: ParsedTransaction[] = [];

    // Clean and extract text from HTML
    const cleanText = this.extractTextFromHtml(html || body);

    // Check if email contains transaction indicators
    if (!this.isTransactionEmail(subject, cleanText)) {
      return [];
    }

    // Try pattern-based extraction first (faster)
    const patternBasedTransactions = this.extractTransactionsByPattern(
      from,
      subject,
      cleanText,
    );

    if (patternBasedTransactions.length > 0) {
      transactions.push(...patternBasedTransactions);
    } else {
      // Fall back to AI-powered extraction
      try {
        const aiTransactions = await this.extractTransactionsWithAI(
          from,
          subject,
          cleanText,
        );
        transactions.push(...aiTransactions);
      } catch (error) {
        this.logger.warn('AI extraction failed, using basic extraction', error);
      }
    }

    return transactions;
  }

  /**
   * Parse email for order information
   */
  async parseOrders(
    from: string,
    subject: string,
    body: string,
    html: string,
  ): Promise<ParsedOrder[]> {
    const orders: ParsedOrder[] = [];

    const cleanText = this.extractTextFromHtml(html || body);

    if (!this.isOrderEmail(subject, cleanText)) {
      return [];
    }

    // Try pattern-based extraction
    const patternBasedOrders = this.extractOrdersByPattern(
      from,
      subject,
      cleanText,
    );

    if (patternBasedOrders.length > 0) {
      orders.push(...patternBasedOrders);
    }

    return orders;
  }

  /**
   * Extract text from HTML email
   */
  private extractTextFromHtml(html: string): string {
    if (!html) return '';

    try {
      const $ = cheerio.load(html);
      // Remove script and style elements
      $('script, style').remove();
      return $.text().replace(/\s+/g, ' ').trim();
    } catch (error) {
      return html;
    }
  }

  /**
   * Check if email contains transaction information
   */
  private isTransactionEmail(subject: string, body: string): boolean {
    const transactionKeywords = [
      'payment',
      'transaction',
      'charged',
      'paid',
      'receipt',
      'invoice',
      'bill',
      'statement',
      'purchase',
      'debit',
      'credit',
      'withdrawal',
      'deposit',
      'transferred',
      'spent',
    ];

    const text = (subject + ' ' + body).toLowerCase();
    return transactionKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Check if email contains order information
   */
  private isOrderEmail(subject: string, body: string): boolean {
    const orderKeywords = [
      'order confirmed',
      'order placed',
      'order #',
      'order number',
      'tracking number',
      'shipped',
      'delivery',
      'order details',
    ];

    const text = (subject + ' ' + body).toLowerCase();
    return orderKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Extract transactions using pattern matching
   */
  private extractTransactionsByPattern(
    from: string,
    subject: string,
    body: string,
  ): ParsedTransaction[] {
    const transactions: ParsedTransaction[] = [];

    // Extract merchant name
    const merchant = this.extractMerchant(from);

    // Extract amounts
    const amounts = this.extractAmounts(body);

    // Extract dates
    const dates = this.extractDates(body);

    // Determine transaction type
    const type = this.determineTransactionType(subject, body);

    // If we found amount, create transaction
    if (amounts.length > 0) {
      amounts.forEach((amount, index) => {
        transactions.push({
          description: subject.substring(0, 200),
          amount: Math.abs(amount),
          date: dates[index] || new Date().toISOString().split('T')[0],
          type,
          merchant,
          confidence: 0.7,
          metadata: {
            from,
            subject,
            extractedAt: new Date().toISOString(),
            source: 'email',
          },
        });
      });
    }

    return transactions;
  }

  /**
   * Extract orders using pattern matching
   */
  private extractOrdersByPattern(
    from: string,
    subject: string,
    body: string,
  ): ParsedOrder[] {
    const orders: ParsedOrder[] = [];

    const merchant = this.extractMerchant(from);
    const orderNumber = this.extractOrderNumber(body);
    const trackingNumber = this.extractTrackingNumber(body);
    const amounts = this.extractAmounts(body);
    const dates = this.extractDates(body);

    if (orderNumber && amounts.length > 0) {
      orders.push({
        orderNumber,
        merchant,
        totalAmount: Math.max(...amounts),
        orderDate: dates[0] || new Date().toISOString().split('T')[0],
        items: [], // Would need more sophisticated parsing
        trackingNumber,
        metadata: {
          from,
          subject,
          extractedAt: new Date().toISOString(),
        },
      });
    }

    return orders;
  }

  /**
   * Extract merchant name from email sender
   */
  private extractMerchant(from: string): string {
    // Check known merchants
    for (const merchant of this.knownMerchants) {
      if (from.toLowerCase().includes(merchant.domain)) {
        return merchant.name;
      }
    }

    // Extract from email address
    const match = from.match(/<(.+?)@(.+?)>/);
    if (match) {
      const domain = match[2].split('.')[0];
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }

    return from.split('@')[0] || 'Unknown';
  }

  /**
   * Extract monetary amounts from text
   */
  private extractAmounts(text: string): number[] {
    const amounts: number[] = [];

    // Indian Rupee patterns
    const rupeePatterns = [
      /₹\s*([\d,]+(?:\.\d{2})?)/g,
      /INR\s*([\d,]+(?:\.\d{2})?)/g,
      /Rs\.?\s*([\d,]+(?:\.\d{2})?)/g,
    ];

    // USD patterns
    const usdPatterns = [
      /\$\s*([\d,]+(?:\.\d{2})?)/g,
      /USD\s*([\d,]+(?:\.\d{2})?)/g,
    ];

    const allPatterns = [...rupeePatterns, ...usdPatterns];

    for (const pattern of allPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          amounts.push(amount);
        }
      }
    }

    return amounts;
  }

  /**
   * Extract dates from text
   */
  private extractDates(text: string): string[] {
    const dates: string[] = [];

    // Various date formats
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/g,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/gi,
    ];

    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        try {
          const parsedDate = new Date(match[1]);
          if (!isNaN(parsedDate.getTime())) {
            dates.push(parsedDate.toISOString().split('T')[0]);
          }
        } catch (e) {
          // Invalid date, skip
        }
      }
    }

    return dates;
  }

  /**
   * Determine transaction type from context
   */
  private determineTransactionType(subject: string, body: string): 'income' | 'expense' {
    const text = (subject + ' ' + body).toLowerCase();

    const incomeKeywords = ['received', 'credited', 'refund', 'cashback', 'deposit'];
    const expenseKeywords = ['paid', 'debited', 'charged', 'purchase', 'withdrawal'];

    const hasIncome = incomeKeywords.some(keyword => text.includes(keyword));
    const hasExpense = expenseKeywords.some(keyword => text.includes(keyword));

    if (hasIncome && !hasExpense) return 'income';
    if (hasExpense && !hasIncome) return 'expense';

    // Default to expense for ambiguous cases
    return 'expense';
  }

  /**
   * Extract order number from text
   */
  private extractOrderNumber(text: string): string {
    const patterns = [
      /order\s*#?\s*:?\s*([A-Z0-9-]+)/i,
      /order\s*number\s*:?\s*([A-Z0-9-]+)/i,
      /order\s*id\s*:?\s*([A-Z0-9-]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Extract tracking number from text
   */
  private extractTrackingNumber(text: string): string | undefined {
    const patterns = [
      /tracking\s*#?\s*:?\s*([A-Z0-9]+)/i,
      /tracking\s*number\s*:?\s*([A-Z0-9]+)/i,
      /tracking\s*id\s*:?\s*([A-Z0-9]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Extract transactions using AI (OpenAI)
   */
  private async extractTransactionsWithAI(
    from: string,
    subject: string,
    body: string,
  ): Promise<ParsedTransaction[]> {
    const prompt = `Extract transaction information from this email:

From: ${from}
Subject: ${subject}
Body: ${body.substring(0, 2000)}

Extract the following if present:
- Amount (number only)
- Date (YYYY-MM-DD format)
- Merchant/Payee name
- Transaction type (income or expense)
- Description

Respond in JSON format:
{
  "transactions": [
    {
      "amount": number,
      "date": "YYYY-MM-DD",
      "merchant": "string",
      "type": "income|expense",
      "description": "string"
    }
  ]
}

If no transaction found, return empty array.`;

    try {
      // TODO: Implement AI extraction when AI service is available
      // const result = await this.aiService.chat([{ role: 'user', content: prompt }]);
      const result = '{"transactions":[]}'; // Placeholder

      const parsed = JSON.parse(result);
      const transactions: ParsedTransaction[] = [];

      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        for (const tx of parsed.transactions) {
          transactions.push({
            description: tx.description || subject,
            amount: tx.amount,
            date: tx.date,
            type: tx.type || 'expense',
            merchant: tx.merchant,
            confidence: 0.85,
            metadata: {
              from,
              subject,
              extractedAt: new Date().toISOString(),
              source: 'email',
            },
          });
        }
      }

      return transactions;
    } catch (error) {
      this.logger.error('AI extraction failed', error);
      return [];
    }
  }
}
