import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDashboardPreference } from '../../database/entities/user-dashboard-preference.entity';
import { UpdateDashboardPreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class DashboardPreferencesService {
  constructor(
    @InjectRepository(UserDashboardPreference)
    private readonly dashboardPrefRepository: Repository<UserDashboardPreference>,
  ) {}

  async getPreferences(userId: string): Promise<UserDashboardPreference> {
    let preferences = await this.dashboardPrefRepository.findOne({
      where: { userId },
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    dto: UpdateDashboardPreferencesDto,
  ): Promise<UserDashboardPreference> {
    let preferences = await this.dashboardPrefRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.dashboardPrefRepository.create({
        userId,
        widgets: dto.widgets,
        gridColumns: dto.gridColumns || 3,
      });
    } else {
      preferences.widgets = dto.widgets;
      if (dto.gridColumns !== undefined) {
        preferences.gridColumns = dto.gridColumns;
      }
    }

    return await this.dashboardPrefRepository.save(preferences);
  }

  async resetToDefault(userId: string): Promise<UserDashboardPreference> {
    const preferences = await this.dashboardPrefRepository.findOne({
      where: { userId },
    });

    if (preferences) {
      await this.dashboardPrefRepository.remove(preferences);
    }

    return await this.createDefaultPreferences(userId);
  }

  private async createDefaultPreferences(userId: string): Promise<UserDashboardPreference> {
    const defaultWidgets = [
      {
        id: 'total-balance',
        type: 'total-balance',
        position: 0,
        size: 'medium' as const,
        visible: true,
        config: {},
      },
      {
        id: 'income-expense',
        type: 'income-expense',
        position: 1,
        size: 'medium' as const,
        visible: true,
        config: {},
      },
      {
        id: 'recent-transactions',
        type: 'recent-transactions',
        position: 2,
        size: 'large' as const,
        visible: true,
        config: { title: 'Recent Transactions' },
      },
      {
        id: 'spending-by-category',
        type: 'spending-by-category',
        position: 3,
        size: 'medium' as const,
        visible: true,
        config: {},
      },
      {
        id: 'budget-overview',
        type: 'budget-overview',
        position: 4,
        size: 'large' as const,
        visible: true,
        config: {},
      },
      {
        id: 'monthly-trend',
        type: 'monthly-trend',
        position: 5,
        size: 'full-width' as const,
        visible: true,
        config: {},
      },
      {
        id: 'account-balances',
        type: 'account-balances',
        position: 6,
        size: 'medium' as const,
        visible: true,
        config: {},
      },
      {
        id: 'net-worth',
        type: 'net-worth',
        position: 7,
        size: 'medium' as const,
        visible: true,
        config: {},
      },
    ];

    const preferences = this.dashboardPrefRepository.create({
      userId,
      widgets: defaultWidgets,
      gridColumns: 3,
    });

    return await this.dashboardPrefRepository.save(preferences);
  }
}
