import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailConnection, Transaction } from '@database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([EmailConnection, Transaction])],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
