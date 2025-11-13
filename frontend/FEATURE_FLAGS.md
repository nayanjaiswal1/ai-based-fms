# Feature Flags & Subscription Management

Complete implementation of feature flags and subscription-based access control for the FMS application.

## 📁 File Structure

```
src/
├── config/
│   └── features.config.ts          # Feature flags and tier definitions
├── stores/
│   └── subscriptionStore.ts        # Subscription state management
├── hooks/
│   ├── useFeatureAccess.ts         # Feature access hooks
│   └── useSubscriptionSync.ts      # Backend sync hooks
├── services/
│   └── subscriptionApi.ts          # API service for subscriptions
└── components/
    └── feature-gate/
        ├── FeatureGate.tsx         # Conditional rendering component
        ├── UpgradePrompt.tsx       # Upgrade UI prompts
        └── UsageLimitBanner.tsx    # Usage limit warnings
```

## 🎯 Subscription Tiers

### Free Tier
- 100 transactions
- 2 accounts
- Basic categories & tags
- 30 days data retention

### Basic Tier ($9.99/month)
- 1,000 transactions
- 5 accounts
- Budgets & goals
- Basic reports
- CSV export
- 6 months retention

### Premium Tier ($29.99/month)
- 10,000 transactions
- 20 accounts
- Investment tracking
- Advanced analytics
- Multiple export formats
- 2 years retention

### Enterprise Tier ($99.99/month)
- Unlimited everything
- AI-powered insights
- API access
- Priority support
- Custom features

## 🚀 Usage Examples

### 1. Feature Gating in Components

```tsx
import { FeatureGate } from '@/components/feature-gate';
import { FeatureFlag } from '@/config/features.config';

function InvestmentsPage() {
  return (
    <FeatureGate feature={FeatureFlag.INVESTMENTS}>
      {/* Only visible to Premium+ users */}
      <YourInvestmentContent />
    </FeatureGate>
  );
}
```

### 2. Conditional Feature Access

```tsx
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureFlag } from '@/config/features.config';

function Dashboard() {
  const { hasAccess } = useFeatureAccess(FeatureFlag.AI_ASSISTANT);

  return (
    <div>
      {hasAccess && <AIAssistantWidget />}
      {!hasAccess && <UpgradePrompt feature={FeatureFlag.AI_ASSISTANT} />}
    </div>
  );
}
```

### 3. Usage Limits

```tsx
import { UsageLimitBanner } from '@/components/feature-gate';

function TransactionsPage() {
  return (
    <div>
      <UsageLimitBanner resource="maxTransactions" />
      <TransactionList />
    </div>
  );
}
```

### 4. Checking Subscription Status

```tsx
import { useSubscriptionStatus } from '@/hooks/useFeatureAccess';

function SettingsPage() {
  const { tier, isActive, usage, limits } = useSubscriptionStatus();

  return (
    <div>
      <h3>Current Plan: {tier}</h3>
      <p>Transactions: {usage.transactionsCount} / {limits.maxTransactions}</p>
    </div>
  );
}
```

### 5. Backend Sync

```tsx
import { useSubscriptionSync } from '@/hooks/useSubscriptionSync';

function App() {
  // Automatically syncs subscription data with backend
  const { subscription, usage, isLoading } = useSubscriptionSync();

  if (isLoading) return <Loading />;

  return <YourApp />;
}
```

### 6. Upgrade Flow

```tsx
import { useSubscriptionSync } from '@/hooks/useSubscriptionSync';
import { SubscriptionTier } from '@/config/features.config';

function PricingPage() {
  const { upgrade, isUpgrading } = useSubscriptionSync();

  const handleUpgrade = () => {
    upgrade({ tier: SubscriptionTier.PREMIUM, billingCycle: 'monthly' });
  };

  return (
    <button onClick={handleUpgrade} disabled={isUpgrading}>
      Upgrade to Premium
    </button>
  );
}
```

## 🔧 Backend Integration

### Required API Endpoints

```typescript
// Subscription endpoints
GET    /api/subscriptions/current           // Get user's subscription
GET    /api/subscriptions/usage             // Get usage stats
POST   /api/subscriptions/upgrade           // Upgrade tier
POST   /api/subscriptions/downgrade         // Downgrade tier
POST   /api/subscriptions/cancel            // Cancel subscription
GET    /api/subscriptions/addons            // List available addons
POST   /api/subscriptions/addons/:id/purchase  // Purchase addon
DELETE /api/subscriptions/addons/:id        // Remove addon
GET    /api/subscriptions/validate/:feature // Validate feature access
```

### Response Formats

```typescript
// Subscription Response
{
  "id": "string",
  "userId": "string",
  "tier": "free" | "basic" | "premium" | "enterprise",
  "status": "active" | "expired" | "trial" | "cancelled",
  "startDate": "ISO8601",
  "endDate": "ISO8601",
  "trialEndsAt": "ISO8601",
  "features": ["feature1", "feature2"],
  "addons": ["addon1"],
  "billingCycle": "monthly" | "yearly",
  "amount": 29.99,
  "currency": "USD"
}

// Usage Response
{
  "transactionsCount": 156,
  "accountsCount": 3,
  "categoriesCount": 12,
  "budgetsCount": 2,
  "lastUpdated": "ISO8601"
}
```

## 📊 Feature Access Matrix

| Feature | Free | Basic | Premium | Enterprise |
|---------|------|-------|---------|------------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Transactions | ✅ | ✅ | ✅ | ✅ |
| Budgets | ❌ | ✅ | ✅ | ✅ |
| Investments | ❌ | ❌ | ✅ | ✅ |
| AI Assistant | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |

## 🎨 UI Components

### Locked Features in Sidebar
- Grayed out with lock icon
- Tooltip on hover: "Upgrade to unlock"
- Non-clickable for restricted features

### Upgrade Prompts
- **Card variant**: Full feature explanation with pricing
- **Inline variant**: Compact "Upgrade" button
- **Modal variant**: Centered upgrade dialog

### Usage Warnings
- Appears at 80% usage
- Orange alert at 90%
- Red alert at 100%
- Shows progress bar and remaining quota

## 🔐 Security Considerations

1. **Client-side validation** - For UX only
2. **Server-side enforcement** - Always validate on backend
3. **Token-based** - Include subscription in JWT
4. **Rate limiting** - Enforce usage limits server-side
5. **Audit logging** - Track feature access attempts

## 🚀 Deployment Checklist

- [ ] Set up subscription database tables
- [ ] Implement all API endpoints
- [ ] Configure payment provider (Stripe/Paddle)
- [ ] Set up webhook handlers
- [ ] Test upgrade/downgrade flows
- [ ] Test trial periods
- [ ] Verify usage tracking
- [ ] Set up monitoring and alerts
- [ ] Document API for third-party integrations

## 📈 Future Enhancements

- [ ] Custom pricing for enterprise
- [ ] Add-on marketplace
- [ ] Referral program
- [ ] Usage analytics dashboard
- [ ] A/B testing for pricing
- [ ] Seasonal promotions
- [ ] Team/multi-user subscriptions
- [ ] API key management
