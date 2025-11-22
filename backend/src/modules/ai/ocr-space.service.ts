import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as FormData from 'form-data';

export interface OcrSpaceExtractionResult {
  extractedData: {
    merchantName?: string;
    amount?: number;
    currency?: string;
    date?: string;
    category?: string;
    items?: Array<{ name: string; price: number; quantity?: number }>;
    total?: number;
    tax?: number;
    tip?: number;
    paymentMethod?: string;
    rawText?: string;
  };
  confidence: number;
  processingTimeMs: number;
  tokensUsed?: number;
  cost: number;
}

@Injectable()
export class OcrSpaceService {
  private readonly logger = new Logger(OcrSpaceService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.ocr.space/parse/image';

  constructor(private configService: ConfigService) {
    // OCR.space API key (can use K88886888888888 for free tier)
    this.apiKey = this.configService.get<string>('OCR_SPACE_API_KEY') || 'K88886888888888';
  }

  /**
   * Check if OCR.space is configured (always available with free tier)
   */
  isConfigured(): boolean {
    return true; // Always available with default free API key
  }

  /**
   * Process document using OCR.space API
   */
  async processDocument(
    filePath: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<OcrSpaceExtractionResult> {
    const startTime = Date.now();

    try {
      // Call OCR.space API
      const ocrResult = await this.callOcrSpaceApi(fileBuffer, mimeType);

      const processingTimeMs = Date.now() - startTime;

      // Extract text from OCR result
      const rawText = this.extractText(ocrResult);

      // Parse the text to extract structured data
      const extractedData = this.parseTextToStructuredData(rawText);

      return {
        extractedData: {
          ...extractedData,
          rawText,
        },
        confidence: this.calculateConfidence(extractedData, ocrResult),
        processingTimeMs,
        tokensUsed: 0, // OCR.space doesn't use tokens
        cost: 0, // Free tier
      };
    } catch (error) {
      this.logger.error('OCR.space document processing failed', error);
      throw new Error(`OCR.space processing failed: ${error.message}`);
    }
  }

  /**
   * Call OCR.space API
   */
  private async callOcrSpaceApi(fileBuffer: Buffer, mimeType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: 'document.jpg',
      contentType: mimeType,
    });
    formData.append('apikey', this.apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy

    try {
      const response = await axios.post(this.baseUrl, formData, {
        headers: formData.getHeaders(),
        timeout: 30000,
      });

      if (!response.data.IsErroredOnProcessing) {
        return response.data;
      } else {
        throw new Error(
          response.data.ErrorMessage?.[0] || 'OCR processing error',
        );
      }
    } catch (error) {
      if (error.response) {
        this.logger.error('OCR.space API error', error.response.data);
        throw new Error(
          `OCR.space API error: ${error.response.data.ErrorMessage || 'Unknown error'}`,
        );
      }
      throw error;
    }
  }

  /**
   * Extract text from OCR.space response
   */
  private extractText(ocrResult: any): string {
    if (!ocrResult.ParsedResults || ocrResult.ParsedResults.length === 0) {
      return '';
    }

    // Combine all parsed text
    return ocrResult.ParsedResults.map((result: any) => result.ParsedText)
      .join('\n')
      .trim();
  }

  /**
   * Parse OCR text to extract structured transaction data
   */
  private parseTextToStructuredData(text: string): any {
    const data: any = {
      merchantName: null,
      amount: null,
      currency: 'USD',
      date: null,
      category: 'uncategorized',
      items: [],
      total: null,
      tax: null,
      tip: null,
      paymentMethod: null,
    };

    if (!text) return data;

    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    // Extract merchant name (usually first line or after certain keywords)
    data.merchantName = this.extractMerchantName(lines);

    // Extract date
    data.date = this.extractDate(text);

    // Extract amounts
    const amounts = this.extractAmounts(text);
    if (amounts.total !== null) data.total = amounts.total;
    if (amounts.amount !== null) data.amount = amounts.amount;
    if (amounts.tax !== null) data.tax = amounts.tax;
    if (amounts.tip !== null) data.tip = amounts.tip;

    // If amount is not set but total is, use total as amount
    if (data.amount === null && data.total !== null) {
      data.amount = data.total;
    }

    // Extract currency
    data.currency = this.extractCurrency(text);

    // Extract category based on merchant or keywords
    data.category = this.extractCategory(text, data.merchantName);

    // Extract payment method
    data.paymentMethod = this.extractPaymentMethod(text);

    // Extract line items
    data.items = this.extractLineItems(lines);

    return data;
  }

  /**
   * Extract merchant name from OCR text
   */
  private extractMerchantName(lines: string[]): string | null {
    if (lines.length === 0) return null;

    // First non-empty line is usually merchant name
    const firstLine = lines[0];

    // Remove common receipt headers
    const cleanedName = firstLine
      .replace(/RECEIPT|INVOICE|TAX INVOICE|BILL/gi, '')
      .trim();

    return cleanedName.length > 0 ? cleanedName : null;
  }

  /**
   * Extract date from text
   */
  private extractDate(text: string): string | null {
    // Common date patterns
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,           // MM-DD-YYYY or DD-MM-YYYY
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,             // YYYY-MM-DD
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i,  // DD Mon YYYY
      /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})/i, // Mon DD, YYYY
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const date = new Date(match[0]);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Extract amounts from text
   */
  private extractAmounts(text: string): {
    amount: number | null;
    total: number | null;
    tax: number | null;
    tip: number | null;
  } {
    const result = {
      amount: null as number | null,
      total: null as number | null,
      tax: null as number | null,
      tip: null as number | null,
    };

    // Extract total
    const totalMatch = text.match(/total[:\s]*\$?\s*([\d,]+\.?\d*)/i);
    if (totalMatch) {
      result.total = this.parseAmount(totalMatch[1]);
      result.amount = result.total;
    }

    // Extract tax
    const taxMatch = text.match(/tax[:\s]*\$?\s*([\d,]+\.?\d*)/i);
    if (taxMatch) {
      result.tax = this.parseAmount(taxMatch[1]);
    }

    // Extract tip
    const tipMatch = text.match(/tip[:\s]*\$?\s*([\d,]+\.?\d*)/i);
    if (tipMatch) {
      result.tip = this.parseAmount(tipMatch[1]);
    }

    // If no total found, look for amount or balance
    if (result.total === null) {
      const amountMatch = text.match(/(?:amount|balance|total amount)[:\s]*\$?\s*([\d,]+\.?\d*)/i);
      if (amountMatch) {
        result.amount = this.parseAmount(amountMatch[1]);
        result.total = result.amount;
      }
    }

    // If still no amount, find the largest number (likely the total)
    if (result.amount === null) {
      const allNumbers = text.match(/\$?\s*([\d,]+\.\d{2})/g);
      if (allNumbers && allNumbers.length > 0) {
        const amounts = allNumbers.map(num => this.parseAmount(num)).filter(n => n !== null);
        if (amounts.length > 0) {
          result.amount = Math.max(...amounts);
          result.total = result.amount;
        }
      }
    }

    return result;
  }

