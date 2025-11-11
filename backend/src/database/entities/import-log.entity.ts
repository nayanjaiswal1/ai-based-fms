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

export enum ImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIALLY_COMPLETED = 'partially_completed',
}

export enum ImportType {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  EMAIL = 'email',
  API = 'api',
}

@Entity('import_logs')
export class ImportLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column({ type: 'enum', enum: ImportType })
  fileType: ImportType;

  @Column({ type: 'int', nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  filePath: string;

  @Column({ type: 'enum', enum: ImportStatus, default: ImportStatus.PENDING })
  status: ImportStatus;

  @Column({ type: 'int', default: 0 })
  totalRecords: number;

  @Column({ type: 'int', default: 0 })
  successfulRecords: number;

  @Column({ type: 'int', default: 0 })
  failedRecords: number;

  @Column({ type: 'int', default: 0 })
  duplicateRecords: number;

  @Column({ type: 'jsonb', nullable: true })
  errors: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
