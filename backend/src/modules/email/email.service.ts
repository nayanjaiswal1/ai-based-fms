import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConnection, EmailProvider, Transaction } from '@database/entities';
import { ConnectEmailDto, SyncEmailDto, EmailPreferencesDto } from './dto/email.dto';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailConnection)
    private emailConnectionRepository: Repository<EmailConnection>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async connectEmail(userId: string, connectDto: ConnectEmailDto) {
    // Check if connection already exists
    const existing = await this.emailConnectionRepository.findOne({
      where: { userId, email: connectDto.email },
    });

    if (existing) {
      throw new BadRequestException('Email connection already exists');
    }

    // Create connection
    const connection = this.emailConnectionRepository.create({
      ...connectDto,
      userId,
      isActive: true,
      lastSyncAt: null,
    });

    // Test connection
    try {
      await this.testConnection(connection);
      connection.status = 'connected';
    } catch (error) {
      connection.status = 'error';
      connection.errorMessage = error.message;
    }

    return this.emailConnectionRepository.save(connection);
  }

  async disconnectEmail(userId: string, connectionId: string) {
    const connection = await this.findConnection(userId, connectionId);
    connection.isActive = false;
    connection.status = 'disconnected';
    return this.emailConnectionRepository.save(connection);
  }

  async getConnections(userId: string) {
    return this.emailConnectionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async syncEmails(userId: string, syncDto: SyncEmailDto) {
    const connection = await this.findConnection(userId, syncDto.connectionId);

    if (!connection.isActive) {
      throw new BadRequestException('Email connection is not active');
    }

    try {
      connection.status = 'syncing';
      await this.emailConnectionRepository.save(connection);

      const emails = await this.fetchEmails(connection, syncDto.daysBack || 7);
      const extractedTransactions = [];

      for (const email of emails) {
        const transactions = await this.extractTransactionsFromEmail(email, userId);
        extractedTransactions.push(...transactions);
      }

      connection.status = 'connected';
      connection.lastSyncAt = new Date();
      await this.emailConnectionRepository.save(connection);

      return {
        success: true,
        emailsProcessed: emails.length,
        transactionsExtracted: extractedTransactions.length,
        transactions: extractedTransactions,
      };
    } catch (error) {
      connection.status = 'error';
      connection.errorMessage = error.message;
      await this.emailConnectionRepository.save(connection);
      throw new BadRequestException('Email sync failed: ' + error.message);
    }
  }

  async updatePreferences(userId: string, connectionId: string, preferencesDto: EmailPreferencesDto) {
    const connection = await this.findConnection(userId, connectionId);

    connection.preferences = {
      ...connection.preferences,
      ...preferencesDto,
    };

    return this.emailConnectionRepository.save(connection);
  }

  async getSyncStatus(userId: string, connectionId: string) {
    const connection = await this.findConnection(userId, connectionId);

    return {
      connectionId: connection.id,
      status: connection.status,
      lastSyncAt: connection.lastSyncAt,
      isActive: connection.isActive,
      provider: connection.provider,
      email: connection.email,
    };
  }

  private async findConnection(userId: string, connectionId: string) {
    const connection = await this.emailConnectionRepository.findOne({
      where: { id: connectionId, userId },
    });

    if (!connection) {
      throw new NotFoundException('Email connection not found');
    }

    return connection;
  }

  private async testConnection(connection: EmailConnection): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: connection.email,
        password: connection.password || '',
        host: connection.imapHost || this.getImapHost(connection.provider),
        port: connection.imapPort || 993,
        tls: true,
        authTimeout: 10000,
      });

      imap.once('ready', () => {
        imap.end();
        resolve(true);
      });

      imap.once('error', (err) => {
        reject(err);
      });

      imap.connect();
    });
  }

  private async fetchEmails(connection: EmailConnection, daysBack: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const emails = [];
      const imap = new Imap({
        user: connection.email,
        password: connection.password || connection.accessToken || '',
        host: connection.imapHost || this.getImapHost(connection.provider),
        port: connection.imapPort || 993,
        tls: true,
      });

      imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
          if (err) {
            reject(err);
            return;
          }

          const searchDate = new Date();
          searchDate.setDate(searchDate.getDate() - daysBack);

          imap.search(['ALL', ['SINCE', searchDate]], (err, results) => {
            if (err) {
              reject(err);
              return;
            }

            if (results.length === 0) {
              imap.end();
              resolve([]);
              return;
            }

            const fetch = imap.fetch(results, { bodies: '' });

            fetch.on('message', (msg, seqno) => {
              msg.on('body', (stream, info) => {
                simpleParser(stream, (err, parsed) => {
                  if (!err) {
                    emails.push({
                      from: parsed.from?.text,
                      subject: parsed.subject,
                      text: parsed.text,
                      html: parsed.html,
                      date: parsed.date,
                    });
                  }
                });
              });
            });

            fetch.once('end', () => {
              imap.end();
              resolve(emails);
            });

            fetch.once('error', (err) => {
              reject(err);
            });
          });
        });
      });

      imap.once('error', (err) => {
        reject(err);
      });

      imap.connect();
    });
  }

  private async extractTransactionsFromEmail(email: any, userId: string): Promise<any[]> {
    const transactions = [];
    const text = email.text || '';
    const subject = email.subject || '';

    // Simple keyword matching for transaction detection
    const transactionKeywords = [
      'purchase', 'payment', 'transaction', 'charged', 'paid',
      'receipt', 'invoice', 'bill', 'statement', 'balance',
    ];

    const hasTransactionKeyword = transactionKeywords.some(keyword =>
      text.toLowerCase().includes(keyword) || subject.toLowerCase().includes(keyword)
    );

    if (!hasTransactionKeyword) {
      return [];
    }

    // Extract amounts (simple pattern matching)
    const amountPattern = /\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;
    const amounts = text.match(amountPattern);

    // Extract dates
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}/g;
    const dates = text.match(datePattern);

    // Extract merchant names (from email sender or subject)
    const merchantName = email.from?.replace(/<.*>/, '').trim() || 'Unknown';

    if (amounts && amounts.length > 0) {
      const amount = parseFloat(amounts[0].replace(/[$,]/g, ''));
      const date = dates && dates.length > 0 ? dates[0] : new Date().toISOString().split('T')[0];

      transactions.push({
        description: `${subject.substring(0, 100)}`,
        amount,
        date: this.parseEmailDate(date),
        type: 'expense',
        source: 'email',
        metadata: {
          from: email.from,
          subject: email.subject,
          merchant: merchantName,
          extractedAt: new Date().toISOString(),
        },
      });
    }

    return transactions;
  }

  private getImapHost(provider: EmailProvider): string {
    const hosts = {
      [EmailProvider.GMAIL]: 'imap.gmail.com',
      [EmailProvider.OUTLOOK]: 'outlook.office365.com',
      [EmailProvider.YAHOO]: 'imap.mail.yahoo.com',
      [EmailProvider.CUSTOM]: 'imap.gmail.com', // fallback
    };

    return hosts[provider] || 'imap.gmail.com';
  }

  private parseEmailDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // ignore
    }
    return new Date().toISOString().split('T')[0];
  }
}
