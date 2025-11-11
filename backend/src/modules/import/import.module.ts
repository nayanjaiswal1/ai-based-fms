import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { ImportLog, Transaction } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ImportLog, Transaction])],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
