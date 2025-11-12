import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('deleted_users')
export class DeletedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalUserId: string; // Store the original user ID for audit purposes

  @Column({ nullable: true })
  reason: string; // Optional reason for deletion

  @Column({ type: 'text', nullable: true })
  metadata: string; // Store minimal metadata (non-PII) as JSON string

  @CreateDateColumn()
  deletedAt: Date;
}
