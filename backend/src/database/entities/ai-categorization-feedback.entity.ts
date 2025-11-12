import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';
import { Category } from './category.entity';

export enum FeedbackType {
  ACCEPT = 'accept',
  REJECT = 'reject',
  CORRECT = 'correct',
}

@Entity('ai_categorization_feedback')
export class AiCategorizationFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  transactionId: string;

  @ManyToOne(() => Transaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ type: 'text' })
  transactionDescription: string;

  @Column({ nullable: true })
  suggestedCategoryId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'suggestedCategoryId' })
  suggestedCategory: Category;

  @Column({ nullable: true })
  correctCategoryId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'correctCategoryId' })
  correctCategory: Category;

  @Column({ type: 'enum', enum: FeedbackType })
  feedbackType: FeedbackType;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  originalConfidence: number;

  @Column({ type: 'jsonb', nullable: true })
  alternativeSuggestions: {
    categoryId: string;
    confidence: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;
}
