import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to track usage of resources
 * Usage: @TrackUsage('maxTransactions')
 *
 * This will:
 * 1. Check if user has reached their limit before executing the handler
 * 2. Increment usage count after successful execution
 */
export const TrackUsage = (resource: string) => SetMetadata('trackUsage', resource);
