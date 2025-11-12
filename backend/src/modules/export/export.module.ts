import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { Transaction } from '../../database/entities/transaction.entity';
import { Budget } from '../../database/entities/budget.entity';
import { Account } from '../../database/entities/account.entity';
import { Category } from '../../database/entities/category.entity';
import { Tag } from '../../database/entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      Budget,
      Account,
      Category,
      Tag,
    ]),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
