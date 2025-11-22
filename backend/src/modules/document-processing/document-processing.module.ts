import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentProcessingController } from './document-processing.controller';
import { DocumentProcessingService } from './document-processing.service';
import { DocumentProcessingRequest } from '@database/entities/document-processing-request.entity';
import { DocumentProcessingResponse } from '@database/entities/document-processing-response.entity';
import { User } from '@database/entities';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentProcessingRequest,
      DocumentProcessingResponse,
      User,
    ]),
    AiModule,
  ],
  controllers: [DocumentProcessingController],
  providers: [DocumentProcessingService],
  exports: [DocumentProcessingService],
})
export class DocumentProcessingModule {}
