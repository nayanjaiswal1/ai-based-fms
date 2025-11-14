import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Addon, AddonType, AddonStatus } from '../../database/entities/addon.entity';
import { User } from '../../database/entities/user.entity';

export interface PurchaseAddonDto {
  addonId: string;
  quantity?: number;
  paymentMethodId?: string;
}

export interface CreateAddonDto {
  name: string;
  description?: string;
  type: AddonType;
  price: number;
  quantity?: number;
  unit?: string;
  isRecurring?: boolean;
  validityDays?: number;
}

@Injectable()
export class AddonsService {
  constructor(
    @InjectRepository(Addon)
    private addonRepository: Repository<Addon>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get available addons that can be purchased
   */
  async getAvailableAddons(): Promise<any[]> {
    return [
      {
        id: 'storage-10gb',
        name: 'Additional Storage - 10GB',
        description: 'Add 10GB of storage space',
        type: AddonType.STORAGE,
        price: 4.99,
        quantity: 10,
        unit: 'GB',
        isRecurring: true,
        billingCycle: 'monthly',
      },
      {
        id: 'transactions-1000',
        name: 'Additional Transactions',
        description: 'Add 1,000 transactions to your monthly limit',
        type: AddonType.TRANSACTIONS,
        price: 9.99,
        quantity: 1000,
        unit: 'transactions',
        isRecurring: true,
        billingCycle: 'monthly',
      },
      {
        id: 'api-calls-10000',
        name: 'API Calls Package',
        description: 'Add 10,000 API calls per month',
        type: AddonType.API_CALLS,
        price: 19.99,
        quantity: 10000,
        unit: 'API calls',
        isRecurring: true,
        billingCycle: 'monthly',
      },
      {
        id: 'users-5',
        name: 'Additional Users',
        description: 'Add 5 more users to your team',
        type: AddonType.USERS,
        price: 24.99,
        quantity: 5,
        unit: 'users',
        isRecurring: true,
        billingCycle: 'monthly',
      },
      {
        id: 'reports-unlimited',
        name: 'Unlimited Reports',
        description: 'Generate unlimited custom reports',
        type: AddonType.REPORTS,
        price: 14.99,
        quantity: null,
        unit: 'unlimited',
        isRecurring: true,
        billingCycle: 'monthly',
      },
    ];
  }

  /**
   * Get user's purchased addons
   */
  async getUserAddons(userId: string): Promise<Addon[]> {
    return this.addonRepository.find({
      where: { userId, status: AddonStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Purchase an addon
   */
  async purchaseAddon(userId: string, dto: PurchaseAddonDto): Promise<Addon> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get addon details from available addons
    const availableAddons = await this.getAvailableAddons();
    const addonDetails = availableAddons.find((a) => a.id === dto.addonId);

    if (!addonDetails) {
      throw new NotFoundException('Addon not found');
    }

    // TODO: Process payment via Stripe

    // Create addon record
    const now = new Date();
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 1); // Default 1 month validity

    const addon = this.addonRepository.create({
      userId,
      name: addonDetails.name,
      description: addonDetails.description,
      type: addonDetails.type,
      status: AddonStatus.ACTIVE,
      price: addonDetails.price,
      currency: 'USD',
      isRecurring: addonDetails.isRecurring,
      quantity: dto.quantity || addonDetails.quantity,
      unit: addonDetails.unit,
      validFrom: now,
      validUntil: validUntil,
      purchasedAt: now,
      metadata: {
        addonId: dto.addonId,
      },
    });

    return this.addonRepository.save(addon);
  }

  /**
   * Cancel an addon
   */
  async cancelAddon(userId: string, addonId: string): Promise<Addon> {
    const addon = await this.addonRepository.findOne({
      where: { id: addonId, userId },
    });

    if (!addon) {
      throw new NotFoundException('Addon not found');
    }

    if (addon.status === AddonStatus.CANCELED) {
      throw new BadRequestException('Addon is already canceled');
    }

    addon.status = AddonStatus.CANCELED;
    addon.canceledAt = new Date();

    return this.addonRepository.save(addon);
  }

  /**
   * Get effective limits including addons
   * This combines base subscription limits with addon bonuses
   */
  async getEffectiveLimits(userId: string, baseLimits: any): Promise<any> {
    const addons = await this.getUserAddons(userId);
    const effectiveLimits = { ...baseLimits };

    // Apply addon bonuses
    for (const addon of addons) {
      if (addon.status !== AddonStatus.ACTIVE) continue;

      switch (addon.type) {
        case AddonType.STORAGE:
          if (effectiveLimits.maxStorage !== Infinity) {
            effectiveLimits.maxStorage += (addon.quantity || 0) * 1024 * 1024 * 1024; // Convert GB to bytes
          }
          break;

        case AddonType.TRANSACTIONS:
          if (effectiveLimits.maxTransactions !== Infinity) {
            effectiveLimits.maxTransactions += addon.quantity || 0;
          }
          break;

        case AddonType.API_CALLS:
          if (effectiveLimits.maxApiCalls !== Infinity) {
            effectiveLimits.maxApiCalls += addon.quantity || 0;
          }
          break;

        case AddonType.USERS:
          if (effectiveLimits.maxUsers !== Infinity) {
            effectiveLimits.maxUsers += addon.quantity || 0;
          }
          break;

        case AddonType.REPORTS:
          effectiveLimits.maxReports = Infinity; // Unlimited reports addon
          break;
      }
    }

    return effectiveLimits;
  }

  /**
   * Check and update expired addons
   */
  async updateExpiredAddons(): Promise<void> {
    const now = new Date();

    const expiredAddons = await this.addonRepository.find({
      where: {
        status: AddonStatus.ACTIVE,
      },
    });

    for (const addon of expiredAddons) {
      if (addon.validUntil && addon.validUntil < now) {
        addon.status = AddonStatus.EXPIRED;
        await this.addonRepository.save(addon);
      }
    }
  }
}
