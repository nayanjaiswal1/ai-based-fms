import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { DocumentProcessingResponse } from './document-processing-response.entity';

export enum DocumentProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum DocumentProcessingProvider {
  OPENAI = 'openai',
  GEMINI = 'gemini',
  OCR_SPACE = 'ocr_space',
}

@Entity('document_processing_requests')
@Index(['userId', 'createdAt'])
@Index(['provider', 'status'])
export class DocumentProcessingRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  fileName: string;

  @Column()
  originalFileName: string;

  @Column()
  filePath: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({
    type: 'enum',
    enum: DocumentProcessingProvider,
  })
  provider: DocumentProcessingProvider;

  @Column({
    type: 'enum',
    enum: DocumentProcessingStatus,
    default: DocumentProcessingStatus.PENDING,
  })
  status: DocumentProcessingStatus;

  @Column({ nullable: true })
  subscriptionTier: string;

  @Column({ type: 'jsonb', nullable: true })
  requestPayload: Record<string, any>;

  // Retry chain support
  @Column({ nullable: true })
  originalRequestId: string;

  @ManyToOne(() => DocumentProcessingRequest, { nullable: true })
  @JoinColumn({ name: 'originalRequestId' })
  originalRequest: DocumentProcessingRequest;

  @OneToMany(() => DocumentProcessingRequest, (request) => request.originalRequest)
  retryAttempts: DocumentProcessingRequest[];

  @Column({ default: 0 })
  retryCount: number;

  @Column({ type: 'simple-array', nullable: true })
  providerHistory: string[];

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @OneToMany(() => DocumentProcessingResponse, (response) => response.request)
  responses: DocumentProcessingResponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
