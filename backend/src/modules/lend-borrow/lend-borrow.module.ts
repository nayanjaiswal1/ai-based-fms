import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LendBorrowService } from './lend-borrow.service';
import { LendBorrowController } from './lend-borrow.controller';
import { LendBorrow } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([LendBorrow])],
  controllers: [LendBorrowController],
  providers: [LendBorrowService],
  exports: [LendBorrowService],
})
export class LendBorrowModule {}
