import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, ProcessCommandDto, ProcessDocumentDto } from './dto/chat.dto';
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

  @Post('upload-document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and process invoice/receipt document' })
  @ApiResponse({ status: 200, description: 'Document processed and data extracted' })
  @ApiResponse({ status: 400, description: 'Invalid file or processing error' })
  async uploadDocument(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ProcessDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, PNG, and PDF files are allowed.',
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    return this.chatService.processDocument(userId, file, dto);
  }
}
