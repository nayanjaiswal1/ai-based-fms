import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiCategorizationFeedbackService } from './ai-categorization-feedback.service';
import { AiController } from './ai.controller';
import { Transaction, Category, Budget, AiCategorizationFeedback } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Category, Budget, AiCategorizationFeedback])],
  controllers: [AiController],
  providers: [AiService, AiCategorizationFeedbackService],
  exports: [AiService, AiCategorizationFeedbackService],
})
export class AiModule {}
