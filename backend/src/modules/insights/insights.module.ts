import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Transaction, Budget, Category } from '@database/entities';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { InsightsProcessor } from './insights.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Budget, Category]),
    BullModule.registerQueue({
      name: 'insights',
    }),
  ],
  controllers: [InsightsController],
  providers: [InsightsService, InsightsProcessor],
  exports: [InsightsService],
})
export class InsightsModule {}
