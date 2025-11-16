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
import { Group } from './group.entity';

export enum GroupMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, (user) => user.groupMemberships, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ default: false })
  isExternalContact: boolean;

  @Column({ nullable: true })
  externalName: string;

  @Column({ nullable: true })
  externalEmail: string;

  @Column({ nullable: true })
  externalPhone: string;

  @Column()
  groupId: string;

  @ManyToOne(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ type: 'enum', enum: GroupMemberRole, default: GroupMemberRole.MEMBER })
  role: GroupMemberRole;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
