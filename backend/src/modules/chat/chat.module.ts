import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Transaction, Category } from '@database/entities';
import { DocumentProcessingModule } from '../document-processing/document-processing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Category]),
    DocumentProcessingModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
