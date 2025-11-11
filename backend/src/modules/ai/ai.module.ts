import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Transaction, Category, Budget } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Category, Budget])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
