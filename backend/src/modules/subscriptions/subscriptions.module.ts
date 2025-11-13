import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { AddonsService } from './addons.service';
import { Subscription } from '../../database/entities/subscription.entity';
import { UsageTracking } from '../../database/entities/usage-tracking.entity';
import { Invoice } from '../../database/entities/invoice.entity';
import { Addon } from '../../database/entities/addon.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      UsageTracking,
      Invoice,
      Addon,
      User,
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, AddonsService],
  exports: [SubscriptionsService, AddonsService],
})
export class SubscriptionsModule {}
