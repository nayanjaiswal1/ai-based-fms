import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';
import {
  User,
  Account,
  Transaction,
  Category,
  Tag,
  Budget,
  GroupMember,
  Group,
  GroupTransaction,
  Investment,
  LendBorrow,
  Notification,
  Reminder,
  EmailConnection,
  ImportLog,
  Session,
  AuditLog,
  DeletedUser,
} from '@database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Account,
      Transaction,
      Category,
      Tag,
      Budget,
      GroupMember,
      Group,
      GroupTransaction,
      Investment,
      LendBorrow,
      Notification,
      Reminder,
      EmailConnection,
      ImportLog,
      Session,
      AuditLog,
      DeletedUser,
    ]),
  ],
  controllers: [GdprController],
  providers: [GdprService],
  exports: [GdprService],
})
export class GdprModule {}
