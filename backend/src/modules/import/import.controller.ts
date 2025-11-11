import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ImportService } from './import.service';
import {
  CreateImportDto,
  ParseFileDto,
  ConfirmImportDto,
  GetImportHistoryDto,
} from './dto/import.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ImportStatus, ImportType } from '@database/entities';

@ApiTags('Import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import')
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create import log entry' })
  @ApiResponse({ status: 201, description: 'Import log created' })
  createImportLog(@CurrentUser('id') userId: string, @Body() createDto: CreateImportDto) {
    return this.importService.createImportLog(userId, createDto);
  }

  @Post('parse')
  @ApiOperation({ summary: 'Parse file and extract transactions' })
  @ApiResponse({ status: 200, description: 'File parsed successfully, returns transaction preview' })
  @ApiResponse({ status: 400, description: 'File parsing failed' })
  parseFile(@CurrentUser('id') userId: string, @Body() parseDto: ParseFileDto) {
    return this.importService.parseFile(userId, parseDto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm and execute import' })
  @ApiResponse({ status: 200, description: 'Import completed successfully' })
  @ApiResponse({ status: 400, description: 'Import failed' })
  confirmImport(@CurrentUser('id') userId: string, @Body() confirmDto: ConfirmImportDto) {
    return this.importService.confirmImport(userId, confirmDto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get import history' })
  @ApiQuery({ name: 'status', enum: ImportStatus, required: false })
  @ApiQuery({ name: 'type', enum: ImportType, required: false })
  getImportHistory(
    @CurrentUser('id') userId: string,
    @Query() query: GetImportHistoryDto,
  ) {
    return this.importService.getImportHistory(userId, query.status, query.type);
  }

  @Get(':importId')
  @ApiOperation({ summary: 'Get import details with transactions' })
  @ApiResponse({ status: 200, description: 'Returns import log and associated transactions' })
  getImportDetails(
    @CurrentUser('id') userId: string,
    @Param('importId') importId: string,
  ) {
    return this.importService.getImportDetails(userId, importId);
  }

  @Delete(':importId')
  @ApiOperation({ summary: 'Delete import and associated transactions' })
  @ApiResponse({ status: 200, description: 'Import deleted successfully' })
  deleteImport(
    @CurrentUser('id') userId: string,
    @Param('importId') importId: string,
  ) {
    return this.importService.deleteImport(userId, importId);
  }
}
