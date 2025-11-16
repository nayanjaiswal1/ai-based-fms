import { Controller, Post, Get, Body, UseGuards, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  AiCategorizationFeedbackService,
  SubmitFeedbackDto,
} from './ai-categorization-feedback.service';
import {
  AutoCategorizeDto,
  ParseReceiptDto,
  DetectDuplicatesDto,
  GenerateInsightsDto,
  NaturalLanguageQueryDto,
  SmartSuggestionsDto,
  GenerateBudgetDto,
} from './dto/ai.dto';
import { CreateAiConfigDto, UpdateAiConfigDto } from './dto/ai-config.dto';
import { AiProviderService } from './ai-provider.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly feedbackService: AiCategorizationFeedbackService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  @Post('categorize')
  @ApiOperation({ summary: 'Auto-categorize transaction using AI' })
  @ApiResponse({ status: 200, description: 'Returns suggested category' })
  @ApiResponse({ status: 400, description: 'AI service unavailable or error' })
  autoCategorize(@CurrentUser('id') userId: string, @Body() dto: AutoCategorizeDto) {
    return this.aiService.autoCategorize(userId, dto);
  }

  @Post('parse-receipt')
  @ApiOperation({ summary: 'Parse receipt and extract transaction details' })
  @ApiResponse({ status: 200, description: 'Returns extracted transaction data' })
  @ApiResponse({ status: 400, description: 'Parsing failed' })
  parseReceipt(@Body() dto: ParseReceiptDto) {
    return this.aiService.parseReceipt(dto);
  }

  @Get('detect-duplicates')
  @ApiOperation({ summary: 'Detect duplicate transactions with multi-factor matching' })
  @ApiResponse({
    status: 200,
    description: 'Returns grouped potential duplicates with confidence scores',
  })
  detectDuplicates(@CurrentUser('id') userId: string, @Query() dto: DetectDuplicatesDto) {
    return this.aiService.detectDuplicates(userId, dto);
  }

  @Post('insights')
  @ApiOperation({ summary: 'Generate AI-powered financial insights' })
  @ApiResponse({ status: 200, description: 'Returns personalized insights and recommendations' })
  generateInsights(@CurrentUser('id') userId: string, @Body() dto: GenerateInsightsDto) {
    return this.aiService.generateInsights(userId, dto);
  }

  @Post('query')
  @ApiOperation({ summary: 'Ask natural language question about finances' })
  @ApiResponse({ status: 200, description: 'Returns AI-generated answer' })
  processQuery(@CurrentUser('id') userId: string, @Body() dto: NaturalLanguageQueryDto) {
    return this.aiService.processNaturalLanguageQuery(userId, dto);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get smart saving and budgeting suggestions' })
  @ApiResponse({ status: 200, description: 'Returns AI-generated suggestions' })
  getSmartSuggestions(@CurrentUser('id') userId: string, @Query() dto: SmartSuggestionsDto) {
    return this.aiService.getSmartSuggestions(userId, dto.limit || 3);
  }

  @Post('generate-budget')
  @ApiOperation({ summary: 'Generate AI-powered budget distribution with auto-tagging' })
  @ApiResponse({ status: 200, description: 'Returns personalized budget plan with categories and tags' })
  @ApiResponse({ status: 400, description: 'AI service unavailable or invalid input' })
  generateBudget(@CurrentUser('id') userId: string, @Body() dto: GenerateBudgetDto) {
    return this.aiService.generateBudget(userId, dto);
  }

  // NEW: Categorization Feedback Endpoints
  @Post('categorize/feedback')
  @ApiOperation({ summary: 'Submit feedback on AI categorization' })
  @ApiResponse({ status: 201, description: 'Feedback recorded successfully' })
  submitCategorizationFeedback(@CurrentUser('id') userId: string, @Body() dto: SubmitFeedbackDto) {
    return this.feedbackService.submitFeedback(userId, dto);
  }

  @Get('categorize/feedback')
  @ApiOperation({ summary: 'Get user categorization feedback history' })
  @ApiResponse({ status: 200, description: 'Returns feedback history' })
  getCategorizationFeedback(@CurrentUser('id') userId: string, @Query('limit') limit?: number) {
    return this.feedbackService.getUserFeedback(userId, limit);
  }

  @Get('categorize/feedback/stats')
  @ApiOperation({ summary: 'Get categorization accuracy statistics' })
  @ApiResponse({ status: 200, description: 'Returns accuracy stats' })
  getFeedbackStats(@CurrentUser('id') userId: string) {
    return this.feedbackService.getFeedbackStats(userId);
  }

  @Get('categorize/patterns')
  @ApiOperation({ summary: 'Get learned categorization patterns from feedback' })
  @ApiResponse({ status: 200, description: 'Returns categorization patterns' })
  getCategorizationPatterns(@CurrentUser('id') userId: string) {
    return this.feedbackService.getCategorizationPatterns(userId);
  }

  // AI Configuration Endpoints
  @Get('config')
  @ApiOperation({ summary: 'Get user AI configuration' })
  @ApiResponse({ status: 200, description: 'Returns user AI configuration' })
  getUserAiConfig(@CurrentUser('id') userId: string) {
    return this.aiProviderService.getOrCreateUserConfig(userId);
  }

  @Post('config')
  @ApiOperation({ summary: 'Create or update user AI configuration' })
  @ApiResponse({ status: 201, description: 'AI configuration created/updated' })
  async createOrUpdateAiConfig(@CurrentUser('id') userId: string, @Body() dto: CreateAiConfigDto) {
    return this.aiProviderService.updateConfig(userId, dto);
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update user AI configuration' })
  @ApiResponse({ status: 200, description: 'AI configuration updated' })
  updateAiConfig(@CurrentUser('id') userId: string, @Body() dto: UpdateAiConfigDto) {
    return this.aiProviderService.updateConfig(userId, dto);
  }

  @Post('config/test')
  @ApiOperation({ summary: 'Test AI configuration' })
  @ApiResponse({ status: 200, description: 'Returns test results' })
  testAiConfig(@CurrentUser('id') userId: string) {
    return this.aiProviderService.testConfiguration(userId);
  }

  @Get('config/models')
  @ApiOperation({ summary: 'Get available models for configured provider' })
  @ApiResponse({ status: 200, description: 'Returns list of available models' })
  async getAvailableModels(@CurrentUser('id') userId: string) {
    const models = await this.aiProviderService.getAvailableModels(userId);
    return { models };
  }
}
