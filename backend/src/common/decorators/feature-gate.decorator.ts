import { SetMetadata } from '@nestjs/common';
import { Feature } from '../constants/feature-limits';
import { FEATURE_KEY } from '../guards/feature-gate.guard';

export const RequireFeature = (feature: Feature) => SetMetadata(FEATURE_KEY, feature);
