import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { JobMonitorController } from './job-monitor.controller';
import { JobMonitorService } from './job-monitor.service';
import { JobSchedulerService } from './schedulers/job-scheduler.service';
import { Job, JobLog, User } from '@database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobLog, User]),
    BullModule.registerQueue(
      { name: 'reports' },
      { name: 'insights' },
    ),
    ScheduleModule.forRoot(),
  ],
  controllers: [JobMonitorController],
  providers: [JobMonitorService, JobSchedulerService],
  exports: [JobMonitorService],
})
export class JobMonitorModule {}
