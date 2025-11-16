import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  temperature?: number;
  stream?: boolean;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private client: AxiosInstance;

  constructor() {
    // Initialize with default local endpoint
    this.client = axios.create({
      baseURL: 'http://localhost:11434',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Configure Ollama client with custom endpoint
   */
  configureClient(baseURL: string, timeout: number = 60000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generate text completion using Ollama
   */
  async generate(request: OllamaGenerateRequest): Promise<string> {
    try {
      const response = await this.client.post<OllamaGenerateResponse>('/api/generate', {
        model: request.model,
        prompt: request.prompt,
        system: request.system,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.max_tokens || 500,
        },
        stream: false,
      });

      return response.data.response;
    } catch (error) {
      this.logger.error('Ollama generate failed', error);
      throw new Error(`Ollama generation failed: ${error.message}`);
    }
  }

  /**
   * Chat completion using Ollama
   */
  async chat(request: OllamaChatRequest): Promise<string> {
    try {
      const response = await this.client.post<OllamaChatResponse>('/api/chat', {
        model: request.model,
        messages: request.messages,
        options: {
          temperature: request.temperature || 0.7,
        },
        stream: false,
      });

      return response.data.message.content;
    } catch (error) {
      this.logger.error('Ollama chat failed', error);
      throw new Error(`Ollama chat failed: ${error.message}`);
    }
  }

  /**
   * Extract transaction data from email using Ollama
   */
  async extractTransactionData(
    model: string,
    emailContent: {
      from: string;
      subject: string;
      body: string;
    },
  ): Promise<any> {
    const systemPrompt = `You are an expert at extracting financial transaction data from emails.
Extract transaction information and return a JSON object with the following structure:
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
}

If no transaction or order data is found, return empty arrays.
Only return valid JSON, no markdown or extra text.`;

    const userPrompt = `Extract transaction and order data from this email:

From: ${emailContent.from}
Subject: ${emailContent.subject}

Body:
${emailContent.body}`;

    try {
      const response = await this.chat({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent JSON output
      });

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      this.logger.warn('No valid JSON found in Ollama response');
      return { transactions: [], orders: [] };
    } catch (error) {
      this.logger.error('Failed to extract transaction data with Ollama', error);
      return { transactions: [], orders: [] };
    }
  }

  /**
   * Check if Ollama is available and responsive
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/tags');
      return response.status === 200;
    } catch (error) {
      this.logger.error('Ollama health check failed', error);
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await this.client.get<{ models: Array<{ name: string }> }>('/api/tags');
      return response.data.models.map((m) => m.name);
    } catch (error) {
      this.logger.error('Failed to list Ollama models', error);
      return [];
    }
  }

  /**
   * Pull a model (download if not exists)
   */
  async pullModel(modelName: string): Promise<boolean> {
    try {
      await this.client.post('/api/pull', {
        name: modelName,
        stream: false,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to pull Ollama model: ${modelName}`, error);
      return false;
    }
  }
}
