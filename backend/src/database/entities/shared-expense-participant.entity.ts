import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { SharedExpenseGroup } from './shared-expense-group.entity';

export enum ParticipantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('shared_expense_participants')
@Index(['groupId', 'userId'])
export class SharedExpenseParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @ManyToOne(() => SharedExpenseGroup, (group) => group.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: SharedExpenseGroup;

  // Can be null for non-registered participants (name/email only)
  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  // For non-registered participants
  @Column({ nullable: true })
  participantName: string;

  @Column({ nullable: true })
  participantEmail: string;

  @Column({
    type: 'enum',
    enum: ParticipantRole,
    default: ParticipantRole.MEMBER,
  })
  role: ParticipantRole;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
