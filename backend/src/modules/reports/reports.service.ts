import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Report } from '@database/entities/report.entity';
import { GeneratedReport, ReportFormat, GeneratedReportStatus } from '@database/entities/generated-report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { QueryReportsDto } from './dto/query-reports.dto';
import { ReportGeneratorService } from './services/report-generator.service';
import { ReportExportService } from './services/report-export.service';
import { ReportSchedulerService } from './services/report-scheduler.service';
import { REPORT_TEMPLATES, getTemplateByType, getAllTemplates } from './templates/report-templates';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(GeneratedReport)
    private generatedReportRepository: Repository<GeneratedReport>,
    @InjectQueue('reports')
    private reportQueue: Queue,
    private reportGeneratorService: ReportGeneratorService,
    private reportExportService: ReportExportService,
    private reportSchedulerService: ReportSchedulerService,
  ) {}

  async create(createReportDto: CreateReportDto, userId: string): Promise<Report> {
    this.logger.log(`Creating new report for user: ${userId}`);

    const report = this.reportRepository.create({
      ...createReportDto,
      userId,
    });

    const savedReport = await this.reportRepository.save(report);

    // If schedule is enabled, set up the next run
    if (savedReport.schedule?.enabled) {
      await this.reportSchedulerService.updateSchedule(savedReport.id, savedReport.schedule);
    }

    return savedReport;
  }

  async findAll(query: QueryReportsDto, userId: string): Promise<{ reports: Report[]; total: number }> {
    const { type, isFavorite, isShared, search, page = 1, limit = 20 } = query;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .where('report.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('report.type = :type', { type });
    }

    if (isFavorite !== undefined) {
      queryBuilder.andWhere('report.isFavorite = :isFavorite', { isFavorite });
    }

    if (isShared !== undefined) {
      queryBuilder.andWhere('report.isShared = :isShared', { isShared });
    }

    if (search) {
      queryBuilder.andWhere(
        '(report.name ILIKE :search OR report.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('report.updatedAt', 'DESC');

    const [reports, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { reports, total };
  }

  async findOne(id: string, userId: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id, userId },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto, userId: string): Promise<Report> {
    const report = await this.findOne(id, userId);

    Object.assign(report, updateReportDto);

    const updatedReport = await this.reportRepository.save(report);

    // Update schedule if provided
    if (updateReportDto.schedule) {
      await this.reportSchedulerService.updateSchedule(id, updateReportDto.schedule);
    }

    return updatedReport;
  }

  async remove(id: string, userId: string): Promise<void> {
    const report = await this.findOne(id, userId);

    // Delete all associated generated reports and files
    const generatedReports = await this.generatedReportRepository.find({
      where: { reportId: id },
    });

    for (const genReport of generatedReports) {
      if (genReport.fileUrl) {
        await this.reportExportService.deleteReportFile(genReport.fileUrl);
      }
    }

    await this.reportRepository.remove(report);
  }

  async duplicate(id: string, userId: string): Promise<Report> {
    const originalReport = await this.findOne(id, userId);

    const duplicatedReport = this.reportRepository.create({
      ...originalReport,
      id: undefined,
      name: `${originalReport.name} (Copy)`,
      runCount: 0,
      lastRunAt: null,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.reportRepository.save(duplicatedReport);
  }

  async toggleFavorite(id: string, userId: string): Promise<Report> {
    const report = await this.findOne(id, userId);
    report.isFavorite = !report.isFavorite;
    return this.reportRepository.save(report);
  }

  async generateReport(
    id: string,
    generateReportDto: GenerateReportDto,
    userId: string,
  ): Promise<GeneratedReport> {
    const report = await this.findOne(id, userId);

    this.logger.log(`Generating report ${id} for user ${userId} in format ${generateReportDto.format}`);

    // Create generated report record
    const generatedReport = this.generatedReportRepository.create({
      reportId: report.id,
      format: generateReportDto.format,
      status: GeneratedReportStatus.PENDING,
      generatedBy: userId,
    });

    const savedGeneratedReport = await this.generatedReportRepository.save(generatedReport);

    // Queue the report generation job
    await this.reportQueue.add(
      'generate-report',
      {
        generatedReportId: savedGeneratedReport.id,
        reportId: report.id,
        userId,
        format: generateReportDto.format,
        overrideConfig: generateReportDto.overrideConfig,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    );

    return savedGeneratedReport;
  }

  async processReportGeneration(jobData: any): Promise<void> {
    const { generatedReportId, reportId, userId, format, overrideConfig } = jobData;

    try {
      this.logger.log(`Processing report generation: ${generatedReportId}`);

      // Update status to generating
      await this.generatedReportRepository.update(generatedReportId, {
        status: GeneratedReportStatus.GENERATING,
      });

      // Get report
      const report = await this.reportRepository.findOne({
        where: { id: reportId, userId },
      });

      if (!report) {
        throw new Error(`Report not found: ${reportId}`);
      }

      // Apply config overrides if provided
      if (overrideConfig) {
        report.config = { ...report.config, ...overrideConfig };
      }

      // Generate report data
      const reportData = await this.reportGeneratorService.generateReportData(report, userId);

      // Export report
      const exportResult = await this.reportExportService.exportReport(
        report,
        reportData,
        format,
      );

      // Set expiration (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Update generated report
      await this.generatedReportRepository.update(generatedReportId, {
        status: GeneratedReportStatus.COMPLETED,
        fileUrl: exportResult.filePath,
        fileName: exportResult.fileName,
        fileSize: exportResult.fileSize,
        metadata: {
          summary: reportData.summary,
          recordCount: reportData.metadata.recordCount,
        },
        expiresAt,
      });

      // Increment run count
      await this.reportRepository.increment({ id: reportId }, 'runCount', 1);
      await this.reportRepository.update(reportId, { lastRunAt: new Date() });

      this.logger.log(`Successfully generated report: ${generatedReportId}`);
    } catch (error) {
      this.logger.error(`Failed to generate report: ${generatedReportId}`, error);

      await this.generatedReportRepository.update(generatedReportId, {
        status: GeneratedReportStatus.FAILED,
        error: error.message,
      });

      throw error;
    }
  }

  async getGeneratedReports(reportId: string, userId: string): Promise<GeneratedReport[]> {
    // Verify user owns the report
    await this.findOne(reportId, userId);

    return this.generatedReportRepository.find({
      where: { reportId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async getGeneratedReport(id: string, userId: string): Promise<GeneratedReport> {
    const generatedReport = await this.generatedReportRepository.findOne({
      where: { id },
      relations: ['report'],
    });

    if (!generatedReport) {
      throw new NotFoundException(`Generated report with ID ${id} not found`);
    }

    // Verify user owns the parent report
    if (generatedReport.report.userId !== userId) {
      throw new ForbiddenException('You do not have access to this report');
    }

    return generatedReport;
  }

  async deleteGeneratedReport(id: string, userId: string): Promise<void> {
    const generatedReport = await this.getGeneratedReport(id, userId);

    // Delete file
    if (generatedReport.fileUrl) {
      await this.reportExportService.deleteReportFile(generatedReport.fileUrl);
    }

    await this.generatedReportRepository.remove(generatedReport);
  }

  async previewReport(id: string, userId: string): Promise<any> {
    const report = await this.findOne(id, userId);

    // Generate preview data (limited results)
    const previewConfig = {
      ...report.config,
      limit: 10, // Limit preview to 10 records
    };

    const previewReport = { ...report, config: previewConfig };

    const reportData = await this.reportGeneratorService.generateReportData(previewReport, userId);

    return {
      summary: reportData.summary,
      details: reportData.details.slice(0, 10),
      charts: reportData.charts,
      metadata: reportData.metadata,
    };
  }

  getTemplates(): any[] {
    return getAllTemplates();
  }

  getTemplate(type: string): any {
    const template = getTemplateByType(type as any);
    if (!template) {
      throw new NotFoundException(`Template with type ${type} not found`);
    }
    return template;
  }

  async createFromTemplate(type: string, userId: string, customName?: string): Promise<Report> {
    const template = this.getTemplate(type);

    const report = this.reportRepository.create({
      name: customName || template.name,
      description: template.description,
      type: template.type,
      config: template.defaultConfig,
      userId,
    });

    return this.reportRepository.save(report);
  }
}
