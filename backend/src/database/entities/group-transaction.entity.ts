import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';

export enum SplitType {
  EQUAL = 'equal',
  CUSTOM = 'custom',
  PERCENTAGE = 'percentage',
  SHARES = 'shares',
}

@Entity('group_transactions')
export class GroupTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 'USD' })
  currency: string;

  @Column()
  paidBy: string;

  @Column({ type: 'enum', enum: SplitType, default: SplitType.EQUAL })
  splitType: SplitType;

  @Column({ type: 'jsonb' })
  splits: Record<string, number>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ nullable: true })
  categoryId: string;

  @Column()
  groupId: string;

  @ManyToOne(() => Group, (group) => group.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ default: false })
  isSettlement: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
