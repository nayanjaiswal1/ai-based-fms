import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiConfig, AIProvider } from '@database/entities';
import { AiService } from './ai.service';
import { OllamaService } from './ollama.service';

export interface ExtractedTransactionData {
  transactions: Array<{
    amount: number;
    currency?: string;
    date: string;
    description: string;
    merchant?: string;
    type: 'income' | 'expense';
    confidence: number;
  }>;
  orders: Array<{
    orderId?: string;
    amount?: number;
    items?: string[];
    trackingNumber?: string;
  }>;
}

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor(
    @InjectRepository(AiConfig)
    private aiConfigRepository: Repository<AiConfig>,
    private aiService: AiService,
    private ollamaService: OllamaService,
  ) {}

  /**
   * Get or create AI config for user
   */
  async getOrCreateUserConfig(userId: string): Promise<AiConfig> {
    let config = await this.aiConfigRepository.findOne({
      where: { userId },
    });

    if (!config) {
      // Create default config (no AI, pattern matching only)
      config = this.aiConfigRepository.create({
        userId,
        provider: AIProvider.NONE,
        isActive: true,
        features: {
          emailParsing: true,
          categorization: true,
          insights: false,
          chat: false,
        },
      });
      config = await this.aiConfigRepository.save(config);
    }

    return config;
  }

  /**
   * Extract transaction data from email using user's configured AI provider
   */
  async extractTransactionData(
    userId: string,
    emailContent: {
      from: string;
      subject: string;
      body: string;
      html?: string;
    },
  ): Promise<ExtractedTransactionData> {
    const config = await this.getOrCreateUserConfig(userId);

    // Check if email parsing is enabled
    if (!config.features?.emailParsing) {
      this.logger.debug(`Email parsing disabled for user ${userId}`);
      return { transactions: [], orders: [] };
    }

    // Check if AI provider is active
    if (!config.isActive) {
      this.logger.warn(`AI config is inactive for user ${userId}`);
      return { transactions: [], orders: [] };
    }

    try {
      let result: ExtractedTransactionData;

      switch (config.provider) {
        case AIProvider.OPENAI:
          result = await this.extractWithOpenAI(config, emailContent);
          break;

        case AIProvider.OLLAMA:
          result = await this.extractWithOllama(config, emailContent);
          break;

        case AIProvider.NONE:
        default:
          // Use pattern matching fallback (from existing AiService)
          this.logger.debug('Using pattern matching for email parsing');
          return { transactions: [], orders: [] }; // Pattern matching handled elsewhere
      }

      // Update usage stats
      await this.updateUsageStats(config.id);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to extract transaction data for user ${userId}`,
        error,
      );

      // Update error message
      config.errorMessage = error.message;
      await this.aiConfigRepository.save(config);

      return { transactions: [], orders: [] };
    }
  }

  /**
   * Extract data using OpenAI
   */
  private async extractWithOpenAI(
    config: AiConfig,
    emailContent: { from: string; subject: string; body: string },
  ): Promise<ExtractedTransactionData> {
    if (!config.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Extract transaction and order data from this email:

From: ${emailContent.from}
Subject: ${emailContent.subject}

Body:
${emailContent.body}

Return a JSON object with this structure:
{
  "transactions": [
    {
      "amount": number,
      "currency": "USD" | "INR" | "EUR" etc,
      "date": "YYYY-MM-DD",
      "description": "string",
      "merchant": "string",
      "type": "income" | "expense",
      "confidence": number (0-1)
    }
  ],
  "orders": [
    {
      "orderId": "string",
      "amount": number,
      "items": ["string"],
      "trackingNumber": "string" (optional)
    }
  ]
}`;

    try {
      // Use the existing OpenAI client (would need to pass API key)
      const response = await this.callOpenAI(config, prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      this.logger.error('OpenAI extraction failed', error);
      throw error;
    }
  }

  /**
   * Extract data using Ollama
   */
  private async extractWithOllama(
    config: AiConfig,
    emailContent: { from: string; subject: string; body: string },
  ): Promise<ExtractedTransactionData> {
    if (!config.model) {
      throw new Error('Ollama model not configured');
    }

    // Configure Ollama client if custom endpoint is set
    if (config.apiEndpoint) {
      this.ollamaService.configureClient(config.apiEndpoint, config.timeout);
    }

    const result = await this.ollamaService.extractTransactionData(
      config.model,
      emailContent,
    );

    return result;
  }

  /**
   * Call OpenAI API with user's API key
   */
  private async callOpenAI(config: AiConfig, prompt: string): Promise<string> {
    const axios = require('axios');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              config.modelParameters?.systemPrompt ||
              'You are an expert at extracting financial data from emails.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: config.modelParameters?.temperature || 0.3,
        max_tokens: config.modelParameters?.maxTokens || 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: config.timeout || 30000,
      },
    );

    return response.data.choices[0].message.content;
  }

  /**
   * Parse AI response to extract transaction data
   */
  private parseAIResponse(response: string): ExtractedTransactionData {
    try {
      // Extract JSON from response (in case there's markdown or extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          transactions: data.transactions || [],
          orders: data.orders || [],
        };
      }

      this.logger.warn('No valid JSON found in AI response');
      return { transactions: [], orders: [] };
    } catch (error) {
      this.logger.error('Failed to parse AI response', error);
      return { transactions: [], orders: [] };
    }
  }

  /**
   * Update usage statistics
   */
  private async updateUsageStats(configId: string): Promise<void> {
    await this.aiConfigRepository.increment(
      { id: configId },
      'requestCount',
      1,
    );

    await this.aiConfigRepository.update(configId, {
      lastUsedAt: new Date(),
    });
  }

  /**
   * Update user AI configuration
   */
  async updateConfig(userId: string, updates: Partial<AiConfig>): Promise<AiConfig> {
    const config = await this.getOrCreateUserConfig(userId);

    // Update fields
    Object.assign(config, updates);

    // Clear error message if config is being updated
    config.errorMessage = null;

    return this.aiConfigRepository.save(config);
  }

  /**
   * Get available models for user's configured provider
   */
  async getAvailableModels(userId: string): Promise<string[]> {
    const config = await this.getOrCreateUserConfig(userId);

    switch (config.provider) {
      case AIProvider.OLLAMA:
        if (config.apiEndpoint) {
          this.ollamaService.configureClient(config.apiEndpoint, config.timeout);
        }
        return this.ollamaService.listModels();

      case AIProvider.OPENAI:
        // Return common OpenAI models
        return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];

      case AIProvider.ANTHROPIC:
        return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];

      default:
        return [];
    }
  }

  /**
   * Test AI configuration
   */
  async testConfiguration(userId: string): Promise<{
    success: boolean;
    message: string;
    models?: string[];
  }> {
    const config = await this.getOrCreateUserConfig(userId);

    if (!config.isActive) {
      return { success: false, message: 'AI configuration is inactive' };
    }

    try {
      switch (config.provider) {
        case AIProvider.OPENAI:
          // Test OpenAI connection
          await this.callOpenAI(config, 'Test connection');
          return { success: true, message: 'OpenAI connection successful' };

        case AIProvider.OLLAMA:
          // Test Ollama connection
          if (config.apiEndpoint) {
            this.ollamaService.configureClient(
              config.apiEndpoint,
              config.timeout,
            );
          }

          const isHealthy = await this.ollamaService.healthCheck();
          if (!isHealthy) {
            return { success: false, message: 'Ollama server is not responding' };
          }

          const models = await this.ollamaService.listModels();
          return {
            success: true,
            message: 'Ollama connection successful',
            models,
          };

        case AIProvider.NONE:
          return {
            success: true,
            message: 'Using pattern matching (no AI)',
          };

        default:
          return { success: false, message: 'Unknown AI provider' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
