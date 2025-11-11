import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import {
  Transaction,
  Budget,
  Account,
  Category,
  Investment,
  LendBorrow,
  Group,
} from '@database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Budget,
      Account,
      Category,
      Investment,
      LendBorrow,
      Group,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
