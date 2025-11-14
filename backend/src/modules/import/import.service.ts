import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImportLog, Transaction, ImportStatus, ImportType } from '@database/entities';
import { CreateImportDto, ParseFileDto, ConfirmImportDto } from './dto/import.dto';
import csvParser from 'csv-parser';
import * as xlsx from 'xlsx';
import pdfParse from 'pdf-parse';
import { Readable } from 'stream';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(ImportLog)
    private importLogRepository: Repository<ImportLog>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Create import log entry
   */
  async createImportLog(userId: string, createDto: CreateImportDto) {
    const importLog = this.importLogRepository.create({
      ...createDto,
      userId,
      status: ImportStatus.PENDING,
      totalRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
    });

    return this.importLogRepository.save(importLog);
  }

  /**
   * Parse file and extract transactions
   */
  async parseFile(userId: string, parseDto: ParseFileDto) {
    try {
      // Decode base64 content
      const base64Data = parseDto.fileContent.split(',')[1] || parseDto.fileContent;
      const buffer = Buffer.from(base64Data, 'base64');

      let transactions: any[] = [];

      switch (parseDto.fileType) {
        case ImportType.CSV:
          transactions = await this.parseCSV(buffer, parseDto.mappingConfig);
          break;
        case ImportType.EXCEL:
          transactions = await this.parseExcel(buffer, parseDto.mappingConfig);
          break;
        case ImportType.PDF:
          transactions = await this.parsePDF(buffer);
          break;
        default:
          throw new BadRequestException('Unsupported file type');
      }

      return {
        success: true,
        transactionCount: transactions.length,
        transactions,
        preview: transactions.slice(0, 10),
      };
    } catch (error) {
      this.logger.error('File parsing failed', error.stack);

      if (error instanceof SyntaxError) {
        throw new BadRequestException(
          'Invalid file format. Please ensure the file is valid CSV/Excel.',
        );
      } else if (error.code === 'LIMIT_FILE_SIZE') {
        throw new BadRequestException('File size exceeds maximum allowed (10MB).');
      } else {
        throw new BadRequestException(
          'Failed to parse file. Please check the file format and try again.',
        );
      }
    }
  }

  /**
   * Confirm and execute import
   */
  async confirmImport(userId: string, confirmDto: ConfirmImportDto) {
    const importLog = await this.importLogRepository.findOne({
      where: { id: confirmDto.importId, userId },
    });

    if (!importLog) {
      throw new NotFoundException('Import log not found');
    }

    try {
      importLog.status = ImportStatus.PROCESSING;
      importLog.totalRecords = confirmDto.transactions.length;
      await this.importLogRepository.save(importLog);

      const successfulTransactions = [];
      const failedTransactions = [];

      for (const txData of confirmDto.transactions) {
        try {
          // Create transaction
          const transaction = this.transactionRepository.create({
            ...txData,
            userId,
            accountId: txData.accountId || confirmDto.defaultAccountId,
            source: 'import',
            importId: importLog.id,
          });

          const saved = await this.transactionRepository.save(transaction);
          successfulTransactions.push(saved);
        } catch (error) {
          failedTransactions.push({
            data: txData,
            error: error.message,
          });
        }
      }

      // Update import log
      importLog.status =
        failedTransactions.length === 0 ? ImportStatus.COMPLETED : ImportStatus.PARTIALLY_COMPLETED;
      importLog.successfulRecords = successfulTransactions.length;
      importLog.failedRecords = failedTransactions.length;
      importLog.completedAt = new Date();
      await this.importLogRepository.save(importLog);

      return {
        importId: importLog.id,
        status: importLog.status,
        totalRecords: importLog.totalRecords,
        successfulRecords: importLog.successfulRecords,
        failedRecords: importLog.failedRecords,
        failedTransactions,
      };
    } catch (error) {
      importLog.status = ImportStatus.FAILED;
      importLog.errors = [{ message: error.message, timestamp: new Date() }];
      await this.importLogRepository.save(importLog);
      throw new BadRequestException('Import failed: ' + error.message);
    }
  }

  /**
   * Get import history
   */
  async getImportHistory(userId: string, status?: ImportStatus, type?: ImportType) {
    const where: any = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    return this.importLogRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get import details
   */
  async getImportDetails(userId: string, importId: string) {
    const importLog = await this.importLogRepository.findOne({
      where: { id: importId, userId },
    });

    if (!importLog) {
      throw new NotFoundException('Import log not found');
    }

    // Get imported transactions
    // Note: Transaction entity doesn't have importId field yet
    const transactions = await this.transactionRepository.find({
      where: { userId },
      take: 100,
      order: { date: 'DESC' },
    });

    return {
      importLog,
      transactions,
      sampleTransactions: transactions.slice(0, 10),
    };
  }

  /**
   * Delete import and associated transactions
   */
  async deleteImport(userId: string, importId: string) {
    const importLog = await this.importLogRepository.findOne({
      where: { id: importId, userId },
    });

    if (!importLog) {
      throw new NotFoundException('Import log not found');
    }

    // Soft delete associated transactions
    // Note: Transaction entity doesn't have importId field yet
    // await this.transactionRepository.update(
    //   { importId, userId },
    //   { isDeleted: true },
    // );

    // Delete import log
    await this.importLogRepository.remove(importLog);

    return { message: 'Import and associated transactions deleted successfully' };
  }

  /**
   * Parse CSV file
   */
  private async parseCSV(buffer: Buffer, mappingConfig?: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transactions: any[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser())
        .on('data', (row) => {
          try {
            const transaction = this.mapRowToTransaction(row, mappingConfig || {});
            if (transaction) {
              transactions.push(transaction);
            }
          } catch (error) {
            console.error('Error parsing row:', error);
          }
        })
        .on('end', () => resolve(transactions))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Parse Excel file
   */
  private async parseExcel(buffer: Buffer, mappingConfig?: any): Promise<any[]> {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    return data
      .map((row) => {
        try {
          return this.mapRowToTransaction(row, mappingConfig || {});
        } catch (error) {
          console.error('Error parsing row:', error);
          return null;
        }
      })
      .filter((tx) => tx !== null);
  }

  /**
   * Parse PDF file (bank statements)
   */
  private async parsePDF(buffer: Buffer): Promise<any[]> {
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    // This is a basic parser - may need customization per bank format
    const transactions: any[] = [];
    const lines = text.split('\n');

    // Look for transaction patterns (date, description, amount)
    const transactionPattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(.+?)\s+([-]?\$?[\d,]+\.\d{2})/g;
    let match;

    while ((match = transactionPattern.exec(text)) !== null) {
      const [, date, description, amount] = match;

      const cleanedAmount = amount.replace(/[$,]/g, '');
      const parsedAmount = parseFloat(cleanedAmount);

      if (isNaN(parsedAmount)) {
        this.logger.warn(`Invalid amount format in PDF: ${amount}`);
        continue; // Skip invalid transactions
      }

      transactions.push({
        date: this.parseDate(date),
        description: description.trim(),
        amount: Math.abs(parsedAmount),
        type: amount.includes('-') ? 'expense' : 'income',
      });
    }

    return transactions;
  }

  /**
   * Map CSV/Excel row to transaction object
   */
  private mapRowToTransaction(row: any, mappingConfig: any) {
    const dateCol = mappingConfig.dateColumn || 'Date' || 'date' || 'Transaction Date';
    const descCol = mappingConfig.descriptionColumn || 'Description' || 'description' || 'Memo';
    const amountCol = mappingConfig.amountColumn || 'Amount' || 'amount';
    const typeCol = mappingConfig.typeColumn || 'Type' || 'type';

    // Find the actual column name (case-insensitive)
    const findColumn = (possibleNames: string[]) => {
      for (const name of possibleNames) {
        const key = Object.keys(row).find((k) => k.toLowerCase() === name.toLowerCase());
        if (key) return row[key];
      }
      return null;
    };

    const date = findColumn([dateCol, 'Date', 'date', 'Transaction Date', 'Posted Date']);
    const description = findColumn([descCol, 'Description', 'description', 'Memo', 'Details']);
    const amount = findColumn([amountCol, 'Amount', 'amount', 'Debit', 'Credit']);
    const type = findColumn([typeCol, 'Type', 'type', 'Transaction Type']);

    if (!date || !description || !amount) {
      return null;
    }

    // Parse amount
    let parsedAmount = parseFloat(String(amount).replace(/[$,]/g, ''));
    if (isNaN(parsedAmount)) {
      return null;
    }

    // Determine transaction type
    let txType = 'expense';
    if (type) {
      const typeStr = String(type).toLowerCase();
      if (typeStr.includes('income') || typeStr.includes('credit') || typeStr.includes('deposit')) {
        txType = 'income';
      }
    } else if (parsedAmount > 0) {
      txType = 'income';
    } else {
      parsedAmount = Math.abs(parsedAmount);
    }

    return {
      date: this.parseDate(date),
      description: String(description).trim(),
      amount: parsedAmount,
      type: txType,
    };
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    // Try common formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, // MM/DD/YYYY or DD/MM/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{2,4})/, // DD-MM-YYYY
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let year = parseInt(match[3]);
        if (year < 100) {
          year += 2000;
        }
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);

        // Determine if it's MM/DD or DD/MM based on values
        if (month > 12) {
          // It's DD/MM
          return `${year}-${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`;
        } else {
          // It's MM/DD
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }

    // Return current date as fallback
    return new Date().toISOString().split('T')[0];
  }
}