  /**
   * Extract currency from text
   */
  private extractCurrency(text: string): string {
    const currencySymbols: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '₹': 'INR',
      '¥': 'JPY',
    };

    // Check for currency symbols
    for (const [symbol, code] of Object.entries(currencySymbols)) {
      if (text.includes(symbol)) {
        return code;
      }
    }

    // Check for currency codes
    const codeMatch = text.match(/\b(USD|EUR|GBP|INR|JPY|CAD|AUD)\b/i);
    if (codeMatch) {
      return codeMatch[1].toUpperCase();
    }

    return 'USD'; // Default to USD
  }

  /**
   * Extract category based on merchant and keywords
   */
  private extractCategory(text: string, merchantName: string | null): string {
    const categoryKeywords: Record<string, string[]> = {
      food: ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food'],
      groceries: ['grocery', 'supermarket', 'market', 'walmart', 'target', 'kroger'],
      transportation: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking'],
      shopping: ['store', 'shop', 'retail', 'amazon', 'ebay'],
      health: ['pharmacy', 'hospital', 'clinic', 'medical', 'doctor'],
      entertainment: ['movie', 'cinema', 'theater', 'game', 'concert'],
    };

    const lowerText = (text + ' ' + (merchantName || '')).toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }

    return 'uncategorized';
  }

  /**
   * Extract payment method
   */
  private extractPaymentMethod(text: string): string | null {
    const methods = ['visa', 'mastercard', 'amex', 'discover', 'cash', 'credit', 'debit'];

    const lowerText = text.toLowerCase();
    for (const method of methods) {
      if (lowerText.includes(method)) {
        return method.charAt(0).toUpperCase() + method.slice(1);
      }
    }

    return null;
  }

  /**
   * Extract line items from receipt
   */
  private extractLineItems(lines: string[]): Array<{ name: string; price: number; quantity?: number }> {
    const items: Array<{ name: string; price: number; quantity?: number }> = [];

    // Pattern: Item name followed by price
    const itemPattern = /^(.+?)\s+\$?\s*([\d,]+\.\d{2})$/;

    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match) {
        const [, name, priceStr] = match;
        const price = this.parseAmount(priceStr);

        if (price !== null && name.length > 2) {
          // Filter out lines that look like totals or headers
          const lowerName = name.toLowerCase();
          if (!lowerName.match(/total|subtotal|tax|tip|amount|balance/)) {
            items.push({ name: name.trim(), price });
          }
        }
      }
    }

    return items;
  }

  /**
   * Parse amount string to number
   */
  private parseAmount(value: string): number | null {
    if (!value) return null;
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(data: any, ocrResult: any): number {
    let score = 0;

    // Base score from OCR confidence
    const ocrConfidence = ocrResult.ParsedResults?.[0]?.TextOverlay?.Lines
      ?.reduce((acc: number, line: any) => acc + (line.MaxHeight || 0), 0) || 0;

    // Data completeness score
    if (data.merchantName) score += 20;
    if (data.amount) score += 30;
    if (data.date) score += 20;
    if (data.items && data.items.length > 0) score += 15;
    if (data.category && data.category !== 'uncategorized') score += 10;
    if (data.currency) score += 5;

    // Combine OCR confidence with data completeness
    return Math.min(score / 100, 0.95); // Cap at 95% for OCR
  }
}
