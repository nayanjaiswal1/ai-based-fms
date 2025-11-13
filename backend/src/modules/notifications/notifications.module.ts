import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { RemindersService } from './reminders.service';
import { NotificationsController } from './notifications.controller';
import { RemindersController } from './reminders.controller';
import { NotificationsGateway } from './notifications.gateway';
import { Notification, Reminder } from '@database/entities';

@Module({})
export class NotificationsModule {
  static forRoot(): DynamicModule {
    const isWebSocketEnabled = process.env.ENABLE_WEBSOCKET === 'true';

    const providers: Provider[] = [NotificationsService, RemindersService];
    const exports: Array<string | Provider> = [NotificationsService, RemindersService];

    // Conditionally add WebSocket gateway
    if (isWebSocketEnabled) {
      providers.push(NotificationsGateway);
      exports.push(NotificationsGateway);
      console.log('✅ WebSocket Gateway enabled');
    } else {
      console.log('⚠️  WebSocket Gateway disabled - using polling mode');
    }

    return {
      module: NotificationsModule,
      imports: [TypeOrmModule.forFeature([Notification, Reminder]), ConfigModule],
      controllers: [NotificationsController, RemindersController],
      providers,
      exports,
    };
  }
}
