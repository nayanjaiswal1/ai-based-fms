import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User, Transaction, Budget, Account } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Budget, Account])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
