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

export enum LendBorrowType {
  LEND = 'lend',
  BORROW = 'borrow',
}

export enum LendBorrowStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  SETTLED = 'settled',
}

@Entity('lend_borrow')
export class LendBorrow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LendBorrowType })
  type: LendBorrowType;

  @Column()
  personName: string;

  @Column({ nullable: true })
  personEmail: string;

  @Column({ nullable: true })
  personPhone: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'enum', enum: LendBorrowStatus, default: LendBorrowStatus.PENDING })
  status: LendBorrowStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ nullable: true })
  transactionId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.lendBorrowRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
