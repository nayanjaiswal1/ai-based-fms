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

export interface WidgetConfig {
  id: string;
  type: string;
  position: number;
  size: 'small' | 'medium' | 'large' | 'full-width';
  visible: boolean;
  config?: {
    title?: string;
    dateRange?: string;
    filters?: Record<string, any>;
    categories?: string[];
    refreshInterval?: number;
  };
}

@Entity('user_dashboard_preferences')
export class UserDashboardPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('jsonb', { default: [] })
  widgets: WidgetConfig[];

  @Column({ default: 3 })
  gridColumns: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
