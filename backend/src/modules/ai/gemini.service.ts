import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GeminiExtractionResult {
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
  };
  confidence: number;
  processingTimeMs: number;
  tokensUsed?: number;
  cost: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
  }

  /**
   * Check if Gemini is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Process document using Gemini Vision API
   */
  async processDocument(
    filePath: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<GeminiExtractionResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured');
    }

    const startTime = Date.now();

    try {
      // Convert buffer to base64
      const base64Image = fileBuffer.toString('base64');

      // Prepare the prompt for Gemini
      const prompt = this.buildExtractionPrompt();

      // Call Gemini API
      const response = await this.callGeminiVision(base64Image, mimeType, prompt);

      const processingTimeMs = Date.now() - startTime;

      // Parse the response
      const extractedData = this.parseGeminiResponse(response.text);

      // Calculate cost (Gemini pricing: ~$0.00025/1K tokens for vision)
      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;
      const cost = (tokensUsed / 1000) * 0.00025;

      return {
        extractedData,
        confidence: this.calculateConfidence(extractedData),
        processingTimeMs,
        tokensUsed,
        cost,
      };
    } catch (error) {
      this.logger.error('Gemini document processing failed', error);
      throw new Error(`Gemini processing failed: ${error.message}`);
    }
  }

  /**
   * Call Gemini Vision API
   */
  private async callGeminiVision(
    base64Image: string,
    mimeType: string,
    prompt: string,
  ): Promise<any> {
    const url = `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
      },
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      return {
        text: response.data.candidates[0].content.parts[0].text,
        usageMetadata: response.data.usageMetadata,
      };
    } catch (error) {
      if (error.response) {
        this.logger.error('Gemini API error', error.response.data);
        throw new Error(
          `Gemini API error: ${error.response.data.error?.message || 'Unknown error'}`,
        );
      }
      throw error;
    }
  }

  /**
   * Build extraction prompt for Gemini
   */
  private buildExtractionPrompt(): string {
    return `You are an expert at extracting transaction data from receipts and financial documents.

Analyze this image and extract the following information:

1. Merchant/Vendor name
2. Transaction date (format: YYYY-MM-DD)
3. Total amount
4. Currency (USD, EUR, INR, etc.)
5. Tax amount (if visible)
6. Tip amount (if visible)
7. Payment method (if visible)
8. Category (food, groceries, transportation, shopping, etc.)
9. Individual items with prices (if visible)

Return ONLY a valid JSON object with this exact structure:
{
  "merchantName": "string",
  "date": "YYYY-MM-DD",
  "amount": number,
  "currency": "string",
  "tax": number or null,
  "tip": number or null,
  "total": number,
  "category": "string",
  "paymentMethod": "string or null",
  "items": [
    { "name": "string", "price": number, "quantity": number }
  ]
}

If any field cannot be determined from the image, use null.
Only return the JSON object, no additional text or markdown.`;
  }

  /**
   * Parse Gemini response to extract structured data
   */
  private parseGeminiResponse(responseText: string): any {
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      // Parse JSON
      const data = JSON.parse(cleanedText);

      // Normalize and validate the data
      return {
        merchantName: data.merchantName || null,
        amount: this.parseAmount(data.amount || data.total),
        currency: data.currency || 'USD',
        date: this.parseDate(data.date),
        category: data.category || 'uncategorized',
        items: Array.isArray(data.items) ? data.items : [],
        total: this.parseAmount(data.total || data.amount),
        tax: this.parseAmount(data.tax),
        tip: this.parseAmount(data.tip),
        paymentMethod: data.paymentMethod || null,
      };
    } catch (error) {
      this.logger.error('Failed to parse Gemini response', {
        error: error.message,
        response: responseText,
      });

      // Return empty data structure on parse failure
      return {
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
    }
  }

  /**
   * Parse amount to number
   */
  private parseAmount(value: any): number | null {
    if (value === null || value === undefined) return null;
    const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Parse and validate date
   */
  private parseDate(dateStr: string): string | null {
    if (!dateStr) return null;

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;

      // Return in YYYY-MM-DD format
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  /**
   * Calculate confidence score based on extracted data completeness
   */
  private calculateConfidence(data: any): number {
    let score = 0;
    const weights = {
      merchantName: 20,
      amount: 30,
      date: 20,
      category: 10,
      items: 15,
      currency: 5,
    };

    if (data.merchantName) score += weights.merchantName;
    if (data.amount) score += weights.amount;
    if (data.date) score += weights.date;
    if (data.category && data.category !== 'uncategorized') score += weights.category;
    if (data.items && data.items.length > 0) score += weights.items;
    if (data.currency) score += weights.currency;

    return score / 100; // Return as decimal (0-1)
  }
}
