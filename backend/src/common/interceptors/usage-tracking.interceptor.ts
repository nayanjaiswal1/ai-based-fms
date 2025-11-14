import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service';

/**
 * Interceptor to track resource usage
 * Can be applied to routes that create resources (transactions, accounts, etc.)
 */
@Injectable()
export class UsageTrackingInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const resource = this.reflector.get<string>('trackUsage', context.getHandler());

    if (!resource) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.userId;

    if (!userId) {
      return next.handle();
    }

    // Check if user has reached limit BEFORE creating the resource
    const hasReachedLimit = await this.subscriptionsService.checkUsageLimit(
      userId,
      resource as any,
    );

    if (hasReachedLimit) {
      throw new BadRequestException(
        `You have reached your ${resource} limit for this billing period. Please upgrade your subscription to continue.`,
      );
    }

    // After successful creation, increment usage
    return next.handle().pipe(
      tap(async () => {
        try {
          const resourceName = resource.replace('max', '').toLowerCase();
          await this.subscriptionsService.incrementUsage(userId, resourceName);
        } catch (error) {
          console.error('Failed to track usage:', error);
          // Don't fail the request if usage tracking fails
        }
      }),
    );
  }
}
