import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController } from './reconciliation.controller';
import { Reconciliation, ReconciliationTransaction, Transaction, Account } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Reconciliation, ReconciliationTransaction, Transaction, Account])],
  controllers: [ReconciliationController],
  providers: [ReconciliationService],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
