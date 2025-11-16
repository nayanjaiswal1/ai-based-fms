import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LendBorrowService } from './lend-borrow.service';
import { LendBorrowController } from './lend-borrow.controller';
import { LendBorrow } from '@database/entities';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LendBorrow]),
    forwardRef(() => GroupsModule),
  ],
  controllers: [LendBorrowController],
  providers: [LendBorrowService],
  exports: [LendBorrowService],
})
export class LendBorrowModule {}
