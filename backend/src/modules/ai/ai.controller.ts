import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
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
  constructor(private readonly aiService: AiService) {}

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

  @Post('detect-duplicates')
  @ApiOperation({ summary: 'Detect duplicate transactions' })
  @ApiResponse({ status: 200, description: 'Returns potential duplicates' })
  detectDuplicates(@CurrentUser('id') userId: string, @Body() dto: DetectDuplicatesDto) {
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
  getSmartSuggestions(
    @CurrentUser('id') userId: string,
    @Query() dto: SmartSuggestionsDto,
  ) {
    return this.aiService.getSmartSuggestions(userId, dto.limit || 3);
  }
}
