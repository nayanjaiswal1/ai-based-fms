import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardPreferencesController } from './dashboard-preferences.controller';
import { DashboardPreferencesService } from './dashboard-preferences.service';
import { UserDashboardPreference } from '../../database/entities/user-dashboard-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserDashboardPreference])],
  controllers: [DashboardPreferencesController],
  providers: [DashboardPreferencesService],
  exports: [DashboardPreferencesService],
})
export class DashboardPreferencesModule {}
