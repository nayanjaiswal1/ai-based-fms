import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { DashboardPreferencesService } from './dashboard-preferences.service';
import { UpdateDashboardPreferencesDto } from './dto/update-preferences.dto';

@ApiTags('Dashboard Preferences')
@ApiBearerAuth()
@Controller('dashboard/preferences')
@UseGuards(JwtAuthGuard)
export class DashboardPreferencesController {
  constructor(
    private readonly dashboardPreferencesService: DashboardPreferencesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user dashboard preferences' })
  async getPreferences(@Request() req: any) {
    return this.dashboardPreferencesService.getPreferences(req.user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update user dashboard preferences' })
  async updatePreferences(
    @Request() req: any,
    @Body() dto: UpdateDashboardPreferencesDto,
  ) {
    return this.dashboardPreferencesService.updatePreferences(req.user.id, dto);
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset dashboard preferences to default' })
  async resetToDefault(@Request() req: any) {
    return this.dashboardPreferencesService.resetToDefault(req.user.id);
  }
}
