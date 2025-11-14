import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
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
} from './dto/ai.dto';
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
}
