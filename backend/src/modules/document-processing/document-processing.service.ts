import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DocumentProcessingRequest, DocumentProcessingProvider, DocumentProcessingStatus } from '@database/entities/document-processing-request.entity';
import { DocumentProcessingResponse } from '@database/entities/document-processing-response.entity';
import { User } from '@database/entities';
import { AiService } from '../ai/ai.service';
import { GeminiService } from '../ai/gemini.service';
import { OcrSpaceService } from '../ai/ocr-space.service';
import * as fs from 'fs';
import * as path from 'path';

export interface ProcessDocumentDto {
  userId: string;
  file: Express.Multer.File;
  provider?: DocumentProcessingProvider;
}

export interface ReprocessDocumentDto {
  userId: string;
  originalRequestId: string;
  newProvider: DocumentProcessingProvider;
}

export interface SaveEditedDataDto {
  userId: string;
  responseId: string;
  editedData: Record<string, any>;
}

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);

  constructor(
    @InjectRepository(DocumentProcessingRequest)
    private requestRepository: Repository<DocumentProcessingRequest>,
    @InjectRepository(DocumentProcessingResponse)
    private responseRepository: Repository<DocumentProcessingResponse>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private aiService: AiService,
    private geminiService: GeminiService,
    private ocrSpaceService: OcrSpaceService,
  ) {}

  /**
   * Process document with selected provider
   */
  async processDocument(dto: ProcessDocumentDto): Promise<{
    request: DocumentProcessingRequest;
    response: DocumentProcessingResponse;
  }> {
    const { userId, file, provider: requestedProvider } = dto;

    // Get user and subscription tier
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Determine provider based on tier and request
    const provider = await this.determineProvider(user, requestedProvider);

    // Create processing request
    const request = this.requestRepository.create({
      userId,
      fileName: `${Date.now()}-${file.originalname}`,
      originalFileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      provider,
      status: DocumentProcessingStatus.PENDING,
      subscriptionTier: user.subscriptionTier || 'FREE',
      providerHistory: [provider],
    });

    await this.requestRepository.save(request);

    try {
      // Update status to processing
      request.status = DocumentProcessingStatus.PROCESSING;
      await this.requestRepository.save(request);

      // Process with selected provider
      const result = await this.processWithProvider(provider, file);

      // Create response record
      const response = this.responseRepository.create({
        requestId: request.id,
        provider,
        responsePayload: result.responsePayload || {},
        extractedData: result.extractedData,
        confidence: result.confidence,
        processingTimeMs: result.processingTimeMs,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
      });

      await this.responseRepository.save(response);

      // Update request status
      request.status = DocumentProcessingStatus.COMPLETED;
      await this.requestRepository.save(request);

      return { request, response };
    } catch (error) {
      this.logger.error(`Document processing failed for request ${request.id}`, error);

      // Update request with error
      request.status = DocumentProcessingStatus.FAILED;
      request.errorMessage = error.message;
      await this.requestRepository.save(request);

      throw error;
    }
  }

  /**
   * Reprocess document with different provider
   */
  async reprocessDocument(dto: ReprocessDocumentDto): Promise<{
    original: DocumentProcessingResponse;
    new: DocumentProcessingResponse;
  }> {
    const { userId, originalRequestId, newProvider } = dto;

    // Fetch original request
    const originalRequest = await this.requestRepository.findOne({
      where: { id: originalRequestId },
      relations: ['responses'],
    });

    if (!originalRequest) {
      throw new NotFoundException('Original request not found');
    }

    // Verify user owns the request
    if (originalRequest.userId !== userId) {
      throw new ForbiddenException('You do not have access to this request');
    }

    // Check if file still exists
    if (!fs.existsSync(originalRequest.filePath)) {
      throw new BadRequestException('Original file no longer exists');
    }

    // Get user for provider validation
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate provider permissions
    await this.validateProviderPermissions(user, newProvider);

    // Check if already processed with this provider
    if (originalRequest.providerHistory?.includes(newProvider)) {
      throw new BadRequestException(`Document already processed with ${newProvider}`);
    }

    // Create new request linked to original
    const fileBuffer = fs.readFileSync(originalRequest.filePath);
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: originalRequest.originalFileName,
      encoding: '7bit',
      mimetype: originalRequest.mimeType,
      size: originalRequest.fileSize,
      buffer: fileBuffer,
      path: originalRequest.filePath,
      destination: path.dirname(originalRequest.filePath),
      filename: path.basename(originalRequest.filePath),
      stream: null,
    } as Express.Multer.File;

    const newRequest = this.requestRepository.create({
      userId,
      fileName: originalRequest.fileName,
      originalFileName: originalRequest.originalFileName,
      filePath: originalRequest.filePath,
      fileSize: originalRequest.fileSize,
      mimeType: originalRequest.mimeType,
      provider: newProvider,
      status: DocumentProcessingStatus.PENDING,
      subscriptionTier: user.subscriptionTier || 'FREE',
      originalRequestId: originalRequest.id,
      retryCount: (originalRequest.retryCount || 0) + 1,
      providerHistory: [...(originalRequest.providerHistory || []), newProvider],
    });

    await this.requestRepository.save(newRequest);

    try {
      // Process with new provider
      newRequest.status = DocumentProcessingStatus.PROCESSING;
      await this.requestRepository.save(newRequest);

      const result = await this.processWithProvider(newProvider, file);

      // Create new response
      const newResponse = this.responseRepository.create({
        requestId: newRequest.id,
        provider: newProvider,
        responsePayload: result.responsePayload || {},
        extractedData: result.extractedData,
        confidence: result.confidence,
        processingTimeMs: result.processingTimeMs,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
      });

      await this.responseRepository.save(newResponse);

      // Update request status
      newRequest.status = DocumentProcessingStatus.COMPLETED;
      await this.requestRepository.save(newRequest);

      // Get original response for comparison
      const originalResponse = originalRequest.responses?.[0] || await this.responseRepository.findOne({
        where: { requestId: originalRequestId },
        order: { completedAt: 'DESC' },
      });

      if (!originalResponse) {
        throw new NotFoundException('Original response not found');
      }

      return {
        original: originalResponse,
        new: newResponse,
      };
    } catch (error) {
      this.logger.error(`Reprocessing failed for request ${newRequest.id}`, error);

      newRequest.status = DocumentProcessingStatus.FAILED;
      newRequest.errorMessage = error.message;
      await this.requestRepository.save(newRequest);

      throw error;
    }
  }

  /**
   * Save user-edited data
   */
  async saveEditedData(dto: SaveEditedDataDto): Promise<DocumentProcessingResponse> {
    const { userId, responseId, editedData } = dto;

    const response = await this.responseRepository.findOne({
      where: { id: responseId },
      relations: ['request'],
    });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    // Verify user owns the response
    if (response.request.userId !== userId) {
      throw new ForbiddenException('You do not have access to this response');
    }

    // Calculate which fields were edited
    const editedFields = this.calculateEditedFields(
      response.extractedData,
      editedData,
    );

    // Update response
    response.userEditedData = editedData;
    response.wasEdited = true;
    response.editedFields = editedFields;
    response.editedAt = new Date();
    response.editedByUserId = userId;

    await this.responseRepository.save(response);

    return response;
  }

  /**
   * Get processing history for a request (including all retries)
   */
  async getProcessingHistory(userId: string, requestId: string): Promise<{
    original: DocumentProcessingRequest;
    attempts: Array<{
      request: DocumentProcessingRequest;
      response: DocumentProcessingResponse;
    }>;
  }> {
    // Find the original request
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['originalRequest', 'retryAttempts', 'responses'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Verify user owns the request
    if (request.userId !== userId) {
      throw new ForbiddenException('You do not have access to this request');
    }

    // Determine the root request
    const rootRequest = request.originalRequest || request;

    // Fetch all retry attempts
    const allAttempts = await this.requestRepository.find({
      where: [
        { id: rootRequest.id },
        { originalRequestId: rootRequest.id },
      ],
      relations: ['responses'],
      order: { createdAt: 'ASC' },
    });

    const attempts = allAttempts.map(req => ({
      request: req,
      response: req.responses?.[0] || null,
    }));

    return {
      original: rootRequest,
      attempts,
    };
  }

  /**
   * Merge results from multiple providers
   */
  async mergeProviderResults(
    userId: string,
    responseIds: string[],
  ): Promise<{
    merged: Record<string, any>;
    sources: Record<string, string>;
    confidence: number;
  }> {
    const responses = await this.responseRepository.find({
      where: responseIds.map(id => ({ id })),
      relations: ['request'],
    });

    // Verify all responses exist and user owns them
    if (responses.length !== responseIds.length) {
      throw new NotFoundException('Some responses not found');
    }

    for (const response of responses) {
      if (response.request.userId !== userId) {
        throw new ForbiddenException('You do not have access to all responses');
      }
    }

    // Merge data by selecting highest confidence value for each field
    const merged: Record<string, any> = {};
    const sources: Record<string, string> = {};
    let totalConfidence = 0;

    const fields = [
      'merchantName',
      'amount',
      'currency',
      'date',
      'category',
      'items',
      'total',
      'tax',
      'tip',
      'paymentMethod',
    ];

    for (const field of fields) {
      let bestValue = null;
      let bestConfidence = 0;
      let bestProvider = '';

      for (const response of responses) {
        const data = response.userEditedData || response.extractedData;
        const value = data[field];

        if (value !== null && value !== undefined) {
          const confidence = response.confidence || 0;
          if (confidence > bestConfidence) {
            bestValue = value;
            bestConfidence = confidence;
            bestProvider = response.provider;
          }
        }
      }

      if (bestValue !== null) {
        merged[field] = bestValue;
        sources[field] = bestProvider;
        totalConfidence += bestConfidence;
      }
    }

    const averageConfidence = totalConfidence / fields.length;

    return {
      merged,
      sources,
      confidence: averageConfidence,
    };
  }

  /**
   * Process document with specific provider
   */
  private async processWithProvider(
    provider: DocumentProcessingProvider,
    file: Express.Multer.File,
  ): Promise<{
    extractedData: Record<string, any>;
    confidence: number;
    processingTimeMs: number;
    tokensUsed?: number;
    cost: number;
    responsePayload?: Record<string, any>;
  }> {
    const fileBuffer = file.buffer || fs.readFileSync(file.path);

    switch (provider) {
      case DocumentProcessingProvider.OPENAI:
        return this.processWithOpenAI(file.path, fileBuffer, file.mimetype);

      case DocumentProcessingProvider.GEMINI:
        const geminiResult = await this.geminiService.processDocument(
          file.path,
          fileBuffer,
          file.mimetype,
        );
        return {
          extractedData: geminiResult.extractedData,
          confidence: geminiResult.confidence,
          processingTimeMs: geminiResult.processingTimeMs,
          tokensUsed: geminiResult.tokensUsed,
          cost: geminiResult.cost,
        };

      case DocumentProcessingProvider.OCR_SPACE:
        const ocrResult = await this.ocrSpaceService.processDocument(
          file.path,
          fileBuffer,
          file.mimetype,
        );
        return {
          extractedData: ocrResult.extractedData,
          confidence: ocrResult.confidence,
          processingTimeMs: ocrResult.processingTimeMs,
          tokensUsed: ocrResult.tokensUsed,
          cost: ocrResult.cost,
        };

      default:
        throw new BadRequestException(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Process with OpenAI (using existing AI service)
   */
  private async processWithOpenAI(
    filePath: string,
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<{
    extractedData: Record<string, any>;
    confidence: number;
    processingTimeMs: number;
    tokensUsed?: number;
    cost: number;
    responsePayload?: Record<string, any>;
  }> {
    const startTime = Date.now();

    try {
      // Use existing AI service for OpenAI processing
      const result = await this.aiService.extractTransactionData(fileBuffer, mimeType);

      const processingTimeMs = Date.now() - startTime;

      return {
        extractedData: result,
        confidence: 0.85, // Default confidence
        processingTimeMs,
        tokensUsed: 0,
        cost: 0,
      };
    } catch (error) {
      this.logger.error('OpenAI processing failed', error);
      throw new BadRequestException(`OpenAI processing failed: ${error.message}`);
    }
  }

  /**
   * Determine provider based on user tier and request
   */
  private async determineProvider(
    user: User,
    requestedProvider?: DocumentProcessingProvider,
  ): Promise<DocumentProcessingProvider> {
    const tier = user.subscriptionTier || 'FREE';

    // If provider explicitly requested, validate permissions
    if (requestedProvider) {
      await this.validateProviderPermissions(user, requestedProvider);
      return requestedProvider;
    }

    // Auto-select based on tier
    switch (tier) {
      case 'PREMIUM':
        // Premium users get OpenAI by default
        return DocumentProcessingProvider.OPENAI;

      case 'BASIC':
        // Basic users get Gemini by default
        return this.geminiService.isConfigured()
          ? DocumentProcessingProvider.GEMINI
          : DocumentProcessingProvider.OCR_SPACE;

      case 'FREE':
      default:
        // Free users get OCR.space
        return DocumentProcessingProvider.OCR_SPACE;
    }
  }

  /**
   * Validate provider permissions based on user tier
   */
  private async validateProviderPermissions(
    user: User,
    provider: DocumentProcessingProvider,
  ): Promise<void> {
    const tier = user.subscriptionTier || 'FREE';

    const permissions = {
      FREE: [DocumentProcessingProvider.OCR_SPACE],
      BASIC: [DocumentProcessingProvider.OCR_SPACE, DocumentProcessingProvider.GEMINI],
      PREMIUM: [
        DocumentProcessingProvider.OCR_SPACE,
        DocumentProcessingProvider.GEMINI,
        DocumentProcessingProvider.OPENAI,
      ],
    };

    const allowedProviders = permissions[tier] || permissions.FREE;

    if (!allowedProviders.includes(provider)) {
      throw new ForbiddenException(
        `Provider ${provider} is not available for ${tier} tier. Upgrade your subscription to access this provider.`,
      );
    }
  }

  /**
   * Calculate which fields were edited
   */
  private calculateEditedFields(
    original: Record<string, any>,
    edited: Record<string, any>,
  ): string[] {
    const editedFields: string[] = [];

    for (const key in edited) {
      if (edited[key] !== original[key]) {
        // Deep compare for objects and arrays
        if (JSON.stringify(edited[key]) !== JSON.stringify(original[key])) {
          editedFields.push(key);
        }
      }
    }

    return editedFields;
  }

  /**
   * Get user's processing history
   */
  async getUserHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<DocumentProcessingRequest[]> {
    return this.requestRepository.find({
      where: { userId },
      relations: ['responses'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get specific processing request
   */
  async getRequest(userId: string, requestId: string): Promise<DocumentProcessingRequest> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['responses'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('You do not have access to this request');
    }

    return request;
  }
}
