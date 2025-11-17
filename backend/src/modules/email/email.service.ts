import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EmailConnection, EmailProvider, Transaction, ConnectionStatus, TransactionType, Account, EmailMessage, ParsingStatus } from '@database/entities';
import { ConnectEmailDto, SyncEmailDto, EmailPreferencesDto } from './dto/email.dto';
import { GmailOAuthService } from './gmail-oauth.service';
import { EmailParserService } from './email-parser.service';
import { AiProviderService } from '@modules/ai/ai-provider.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectRepository(EmailConnection)
    private emailConnectionRepository: Repository<EmailConnection>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(EmailMessage)
    private emailMessageRepository: Repository<EmailMessage>,
    private gmailOAuthService: GmailOAuthService,
    private emailParserService: EmailParserService,
    private aiProviderService: AiProviderService,
    private dataSource: DataSource,
  ) {}

  /**
   * Get Gmail OAuth authorization URL
   */
  getGmailAuthUrl() {
    return {
      authUrl: this.gmailOAuthService.getAuthUrl(),
    };
  }

  /**
   * Complete Gmail OAuth connection
   */
  async connectEmail(userId: string, connectDto: ConnectEmailDto) {
    // Check if connection already exists
    const existing = await this.emailConnectionRepository.findOne({
      where: { userId, email: connectDto.email },
    });

    if (existing) {
      throw new BadRequestException('Email connection already exists');
    }

    let connection: EmailConnection;

    if (connectDto.provider === EmailProvider.GMAIL && connectDto.accessToken) {
      // OAuth flow
      connection = this.emailConnectionRepository.create({
        userId,
        provider: connectDto.provider,
        email: connectDto.email,
        accessToken: connectDto.accessToken,
        refreshToken: connectDto.refreshToken,
        tokenExpiresAt: connectDto.tokenExpiresAt,
        status: ConnectionStatus.CONNECTED,
        isActive: true,
        preferences: {
          autoSync: true,
          syncIntervalMinutes: 60,
          parseTransactions: true,
          parseOrders: true,
        },
      });
    } else {
      throw new BadRequestException('Only Gmail OAuth is supported currently');
    }

    return this.emailConnectionRepository.save(connection);
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(userId: string, code: string) {
    try {
      const tokens = await this.gmailOAuthService.getTokensFromCode(code);

      // Check if connection already exists
      let connection = await this.emailConnectionRepository.findOne({
        where: { userId, email: tokens.email },
      });

      if (connection) {
        // Update existing connection
        connection.accessToken = tokens.accessToken;
        connection.refreshToken = tokens.refreshToken;
        connection.tokenExpiresAt = tokens.expiresAt;
        connection.status = ConnectionStatus.CONNECTED;
        connection.isActive = true;
      } else {
        // Create new connection
        connection = this.emailConnectionRepository.create({
          userId,
          provider: EmailProvider.GMAIL,
          email: tokens.email,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.expiresAt,
          status: ConnectionStatus.CONNECTED,
          isActive: true,
          preferences: {
            autoSync: true,
            syncIntervalMinutes: 60,
            parseTransactions: true,
            parseOrders: true,
          },
        });
      }

      return this.emailConnectionRepository.save(connection);
    } catch (error) {
      this.logger.error('OAuth callback failed', error);
      throw new BadRequestException('Failed to connect Gmail account');
    }
  }

  async disconnectEmail(userId: string, connectionId: string) {
    const connection = await this.findConnection(userId, connectionId);
    connection.isActive = false;
    connection.status = ConnectionStatus.ERROR;
    return this.emailConnectionRepository.save(connection);
  }

  async getConnections(userId: string) {
    return this.emailConnectionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Sync emails and extract transactions/orders
   */
  async syncEmails(userId: string, syncDto: SyncEmailDto) {
    const connection = await this.findConnection(userId, syncDto.connectionId);

    if (!connection.isActive) {
      throw new BadRequestException('Email connection is not active');
    }

    if (connection.provider !== EmailProvider.GMAIL) {
      throw new BadRequestException('Only Gmail is supported currently');
    }

    try {
      connection.status = ConnectionStatus.SYNCING;
      await this.emailConnectionRepository.save(connection);

      // Refresh token if needed
      const accessToken = await this.ensureValidToken(connection);

      // Fetch emails using Gmail API
      let emailData;
      if (connection.lastSyncHistoryId) {
        // Incremental sync using history API
        emailData = await this.gmailOAuthService.fetchEmailsSinceHistory(
          accessToken,
          connection.lastSyncHistoryId,
        );
      } else {
        // Full sync
        const query = this.buildGmailQuery(connection.preferences);
        emailData = await this.gmailOAuthService.fetchEmails(accessToken, {
          maxResults: 100,
          query,
        });
      }

      const { messages, historyId } = emailData;
      const extractedTransactions = [];
      const extractedOrders = [];

      // Get user's AI config to track which provider was used
      const aiConfig = await this.aiProviderService.getOrCreateUserConfig(userId);

      // Parse each email
      for (const message of messages) {
        const headers = this.gmailOAuthService.extractHeaders(message);
        const body = this.gmailOAuthService.extractEmailBody(message);

        // Save raw email to database first
        const emailMessage = await this.saveEmailMessage(
          userId,
          connection.id,
          message,
          headers,
          body,
        );

        try {
          // Extract transactions
          if (connection.preferences?.parseTransactions) {
            const transactions = await this.emailParserService.parseTransactions(
              userId,
              headers.from,
              headers.subject,
              body.text,
              body.html,
            );
            extractedTransactions.push(...transactions.map(t => ({ ...t, emailMessageId: emailMessage.id })));

            // Update email message with parsed data
            await this.updateEmailMessageWithParsedData(
              emailMessage.id,
              { transactions },
              aiConfig,
            );
          }

          // Extract orders
          if (connection.preferences?.parseOrders) {
            const orders = await this.emailParserService.parseOrders(
              userId,
              headers.from,
              headers.subject,
              body.text,
              body.html,
            );
            extractedOrders.push(...orders);

            // Update email message with order data
            await this.updateEmailMessageWithParsedData(
              emailMessage.id,
              { orders },
              aiConfig,
            );
          }

          // Mark parsing as successful
          emailMessage.parsingStatus = ParsingStatus.SUCCESS;
          emailMessage.parsedAt = new Date();
          await this.emailMessageRepository.save(emailMessage);
        } catch (error) {
          // Mark parsing as failed
          emailMessage.parsingStatus = ParsingStatus.FAILED;
          emailMessage.parsingError = error.message;
          emailMessage.parseAttempts += 1;
          await this.emailMessageRepository.save(emailMessage);
          this.logger.error(`Failed to parse email ${emailMessage.id}`, error);
        }
      }

      // Save extracted transactions to database
      const savedTransactions = await this.saveExtractedTransactions(
        userId,
        extractedTransactions,
      );

      // Update connection status
      connection.status = ConnectionStatus.CONNECTED;
      connection.lastSyncAt = new Date();
      if (historyId) {
        connection.lastSyncHistoryId = historyId;
      }
      connection.syncStats = {
        totalEmailsProcessed: (connection.syncStats?.totalEmailsProcessed || 0) + messages.length,
        transactionsExtracted: (connection.syncStats?.transactionsExtracted || 0) + extractedTransactions.length,
        ordersExtracted: (connection.syncStats?.ordersExtracted || 0) + extractedOrders.length,
      };
      await this.emailConnectionRepository.save(connection);

      return {
        success: true,
        emailsProcessed: messages.length,
        transactionsExtracted: extractedTransactions.length,
        transactionsSaved: savedTransactions.length,
        ordersExtracted: extractedOrders.length,
        transactions: savedTransactions, // Return saved transactions with IDs
        orders: extractedOrders,
      };
    } catch (error) {
      this.logger.error('Email sync failed', error);
      connection.status = ConnectionStatus.ERROR;
      connection.errorMessage = error.message;
      await this.emailConnectionRepository.save(connection);
      throw new BadRequestException('Email sync failed: ' + error.message);
    }
  }

  /**
   * Ensure access token is valid, refresh if needed
   */
  /**
   * Save raw email message to database
   */
  private async saveEmailMessage(
    userId: string,
    connectionId: string,
    message: any,
    headers: any,
    body: any,
  ): Promise<EmailMessage> {
    // Check if email already exists (avoid duplicates)
    const existing = await this.emailMessageRepository.findOne({
      where: { messageId: message.id },
    });

    if (existing) {
      return existing;
    }

    // Create new email message record
    const emailMessage = this.emailMessageRepository.create({
      userId,
      connectionId,
      messageId: message.id,
      threadId: message.threadId,
      from: headers.from,
      to: headers.to,
      subject: headers.subject,
      emailDate: new Date(headers.date || Date.now()),
      textContent: body.text,
      htmlContent: body.html,
      headers: headers,
      parsingStatus: ParsingStatus.PENDING,
      parseAttempts: 0,
      bodySize: (body.text?.length || 0) + (body.html?.length || 0),
      labels: [],
    });

    return this.emailMessageRepository.save(emailMessage);
  }

  /**
   * Update email message with parsed transaction/order data
   */
  private async updateEmailMessageWithParsedData(
    emailMessageId: string,
    parsedData: { transactions?: any[]; orders?: any[] },
    aiConfig: any,
  ): Promise<void> {
    const emailMessage = await this.emailMessageRepository.findOne({
      where: { id: emailMessageId },
    });

    if (!emailMessage) {
      return;
    }

    // Merge with existing parsed data
    const existingParsedData = emailMessage.parsedData || { transactions: [], orders: [] };

    emailMessage.parsedData = {
      transactions: [
        ...(existingParsedData.transactions || []),
        ...(parsedData.transactions || []),
      ],
      orders: [
        ...(existingParsedData.orders || []),
        ...(parsedData.orders || []),
      ],
      aiProvider: aiConfig.provider,
      aiModel: aiConfig.model,
    };

    // Update status
    if (parsedData.transactions?.length > 0 || parsedData.orders?.length > 0) {
      emailMessage.parsingStatus = ParsingStatus.SUCCESS;
    } else {
      emailMessage.parsingStatus = ParsingStatus.SKIPPED;
    }

    await this.emailMessageRepository.save(emailMessage);
  }

  private async ensureValidToken(connection: EmailConnection): Promise<string> {
    const now = new Date();
    const expiresAt = connection.tokenExpiresAt;

    // If token expires in next 5 minutes, refresh it
    if (!expiresAt || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      if (!connection.refreshToken) {
        throw new BadRequestException('Refresh token not available');
      }

      const refreshed = await this.gmailOAuthService.refreshAccessToken(connection.refreshToken);
      connection.accessToken = refreshed.accessToken;
      connection.tokenExpiresAt = refreshed.expiresAt;
      await this.emailConnectionRepository.save(connection);

      return refreshed.accessToken;
    }

    return connection.accessToken;
  }

  /**
   * Mark transaction in email message as saved
   */
  private async markTransactionAsSaved(
    emailMessageId: string,
    transactionId: string,
  ): Promise<void> {
    const emailMessage = await this.emailMessageRepository.findOne({
      where: { id: emailMessageId },
    });

    if (!emailMessage || !emailMessage.parsedData) {
      return;
    }

    // Update transactions in parsed data to mark as saved
    const parsedData = emailMessage.parsedData;
    if (parsedData.transactions) {
      parsedData.transactions = parsedData.transactions.map((t: any) => ({
        ...t,
        saved: true,
        transactionId,
      }));
    }

    emailMessage.parsedData = parsedData;
    await this.emailMessageRepository.save(emailMessage);
  }

  /**
   * Save extracted transactions to database
   */
  private async saveExtractedTransactions(
    userId: string,
    extractedTransactions: any[],
  ): Promise<Transaction[]> {
    if (!extractedTransactions || extractedTransactions.length === 0) {
      return [];
    }

    // Get user's default account (or create one if doesn't exist)
    let defaultAccount = await this.accountRepository.findOne({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    // If user has no accounts, create a default "Email Sync" account
    if (!defaultAccount) {
      defaultAccount = this.accountRepository.create({
        userId,
        name: 'Email Transactions',
        type: 'wallet' as any,
        balance: 0,
        currency: 'USD',
        description: 'Auto-created account for email-synced transactions',
      });
      defaultAccount = await this.accountRepository.save(defaultAccount);
    }

    const savedTransactions: Transaction[] = [];

    for (const extracted of extractedTransactions) {
      try {
        // Check if transaction already exists (avoid duplicates)
        const exists = await this.transactionRepository.findOne({
          where: {
            userId,
            description: extracted.description,
            amount: extracted.amount,
            date: new Date(extracted.date),
          },
        });

        if (exists) {
          this.logger.log(`Transaction already exists, skipping: ${extracted.description}`);
          continue;
        }

        // Create new transaction
        const transaction = this.transactionRepository.create({
          userId,
          accountId: defaultAccount.id,
          type: extracted.type === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE,
          amount: extracted.amount,
          description: extracted.description,
          date: new Date(extracted.date),
          notes: `Auto-imported from email. Merchant: ${extracted.merchant || 'Unknown'}. Confidence: ${extracted.confidence}`,
          metadata: {
            source: 'email',
            emailMessageId: extracted.emailMessageId, // Link to email message
            ...extracted.metadata,
            merchant: extracted.merchant,
            confidence: extracted.confidence,
          },
          isVerified: extracted.confidence >= 0.85, // Auto-verify high confidence transactions
        });

        const saved = await this.transactionRepository.save(transaction);
        savedTransactions.push(saved);

        // Update email message to mark transaction as saved
        if (extracted.emailMessageId) {
          await this.markTransactionAsSaved(extracted.emailMessageId, saved.id);
        }

        this.logger.log(`Saved email transaction: ${saved.description} - $${saved.amount}`);
      } catch (error) {
        this.logger.error(`Failed to save transaction: ${extracted.description}`, error);
      }
    }

    return savedTransactions;
  }

  /**
   * Build Gmail search query from preferences
   */
  private buildGmailQuery(preferences: any): string {
    const queries: string[] = [];

    // Default: last 30 days
    queries.push('newer_than:30d');

    // Filter by labels
    if (preferences?.filterLabels && preferences.filterLabels.length > 0) {
      const labels = preferences.filterLabels.map(l => `label:${l}`).join(' OR ');
      queries.push(`(${labels})`);
    }

    // Filter by senders
    if (preferences?.filterSenders && preferences.filterSenders.length > 0) {
      const senders = preferences.filterSenders.map(s => `from:${s}`).join(' OR ');
      queries.push(`(${senders})`);
    }

    return queries.join(' ');
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

  /**
   * List emails with parsed data
   */
  async listEmails(userId: string, options?: {
    connectionId?: string;
    parsingStatus?: ParsingStatus;
    hasTransactions?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const query = this.emailMessageRepository
      .createQueryBuilder('email')
      .where('email.userId = :userId', { userId })
      .orderBy('email.emailDate', 'DESC');

    if (options?.connectionId) {
      query.andWhere('email.connectionId = :connectionId', { connectionId: options.connectionId });
    }

    if (options?.parsingStatus) {
      query.andWhere('email.parsingStatus = :status', { status: options.parsingStatus });
    }

    if (options?.hasTransactions) {
      query.andWhere("email.parsedData->>'transactions' IS NOT NULL");
      query.andWhere("jsonb_array_length(email.parsedData->'transactions') > 0");
    }

    query.take(options?.limit || 50);
    query.skip(options?.offset || 0);

    const [emails, total] = await query.getManyAndCount();

    return {
      emails,
      total,
      limit: options?.limit || 50,
      offset: options?.offset || 0,
    };
  }

  /**
   * Get single email with details
   */
  async getEmail(userId: string, emailId: string) {
    const email = await this.emailMessageRepository.findOne({
      where: { id: emailId, userId },
      relations: ['connection'],
    });

    if (!email) {
      throw new NotFoundException('Email not found');
    }

    return email;
  }

  /**
   * Retrigger parsing for a specific email
   */
  async reparseEmail(userId: string, emailId: string) {
    const emailMessage = await this.emailMessageRepository.findOne({
      where: { id: emailId, userId },
      relations: ['connection'],
    });

    if (!emailMessage) {
      throw new NotFoundException('Email not found');
    }

    // Get user's AI config
    const aiConfig = await this.aiProviderService.getOrCreateUserConfig(userId);

    try {
      emailMessage.parsingStatus = ParsingStatus.PROCESSING;
      await this.emailMessageRepository.save(emailMessage);

      // Re-parse transactions
      if (emailMessage.connection.preferences?.parseTransactions) {
        const transactions = await this.emailParserService.parseTransactions(
          userId,
          emailMessage.from,
          emailMessage.subject,
          emailMessage.textContent,
          emailMessage.htmlContent,
        );

        // Update parsed data
        await this.updateEmailMessageWithParsedData(
          emailMessage.id,
          { transactions },
          aiConfig,
        );
      }

      // Re-parse orders
      if (emailMessage.connection.preferences?.parseOrders) {
        const orders = await this.emailParserService.parseOrders(
          userId,
          emailMessage.from,
          emailMessage.subject,
          emailMessage.textContent,
          emailMessage.htmlContent,
        );

        await this.updateEmailMessageWithParsedData(
          emailMessage.id,
          { orders },
          aiConfig,
        );
      }

      emailMessage.parsingStatus = ParsingStatus.SUCCESS;
      emailMessage.parsedAt = new Date();
      emailMessage.parseAttempts += 1;
      await this.emailMessageRepository.save(emailMessage);

      return {
        success: true,
        message: 'Email reparsed successfully',
        email: emailMessage,
      };
    } catch (error) {
      emailMessage.parsingStatus = ParsingStatus.FAILED;
      emailMessage.parsingError = error.message;
      emailMessage.parseAttempts += 1;
      await this.emailMessageRepository.save(emailMessage);

      throw new BadRequestException(`Failed to reparse email: ${error.message}`);
    }
  }

  /**
   * Manually update parsed transaction data
   */
  async updateParsedData(
    userId: string,
    emailId: string,
    updatedData: {
      transactions?: any[];
      orders?: any[];
    },
  ) {
    const emailMessage = await this.emailMessageRepository.findOne({
      where: { id: emailId, userId },
    });

    if (!emailMessage) {
      throw new NotFoundException('Email not found');
    }

    // Store original data for audit
    const originalData = emailMessage.parsedData;

    // Update parsed data
    emailMessage.parsedData = {
      ...emailMessage.parsedData,
      ...updatedData,
    };

    // Track manual edits
    emailMessage.manualEdits = {
      editedBy: userId,
      editedAt: new Date(),
      originalData,
      editedData: updatedData,
    };

    emailMessage.parsingStatus = ParsingStatus.MANUALLY_EDITED;

    await this.emailMessageRepository.save(emailMessage);

    return {
      success: true,
      message: 'Parsed data updated successfully',
      email: emailMessage,
    };
  }

  /**
   * Delete email message
   */
  async deleteEmail(userId: string, emailId: string) {
    const emailMessage = await this.emailMessageRepository.findOne({
      where: { id: emailId, userId },
    });

    if (!emailMessage) {
      throw new NotFoundException('Email not found');
    }

    await this.emailMessageRepository.remove(emailMessage);

    return {
      success: true,
      message: 'Email deleted successfully',
    };
  }

}
