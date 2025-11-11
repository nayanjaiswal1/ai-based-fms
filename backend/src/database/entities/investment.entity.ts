import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum InvestmentType {
  STOCKS = 'stocks',
  MUTUAL_FUNDS = 'mutual_funds',
  BONDS = 'bonds',
  CRYPTO = 'crypto',
  FIXED_DEPOSIT = 'fixed_deposit',
  REAL_ESTATE = 'real_estate',
  GOLD = 'gold',
  OTHER = 'other',
}

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: InvestmentType })
  type: InvestmentType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  investedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  currentValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  returns: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  returnPercentage: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'date' })
  investmentDate: Date;

  @Column({ type: 'date', nullable: true })
  maturityDate: Date;

  @Column({ nullable: true })
  broker: string;

  @Column({ nullable: true })
  accountNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: Record<string, any>;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.investments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
