import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './groups.service';
import { GroupCommentsService } from './group-comments.service';
import { RecurringGroupTransactionsService } from './recurring-group-transactions.service';
import { GroupBudgetsService } from './group-budgets.service';
import { GroupsController } from './groups.controller';
import {
  Group,
  GroupMember,
  GroupTransaction,
  GroupComment,
  RecurringGroupTransaction,
  GroupBudget,
} from '@database/entities';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      GroupMember,
      GroupTransaction,
      GroupComment,
      RecurringGroupTransaction,
      GroupBudget,
    ]),
    NotificationsModule,
  ],
  controllers: [GroupsController],
  providers: [
    GroupsService,
    GroupCommentsService,
    RecurringGroupTransactionsService,
    GroupBudgetsService,
  ],
  exports: [
    GroupsService,
    GroupCommentsService,
    RecurringGroupTransactionsService,
    GroupBudgetsService,
  ],
})
export class GroupsModule {}
