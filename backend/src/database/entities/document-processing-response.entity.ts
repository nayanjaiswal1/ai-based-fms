import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DocumentProcessingRequest } from './document-processing-request.entity';

@Entity('document_processing_responses')
@Index(['requestId'])
@Index(['provider', 'createdAt'])
export class DocumentProcessingResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestId: string;

  @ManyToOne(() => DocumentProcessingRequest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: DocumentProcessingRequest;

  @Column()
  provider: string;

  @Column({ type: 'jsonb' })
  responsePayload: Record<string, any>;

  @Column({ type: 'jsonb' })
  extractedData: Record<string, any>;

  // User edit tracking
  @Column({ type: 'jsonb', nullable: true })
  userEditedData: Record<string, any>;

  @Column({ default: false })
  wasEdited: boolean;

  @Column({ type: 'simple-array', nullable: true })
  editedFields: string[];

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date;

  @Column({ nullable: true })
  editedByUserId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  confidence: number;

  @Column({ nullable: true })
  processingTimeMs: number;

  @Column({ nullable: true })
  tokensUsed: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0 })
  cost: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  completedAt: Date;
}
