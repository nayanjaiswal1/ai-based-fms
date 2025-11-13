import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { SubscriptionTier, BillingCycle } from '../../../database/entities/subscription.entity';

export class UpgradeSubscriptionDto {
  @IsEnum(SubscriptionTier)
  tier: SubscriptionTier;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;
}

export class CancelSubscriptionDto {
  @IsOptional()
  @IsBoolean()
  cancelAtPeriodEnd?: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReactivateSubscriptionDto {
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}

export class UpdatePaymentMethodDto {
  @IsString()
  paymentMethodId: string;
}

export class ApplyPromoCodeDto {
  @IsString()
  promoCode: string;
}
