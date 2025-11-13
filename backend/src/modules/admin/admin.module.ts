import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminController } from './admin.controller';
import { User, Transaction, Budget, Account, AuditLog, Group } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction, Budget, Account, AuditLog, Group])],
  controllers: [AdminController],
  providers: [AdminService, AdminDashboardService],
  exports: [AdminService, AdminDashboardService],
})
export class AdminModule {}
