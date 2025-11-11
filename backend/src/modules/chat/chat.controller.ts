import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, ProcessCommandDto } from './dto/chat.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send chat message' })
  @ApiResponse({ status: 200, description: 'Returns AI response and actions' })
  sendMessage(@CurrentUser('id') userId: string, @Body() sendDto: SendMessageDto) {
    return this.chatService.sendMessage(userId, sendDto);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ summary: 'Get conversation history' })
  @ApiResponse({ status: 200, description: 'Returns conversation messages' })
  getConversationHistory(
    @CurrentUser('id') userId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.getConversationHistory(userId, conversationId);
  }

  @Delete('conversations/:conversationId')
  @ApiOperation({ summary: 'Clear conversation history' })
  @ApiResponse({ status: 200, description: 'Conversation cleared' })
  clearConversation(
    @CurrentUser('id') userId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.clearConversation(userId, conversationId);
  }

  @Post('command')
  @ApiOperation({ summary: 'Execute chat command directly' })
  @ApiResponse({ status: 200, description: 'Command executed' })
  processCommand(@CurrentUser('id') userId: string, @Body() commandDto: ProcessCommandDto) {
    return this.chatService.processCommand(userId, commandDto);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get quick action suggestions' })
  @ApiResponse({ status: 200, description: 'Returns suggested commands' })
  getSuggestions(@CurrentUser('id') userId: string) {
    return this.chatService.getSuggestions(userId);
  }
}
