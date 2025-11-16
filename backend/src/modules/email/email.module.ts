import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { GmailOAuthService } from './gmail-oauth.service';
import { EmailParserService } from './email-parser.service';
import { EmailConnection, Transaction, Account, EmailMessage } from '@database/entities';
import { AiModule } from '@modules/ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailConnection, Transaction, Account, EmailMessage]),
    ConfigModule,
    AiModule,
  ],
  controllers: [EmailController],
  providers: [EmailService, GmailOAuthService, EmailParserService],
  exports: [EmailService],
})
export class EmailModule {}
