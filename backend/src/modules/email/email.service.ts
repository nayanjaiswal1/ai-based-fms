import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EmailConnection, EmailProvider, Transaction, ConnectionStatus, TransactionType, Account } from '@database/entities';
import { ConnectEmailDto, SyncEmailDto, EmailPreferencesDto } from './dto/email.dto';
import { GmailOAuthService } from './gmail-oauth.service';
import { EmailParserService } from './email-parser.service';

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
    private gmailOAuthService: GmailOAuthService,
    private emailParserService: EmailParserService,
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

      // Parse each email
      for (const message of messages) {
        const headers = this.gmailOAuthService.extractHeaders(message);
        const body = this.gmailOAuthService.extractEmailBody(message);

        // Extract transactions
        if (connection.preferences?.parseTransactions) {
          const transactions = await this.emailParserService.parseTransactions(
            userId,
            headers.from,
            headers.subject,
            body.text,
            body.html,
          );
          extractedTransactions.push(...transactions);
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
            ...extracted.metadata,
            merchant: extracted.merchant,
            confidence: extracted.confidence,
          },
          isVerified: extracted.confidence >= 0.85, // Auto-verify high confidence transactions
        });

        const saved = await this.transactionRepository.save(transaction);
        savedTransactions.push(saved);

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

}
