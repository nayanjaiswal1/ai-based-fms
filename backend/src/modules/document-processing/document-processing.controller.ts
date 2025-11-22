import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { GetUser } from '@common/decorators/get-user.decorator';
import { DocumentProcessingService } from './document-processing.service';
import { DocumentProcessingProvider } from '@database/entities/document-processing-request.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('document-processing')
@UseGuards(JwtAuthGuard)
export class DocumentProcessingController {
  constructor(
    private readonly documentProcessingService: DocumentProcessingService,
  ) {}

  /**
   * Upload and process document
   * POST /api/document-processing/process
   */
  @Post('process')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        // Accept images and PDFs
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
        }
      },
    }),
  )
  async processDocument(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('provider') provider?: DocumentProcessingProvider,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.documentProcessingService.processDocument({
      userId,
      file,
      provider,
    });

    return {
      success: true,
      data: {
        requestId: result.request.id,
        request: result.request,
        response: result.response,
      },
    };
  }

  /**
   * Reprocess document with different provider
   * POST /api/document-processing/:id/reprocess
   */
  @Post(':id/reprocess')
  @HttpCode(HttpStatus.OK)
  async reprocessDocument(
    @GetUser('id') userId: string,
    @Param('id') requestId: string,
    @Body('provider') provider: DocumentProcessingProvider,
  ) {
    if (!provider) {
      throw new Error('Provider is required');
    }

    const result = await this.documentProcessingService.reprocessDocument({
      userId,
      originalRequestId: requestId,
      newProvider: provider,
    });

    return {
      success: true,
      data: {
        comparison: {
          original: result.original,
          new: result.new,
        },
      },
    };
  }

  /**
   * Save user-edited data
   * PATCH /api/document-processing/response/:id/edit
   */
  @Patch('response/:id/edit')
  @HttpCode(HttpStatus.OK)
  async saveEditedData(
    @GetUser('id') userId: string,
    @Param('id') responseId: string,
    @Body('editedData') editedData: Record<string, any>,
  ) {
    if (!editedData) {
      throw new Error('Edited data is required');
    }

    const response = await this.documentProcessingService.saveEditedData({
      userId,
      responseId,
      editedData,
    });

    return {
      success: true,
      data: response,
    };
  }

  /**
   * Get retry history for a request
   * GET /api/document-processing/:id/retry-history
   */
  @Get(':id/retry-history')
  async getRetryHistory(
    @GetUser('id') userId: string,
    @Param('id') requestId: string,
  ) {
    const history = await this.documentProcessingService.getProcessingHistory(
      userId,
      requestId,
    );

    return {
      success: true,
      data: history,
    };
  }

  /**
   * Merge results from multiple providers
   * POST /api/document-processing/merge
   */
  @Post('merge')
  @HttpCode(HttpStatus.OK)
  async mergeResults(
    @GetUser('id') userId: string,
    @Body('responseIds') responseIds: string[],
  ) {
    if (!responseIds || responseIds.length < 2) {
      throw new Error('At least 2 response IDs are required for merging');
    }

    const merged = await this.documentProcessingService.mergeProviderResults(
      userId,
      responseIds,
    );

    return {
      success: true,
      data: merged,
    };
  }

  /**
   * Get user's processing history
   * GET /api/document-processing/history
   */
  @Get('history')
  async getUserHistory(
    @GetUser('id') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const requests = await this.documentProcessingService.getUserHistory(
      userId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );

    return {
      success: true,
      data: requests,
    };
  }

  /**
   * Get specific processing request
   * GET /api/document-processing/:id
   */
  @Get(':id')
  async getRequest(
    @GetUser('id') userId: string,
    @Param('id') requestId: string,
  ) {
    const request = await this.documentProcessingService.getRequest(
      userId,
      requestId,
    );

    return {
      success: true,
      data: request,
    };
  }
}
