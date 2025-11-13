import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AddonsService, PurchaseAddonDto } from './addons.service';
import {
  UpgradeSubscriptionDto,
  CancelSubscriptionDto,
  ReactivateSubscriptionDto,
  UpdatePaymentMethodDto,
  ApplyPromoCodeDto,
} from './dto/subscription.dto';

@Controller('subscriptions')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is set up
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly addonsService: AddonsService,
  ) {}

  /**
   * GET /subscriptions/current
   * Get current user's subscription details
   */
  @Get('current')
  async getCurrentSubscription(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.subscriptionsService.getCurrentSubscription(userId);
  }

  /**
   * GET /subscriptions/usage
   * Get current usage statistics
   */
  @Get('usage')
  async getUsage(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.subscriptionsService.getUsage(userId);
  }

  /**
   * POST /subscriptions/upgrade
   * Upgrade to a higher tier
   */
  @Post('upgrade')
  async upgradeSubscription(
    @Request() req: any,
    @Body() upgradeDto: UpgradeSubscriptionDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.subscriptionsService.upgradeSubscription(userId, upgradeDto);
  }

  /**
   * POST /subscriptions/cancel
   * Cancel current subscription
   */
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @Request() req: any,
    @Body() cancelDto: CancelSubscriptionDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.subscriptionsService.cancelSubscription(userId, cancelDto);
  }

  /**
   * POST /subscriptions/reactivate
   * Reactivate canceled subscription
   */
  @Post('reactivate')
  async reactivateSubscription(
    @Request() req: any,
    @Body() reactivateDto: ReactivateSubscriptionDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.subscriptionsService.reactivateSubscription(userId, reactivateDto);
  }

  /**
   * GET /subscriptions/billing-history
   * Get billing history
   */
  @Get('billing-history')
  async getBillingHistory(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.subscriptionsService.getBillingHistory(userId);
  }

  /**
   * GET /subscriptions/invoices/:id
   * Get specific invoice details
   */
  @Get('invoices/:id')
  async getInvoice(@Request() req: any, @Param('id') invoiceId: string) {
    const userId = req.user?.id || req.user?.userId;
    // Implementation would fetch invoice by ID and verify ownership
    return { message: 'Not implemented yet' };
  }

  /**
   * PUT /subscriptions/payment-method
   * Update payment method
   */
  @Put('payment-method')
  async updatePaymentMethod(
    @Request() req: any,
    @Body() paymentDto: UpdatePaymentMethodDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    // TODO: Implement Stripe payment method update
    return { message: 'Payment method updated successfully' };
  }

  /**
   * POST /subscriptions/promo-code
   * Apply promo code
   */
  @Post('promo-code')
  async applyPromoCode(
    @Request() req: any,
    @Body() promoDto: ApplyPromoCodeDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    // TODO: Implement promo code validation and application
    return { message: 'Promo code applied successfully' };
  }

  /**
   * GET /subscriptions/plans
   * Get available subscription plans with pricing
   */
  @Get('plans')
  async getPlans() {
    return {
      plans: [
        {
          tier: 'free',
          name: 'Free',
          price: 0,
          billingCycle: null,
          features: [
            '100 transactions per month',
            '3 accounts',
            '2 budgets',
            'Basic reports',
          ],
        },
        {
          tier: 'basic',
          name: 'Basic',
          monthlyPrice: 9.99,
          yearlyPrice: 99.99,
          features: [
            '1,000 transactions per month',
            '10 accounts',
            '10 budgets',
            'Groups & sharing',
            'Advanced reports',
            'CSV import/export',
          ],
        },
        {
          tier: 'premium',
          name: 'Premium',
          monthlyPrice: 29.99,
          yearlyPrice: 299.99,
          features: [
            '10,000 transactions per month',
            '50 accounts',
            'Unlimited budgets',
            'Investments tracking',
            'Advanced analytics',
            'AI-powered insights',
            'Email integration',
            'Priority support',
          ],
        },
        {
          tier: 'enterprise',
          name: 'Enterprise',
          monthlyPrice: 99.99,
          yearlyPrice: 999.99,
          features: [
            'Unlimited everything',
            'AI assistant',
            'Predictive analytics',
            'API access',
            'SSO integration',
            'Dedicated account manager',
            'Custom onboarding',
            'Team permissions',
          ],
        },
      ],
    };
  }

  /**
   * GET /subscriptions/addons
   * Get available addons
   */
  @Get('addons')
  async getAvailableAddons() {
    return this.addonsService.getAvailableAddons();
  }

  /**
   * GET /subscriptions/my-addons
   * Get user's purchased addons
   */
  @Get('my-addons')
  async getUserAddons(@Request() req: any) {
    const userId = req.user?.id || req.user?.userId;
    return this.addonsService.getUserAddons(userId);
  }

  /**
   * POST /subscriptions/addons/purchase
   * Purchase an addon
   */
  @Post('addons/purchase')
  async purchaseAddon(
    @Request() req: any,
    @Body() purchaseDto: PurchaseAddonDto,
  ) {
    const userId = req.user?.id || req.user?.userId;
    return this.addonsService.purchaseAddon(userId, purchaseDto);
  }

  /**
   * DELETE /subscriptions/addons/:id
   * Cancel an addon
   */
  @Delete('addons/:id')
  async cancelAddon(@Request() req: any, @Param('id') addonId: string) {
    const userId = req.user?.id || req.user?.userId;
    return this.addonsService.cancelAddon(userId, addonId);
  }
}
