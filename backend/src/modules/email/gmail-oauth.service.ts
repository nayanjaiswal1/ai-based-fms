import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GmailOAuthService {
  private readonly logger = new Logger(GmailOAuthService.name);
  private oauth2Client: OAuth2Client;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI') ||
      `${this.configService.get<string>('FRONTEND_URL')}/email/callback`;

    if (!clientId || !clientSecret) {
      this.logger.warn('Google OAuth credentials not configured');
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );
  }

  /**
   * Generate OAuth consent URL for Gmail access
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    email: string;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token) {
        throw new BadRequestException('Failed to obtain access token');
      }

      this.oauth2Client.setCredentials(tokens);

      // Get user email
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
        email: userInfo.data.email || '',
      };
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens', error);
      throw new BadRequestException('Invalid authorization code');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresAt: Date;
  }> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token || '',
        expiresAt: new Date(credentials.expiry_date || Date.now() + 3600 * 1000),
      };
    } catch (error) {
      this.logger.error('Failed to refresh access token', error);
      throw new BadRequestException('Failed to refresh access token');
    }
  }

  /**
   * Get Gmail client with authentication
   */
  getGmailClient(accessToken: string): gmail_v1.Gmail {
    const oauth = new google.auth.OAuth2();
    oauth.setCredentials({ access_token: accessToken });

    return google.gmail({ version: 'v1', auth: oauth });
  }

  /**
   * Fetch emails from Gmail
   */
  async fetchEmails(
    accessToken: string,
    options: {
      maxResults?: number;
      query?: string;
      labelIds?: string[];
      pageToken?: string;
    } = {},
  ): Promise<{
    messages: any[];
    nextPageToken?: string;
    historyId?: string;
  }> {
    try {
      const gmail = this.getGmailClient(accessToken);

      // Default query: emails from last 30 days
      const defaultQuery = options.query || 'newer_than:30d';

      const response = await gmail.users.messages.list({
        userId: 'me',
        q: defaultQuery,
        maxResults: options.maxResults || 100,
        labelIds: options.labelIds,
        pageToken: options.pageToken,
      });

      const messages = response.data.messages || [];
      const detailedMessages = [];

      // Batch fetch message details
      for (const message of messages.slice(0, 50)) { // Limit to 50 to avoid quota issues
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'full',
          });
          detailedMessages.push(detail.data);
        } catch (error) {
          this.logger.warn(`Failed to fetch message ${message.id}`, error);
        }
      }

      return {
        messages: detailedMessages,
        nextPageToken: response.data.nextPageToken,
        historyId: detailedMessages[0]?.historyId,
      };
    } catch (error) {
      this.logger.error('Failed to fetch emails from Gmail', error);
      throw new BadRequestException('Failed to fetch emails');
    }
  }

  /**
   * Fetch emails since last sync using history API (more efficient)
   */
  async fetchEmailsSinceHistory(
    accessToken: string,
    historyId: string,
  ): Promise<{
    messages: any[];
    historyId?: string;
  }> {
    try {
      const gmail = this.getGmailClient(accessToken);

      const response = await gmail.users.history.list({
        userId: 'me',
        startHistoryId: historyId,
        historyTypes: ['messageAdded'],
      });

      const history = response.data.history || [];
      const messages = [];

      for (const item of history) {
        if (item.messagesAdded) {
          for (const added of item.messagesAdded) {
            if (added.message?.id) {
              try {
                const detail = await gmail.users.messages.get({
                  userId: 'me',
                  id: added.message.id,
                  format: 'full',
                });
                messages.push(detail.data);
              } catch (error) {
                this.logger.warn(`Failed to fetch message ${added.message.id}`, error);
              }
            }
          }
        }
      }

      return {
        messages,
        historyId: response.data.historyId,
      };
    } catch (error) {
      this.logger.error('Failed to fetch email history', error);
      // If history is invalid, fall back to full sync
      return this.fetchEmails(accessToken, { maxResults: 50 });
    }
  }

  /**
   * Extract email body from Gmail message
   */
  extractEmailBody(message: gmail_v1.Schema$Message): { text: string; html: string } {
    let text = '';
    let html = '';

    const extractPart = (part: gmail_v1.Schema$MessagePart) => {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html += Buffer.from(part.body.data, 'base64').toString('utf-8');
      }

      if (part.parts) {
        part.parts.forEach(extractPart);
      }
    };

    if (message.payload) {
      extractPart(message.payload);
    }

    return { text, html };
  }

  /**
   * Extract headers from Gmail message
   */
  extractHeaders(message: gmail_v1.Schema$Message): {
    from: string;
    to: string;
    subject: string;
    date: string;
  } {
    const headers = message.payload?.headers || [];

    const getHeader = (name: string) => {
      const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase());
      return header?.value || '';
    };

    return {
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
    };
  }
}
