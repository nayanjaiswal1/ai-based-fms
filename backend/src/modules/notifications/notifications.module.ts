import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { RemindersService } from './reminders.service';
import { NotificationsController } from './notifications.controller';
import { RemindersController } from './reminders.controller';
import { NotificationsGateway } from './notifications.gateway';
import { Notification, Reminder } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Reminder])],
  controllers: [NotificationsController, RemindersController],
  providers: [NotificationsService, RemindersService, NotificationsGateway],
  exports: [NotificationsService, RemindersService, NotificationsGateway],
})
export class NotificationsModule {}
