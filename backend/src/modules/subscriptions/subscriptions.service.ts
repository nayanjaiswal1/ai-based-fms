import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionTier,
  SubscriptionStatus,
  BillingCycle,
} from '../../database/entities/subscription.entity';
import { UsageTracking } from '../../database/entities/usage-tracking.entity';
import { Invoice, InvoiceStatus } from '../../database/entities/invoice.entity';
import { User } from '../../database/entities/user.entity';
import {
  FEATURE_LIMITS,
  hasFeatureAccess,
  FeatureFlag,
  getTierLimits,
} from '../../common/constants/features.constants';
import {
  UpgradeSubscriptionDto,
  CancelSubscriptionDto,
  ReactivateSubscriptionDto,
  UpdatePaymentMethodDto,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(UsageTracking)
    private usageTrackingRepository: Repository<UsageTracking>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get current subscription for a user
   */
  async getCurrentSubscription(userId: string): Promise<any> {
    let subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    // Create default FREE subscription if none exists
    if (!subscription) {
      subscription = await this.createDefaultSubscription(userId);
    }

    const limits = getTierLimits(subscription.tier);
    const isActive =
      subscription.status === SubscriptionStatus.ACTIVE ||
      subscription.status === SubscriptionStatus.TRIALING;

    return {
      id: subscription.id,
      tier: subscription.tier,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      price: subscription.price,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      isActive,
      limits,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  /**
   * Get current usage for a user
   */
  async getUsage(userId: string): Promise<any> {
    const currentPeriod = this.getCurrentPeriod();

    let usage = await this.usageTrackingRepository.findOne({
      where: { userId, period: currentPeriod },
    });

    // Create default usage tracking if none exists
    if (!usage) {
      usage = this.usageTrackingRepository.create({
        userId,
        period: currentPeriod,
      });
      await this.usageTrackingRepository.save(usage);
    }

    return {
      transactionsCount: usage.transactionsCount,
      accountsCount: usage.accountsCount,
      budgetsCount: usage.budgetsCount,
      groupsCount: usage.groupsCount,
      investmentsCount: usage.investmentsCount,
      reportsCount: usage.reportsCount,
      apiCallsCount: usage.apiCallsCount,
      exportsCount: usage.exportsCount,
      importsCount: usage.importsCount,
      storageUsed: Number(usage.storageUsed),
      aiAssistantCalls: usage.aiAssistantCalls,
      advancedAnalyticsViews: usage.advancedAnalyticsViews,
      insightsGenerated: usage.insightsGenerated,
      period: usage.period,
    };
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(userId: string, dto: UpgradeSubscriptionDto): Promise<any> {
    const subscription = await this.subscriptionRepository.findOne({ where: { userId } });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Validate tier upgrade (can't downgrade to free)
    if (dto.tier === SubscriptionTier.FREE) {
      throw new BadRequestException(
        'Cannot downgrade to FREE tier. Use cancel subscription instead.',
      );
    }

    // TODO: Integrate with Stripe for payment processing
    // For now, just update the subscription

    const now = new Date();
    const periodEnd = new Date();

    if (dto.billingCycle === BillingCycle.MONTHLY) {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    subscription.tier = dto.tier;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.billingCycle = dto.billingCycle;
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = periodEnd;
    subscription.cancelAtPeriodEnd = false;
    subscription.canceledAt = null;

    // Set price based on tier (placeholder values)
    const pricing = {
      [SubscriptionTier.BASIC]: { monthly: 9.99, yearly: 99.99 },
      [SubscriptionTier.PREMIUM]: { monthly: 29.99, yearly: 299.99 },
      [SubscriptionTier.ENTERPRISE]: { monthly: 99.99, yearly: 999.99 },
    };

    // dto.tier is guaranteed to not be FREE due to validation above
    subscription.price =
      dto.billingCycle === BillingCycle.MONTHLY
        ? pricing[dto.tier].monthly
        : pricing[dto.tier].yearly;

    await this.subscriptionRepository.save(subscription);

    // Update user's tier
    await this.userRepository.update(userId, {
      subscriptionTier: dto.tier,
    });

    return this.getCurrentSubscription(userId);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, dto: CancelSubscriptionDto): Promise<any> {
    const subscription = await this.subscriptionRepository.findOne({ where: { userId } });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.tier === SubscriptionTier.FREE) {
      throw new BadRequestException('Cannot cancel FREE subscription');
    }

    if (dto.cancelAtPeriodEnd) {
      // Cancel at period end - subscription remains active until end date
      subscription.cancelAtPeriodEnd = true;
      subscription.canceledAt = new Date();
    } else {
      // Immediate cancellation
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      subscription.tier = SubscriptionTier.FREE;

      // Update user's tier
      await this.userRepository.update(userId, {
        subscriptionTier: SubscriptionTier.FREE,
      });
    }

    await this.subscriptionRepository.save(subscription);

    return this.getCurrentSubscription(userId);
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(userId: string, dto: ReactivateSubscriptionDto): Promise<any> {
    const subscription = await this.subscriptionRepository.findOne({ where: { userId } });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== SubscriptionStatus.CANCELED && !subscription.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is not canceled');
    }

    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.cancelAtPeriodEnd = false;
    subscription.canceledAt = null;

    if (dto.billingCycle) {
      subscription.billingCycle = dto.billingCycle;
    }

    await this.subscriptionRepository.save(subscription);

    return this.getCurrentSubscription(userId);
  }

  /**
   * Get billing history
   */
  async getBillingHistory(userId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if user has access to a feature
   */
  async checkFeatureAccess(userId: string, feature: FeatureFlag): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    return hasFeatureAccess(subscription.tier, feature);
  }

  /**
   * Check if user has reached a usage limit
   */
  async checkUsageLimit(
    userId: string,
    resource: keyof (typeof FEATURE_LIMITS)[SubscriptionTier.FREE],
  ): Promise<boolean> {
    const subscription = await this.getCurrentSubscription(userId);
    const usage = await this.getUsage(userId);
    const limits = getTierLimits(subscription.tier);

    const limit = limits[resource];
    if (limit === Infinity) return false;

    const resourceKey =
      resource.replace('max', '').charAt(0).toLowerCase() + resource.replace('max', '').slice(1);
    const currentUsage = usage[`${resourceKey}Count` as keyof typeof usage];

    return Number(currentUsage) >= limit;
  }

  /**
   * Increment usage for a resource
   */
  async incrementUsage(userId: string, resource: string, amount: number = 1): Promise<void> {
    const currentPeriod = this.getCurrentPeriod();

    let usage = await this.usageTrackingRepository.findOne({
      where: { userId, period: currentPeriod },
    });

    if (!usage) {
      usage = this.usageTrackingRepository.create({
        userId,
        period: currentPeriod,
      });
    }

    const resourceKey = `${resource}Count` as keyof UsageTracking;
    if (typeof usage[resourceKey] === 'number') {
      (usage as any)[resourceKey] = (usage[resourceKey] as number) + amount;
    }

    await this.usageTrackingRepository.save(usage);
  }

  /**
   * Decrement usage for a resource
   */
  async decrementUsage(userId: string, resource: string, amount: number = 1): Promise<void> {
    const currentPeriod = this.getCurrentPeriod();

    const usage = await this.usageTrackingRepository.findOne({
      where: { userId, period: currentPeriod },
    });

    if (usage) {
      const resourceKey = `${resource}Count` as keyof UsageTracking;
      if (typeof usage[resourceKey] === 'number') {
        (usage as any)[resourceKey] = Math.max(0, (usage[resourceKey] as number) - amount);
        await this.usageTrackingRepository.save(usage);
      }
    }
  }

  /**
   * Create default FREE subscription for new users
   */
  private async createDefaultSubscription(userId: string): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      userId,
      tier: SubscriptionTier.FREE,
      status: SubscriptionStatus.ACTIVE,
    });

    return this.subscriptionRepository.save(subscription);
  }

  /**
   * Get current period identifier (YYYY-MM format)
   */
  private getCurrentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
