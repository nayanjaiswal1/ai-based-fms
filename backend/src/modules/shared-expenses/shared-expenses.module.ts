import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedExpensesController } from './shared-expenses.controller';
import { SharedExpensesService } from './shared-expenses.service';
import {
  SharedExpenseGroup,
  SharedExpenseParticipant,
  SharedExpenseTransaction,
} from '@database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SharedExpenseGroup,
      SharedExpenseParticipant,
      SharedExpenseTransaction,
    ]),
  ],
  controllers: [SharedExpensesController],
  providers: [SharedExpensesService],
  exports: [SharedExpensesService],
})
export class SharedExpensesModule {}
