import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AIProvider {
  OPENAI = 'openai',
  OLLAMA = 'ollama',
  ANTHROPIC = 'anthropic',
  NONE = 'none', // Disable AI parsing
}

export enum AIModel {
  // OpenAI models
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_3_5_TURBO = 'gpt-3.5-turbo',

  // Ollama models (common ones)
  LLAMA_3 = 'llama3',
  LLAMA_3_1 = 'llama3.1',
  MISTRAL = 'mistral',
  MIXTRAL = 'mixtral',
  CODELLAMA = 'codellama',
  GEMMA = 'gemma',

  // Anthropic models
  CLAUDE_3_OPUS = 'claude-3-opus',
  CLAUDE_3_SONNET = 'claude-3-sonnet',
  CLAUDE_3_HAIKU = 'claude-3-haiku',
}

@Entity('ai_configs')
export class AiConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Primary AI provider configuration
  @Column({
    type: 'enum',
    enum: AIProvider,
    default: AIProvider.NONE,
  })
  provider: AIProvider;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  model: string; // Flexible string to support custom models

  // API Configuration
  @Column({ type: 'text', nullable: true })
  apiKey: string; // Encrypted in application logic

  @Column({ type: 'varchar', length: 500, nullable: true })
  apiEndpoint: string; // For custom endpoints (e.g., local Ollama, Azure OpenAI)

  @Column({ type: 'int', default: 30000 })
  timeout: number; // Request timeout in ms

  // Model parameters
  @Column({ type: 'jsonb', nullable: true })
  modelParameters: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    systemPrompt?: string;
  };

  // Feature-specific settings
  @Column({ type: 'jsonb', nullable: true })
  features: {
    emailParsing?: boolean;
    categorization?: boolean;
    insights?: boolean;
    chat?: boolean;
  };

  // Usage tracking
  @Column({ type: 'int', default: 0 })
  requestCount: number;

  @Column({ type: 'int', default: 0 })
  totalTokensUsed: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
