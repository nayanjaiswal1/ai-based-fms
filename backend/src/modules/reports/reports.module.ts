import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsProcessor } from './reports.processor';
import { ReportGeneratorService } from './services/report-generator.service';
import { ReportExportService } from './services/report-export.service';
import { ReportSchedulerService } from './services/report-scheduler.service';
import { Report } from '@database/entities/report.entity';
import { GeneratedReport } from '@database/entities/generated-report.entity';
import { Transaction } from '@database/entities/transaction.entity';
import { Budget } from '@database/entities/budget.entity';
import { Investment } from '@database/entities/investment.entity';
import { Account } from '@database/entities/account.entity';
import { GroupTransaction } from '@database/entities/group-transaction.entity';
import { LendBorrow } from '@database/entities/lend-borrow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Report,
      GeneratedReport,
      Transaction,
      Budget,
      Investment,
      Account,
      GroupTransaction,
      LendBorrow,
    ]),
    BullModule.registerQueue({
      name: 'reports',
    }),
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsProcessor,
    ReportGeneratorService,
    ReportExportService,
    ReportSchedulerService,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
