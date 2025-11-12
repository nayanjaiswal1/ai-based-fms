import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(@Body() createReportDto: CreateReportDto, @Request() req) {
    return this.reportsService.create(createReportDto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query: QueryReportsDto, @Request() req) {
    return this.reportsService.findAll(query, req.user.userId);
  }

  @Get('templates')
  getTemplates() {
    return this.reportsService.getTemplates();
  }

  @Get('templates/:type')
  getTemplate(@Param('type') type: string) {
    return this.reportsService.getTemplate(type);
  }

  @Post('templates/:type')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async createFromTemplate(
    @Param('type') type: string,
    @Body('name') name: string,
    @Request() req,
  ) {
    return this.reportsService.createFromTemplate(type, req.user.userId, name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.reportsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @Request() req,
  ) {
    return this.reportsService.update(id, updateReportDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req) {
    await this.reportsService.remove(id, req.user.userId);
  }

  @Post(':id/duplicate')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async duplicate(@Param('id') id: string, @Request() req) {
    return this.reportsService.duplicate(id, req.user.userId);
  }

  @Post(':id/favorite')
  async toggleFavorite(@Param('id') id: string, @Request() req) {
    return this.reportsService.toggleFavorite(id, req.user.userId);
  }

  @Post(':id/generate')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async generateReport(
    @Param('id') id: string,
    @Body() generateReportDto: GenerateReportDto,
    @Request() req,
  ) {
    return this.reportsService.generateReport(id, generateReportDto, req.user.userId);
  }

  @Get(':id/preview')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async previewReport(@Param('id') id: string, @Request() req) {
    return this.reportsService.previewReport(id, req.user.userId);
  }

  @Get(':id/generated')
  async getGeneratedReports(@Param('id') id: string, @Request() req) {
    return this.reportsService.getGeneratedReports(id, req.user.userId);
  }

  @Get('generated/:id')
  async getGeneratedReport(@Param('id') id: string, @Request() req) {
    return this.reportsService.getGeneratedReport(id, req.user.userId);
  }

  @Get('generated/:id/download')
  async downloadGeneratedReport(
    @Param('id') id: string,
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const generatedReport = await this.reportsService.getGeneratedReport(id, req.user.userId);

    if (!generatedReport.fileUrl || !fs.existsSync(generatedReport.fileUrl)) {
      throw new Error('Report file not found');
    }

    const file = fs.createReadStream(generatedReport.fileUrl);
    const stat = fs.statSync(generatedReport.fileUrl);

    res.set({
      'Content-Type': this.getContentType(generatedReport.format),
      'Content-Disposition': `attachment; filename="${generatedReport.fileName}"`,
      'Content-Length': stat.size,
    });

    return new StreamableFile(file);
  }

  @Delete('generated/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGeneratedReport(@Param('id') id: string, @Request() req) {
    await this.reportsService.deleteGeneratedReport(id, req.user.userId);
  }

  private getContentType(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}
