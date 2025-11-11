import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Transaction, Category } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Category])],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
