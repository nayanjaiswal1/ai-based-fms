import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiCategorizationFeedbackService } from './ai-categorization-feedback.service';
import { OllamaService } from './ollama.service';
import { AiProviderService } from './ai-provider.service';
import { GeminiService } from './gemini.service';
import { OcrSpaceService } from './ocr-space.service';
import { AiController } from './ai.controller';
import { Transaction, Category, Budget, Tag, AiCategorizationFeedback, AiConfig } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Category, Budget, Tag, AiCategorizationFeedback, AiConfig])],
  controllers: [AiController],
  providers: [
    AiService,
    AiCategorizationFeedbackService,
    OllamaService,
    AiProviderService,
    GeminiService,
    OcrSpaceService,
  ],
  exports: [
    AiService,
    AiCategorizationFeedbackService,
    AiProviderService,
    GeminiService,
    OcrSpaceService,
  ],
})
export class AiModule {}
