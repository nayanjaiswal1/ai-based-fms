import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Report } from './report.entity';

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export enum GeneratedReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('generated_reports')
@Index(['reportId', 'createdAt'])
@Index(['status'])
export class GeneratedReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reportId: string;

  @ManyToOne(() => Report, (report) => report.generatedReports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reportId' })
  report: Report;

  @Column({ type: 'enum', enum: ReportFormat })
  format: ReportFormat;

  @Column({ type: 'enum', enum: GeneratedReportStatus, default: GeneratedReportStatus.PENDING })
  status: GeneratedReportStatus;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  generatedBy: string;
}
