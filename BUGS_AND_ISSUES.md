# 🐛 Bugs and Issues Report - AI-Based Finance Management System

**Report Date:** 2025-11-14
**Analysis Scope:** Complete codebase (Backend + Frontend)
**Total Issues Found:** 30

---

## 📊 Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 **Critical** | 7 | **Must Fix Immediately** |
| 🟠 **High** | 9 | **Fix Before Production** |
| 🟡 **Medium** | 9 | **Fix in Next Sprint** |
| 🟢 **Low** | 5 | **Technical Debt** |

### ⚠️ Most Severe Issues
1. **Infinite Recursion** in Groups Service → Application Crash
2. **Race Conditions** in Transaction Updates → Data Corruption
3. **Authentication Inconsistencies** → Security + Functionality Issues
4. **Missing Input Validation** → Security Vulnerabilities

---

## 🔴 CRITICAL BUGS (Priority 1 - Must Fix Immediately)

### 1. Infinite Recursion Bug - Groups Service

**Severity:** 🔴 CRITICAL
**File:** `/backend/src/modules/groups/groups.service.ts`
**Lines:** 22-26
**Impact:** Application crash, Stack overflow, Denial of Service

**Issue:**
```typescript
private async broadcastGroupEvent(groupId: string, event: string, data: any) {
  if (this.notificationsGateway) {
    await this.broadcastGroupEvent(groupId, event, data); // ❌ INFINITE RECURSION!
  }
}
```

**Problem:** Method calls itself recursively without any base case or actual operation.

**Fix:**
```typescript
private async broadcastGroupEvent(groupId: string, event: string, data: any) {
  if (this.notificationsGateway) {
    await this.notificationsGateway.broadcastToGroup(groupId, event, data);
  }
}
```

**Status:** ❌ Not Fixed
**Priority:** P0 - Fix Immediately

---

### 2. Race Condition - Transaction Balance Updates

**Severity:** 🔴 CRITICAL
**File:** `/backend/src/modules/transactions/transactions.service.ts`
**Lines:** 76-91
**Impact:** Data corruption, Incorrect balances, Financial discrepancies

**Issue:**
```typescript
// Step 1: Reverse old balance (NOT ATOMIC!)
const oldBalanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
await this.accountsService.updateBalance(transaction.accountId, -oldBalanceChange);

// Step 2: Update transaction
Object.assign(transaction, { ...updateDto, updatedBy: userId });
const updated = await this.transactionRepository.save(transaction);

// Step 3: Apply new balance (RACE CONDITION if another update happens between these steps)
const newBalanceChange = updated.type === 'expense' ? -updated.amount : updated.amount;
await this.accountsService.updateBalance(updated.accountId, newBalanceChange);
```

**Problem:** Three separate database operations without transaction wrapping. If another transaction update occurs between step 1 and step 3, balances will be incorrect.

**Fix:**
```typescript
async update(id: string, updateDto: any, userId: string) {
  return await this.dataSource.transaction(async (manager) => {
    const transactionRepo = manager.getRepository(Transaction);
    const accountRepo = manager.getRepository(Account);

    const transaction = await transactionRepo.findOne({
      where: { id, userId },
      lock: { mode: 'pessimistic_write' } // Lock the row
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Calculate balance changes atomically
    const oldBalanceChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    const newBalanceChange = updateDto.type === 'expense' ? -updateDto.amount : updateDto.amount;
    const balanceDelta = newBalanceChange - oldBalanceChange;

    // Update balance atomically
    await accountRepo.increment({ id: transaction.accountId }, 'balance', balanceDelta);

    // Update transaction
    Object.assign(transaction, { ...updateDto, updatedBy: userId });
    return await transactionRepo.save(transaction);
  });
}
```

**Status:** ❌ Not Fixed
**Priority:** P0 - Fix Immediately

---

### 3. Race Condition - Account Balance Increment

**Severity:** 🔴 CRITICAL
**File:** `/backend/src/modules/accounts/accounts.service.ts`
**Line:** 49
**Impact:** Unauthorized balance modification, Missing validation, Security issue

**Issue:**
```typescript
async updateBalance(accountId: string, amount: number) {
  await this.accountRepository.increment({ id: accountId }, 'balance', amount);
}
```

**Problems:**
1. No userId validation - anyone can update any account
2. No error handling - fails silently if account doesn't exist
3. No audit trail

**Fix:**
```typescript
async updateBalance(accountId: string, amount: number, userId: string) {
  // Validate account belongs to user
  const account = await this.accountRepository.findOne({
    where: { id: accountId, userId }
  });

  if (!account) {
    throw new ForbiddenException('Account not found or access denied');
  }

  // Update balance atomically
  const result = await this.accountRepository.increment(
    { id: accountId, userId },
    'balance',
    amount
  );

  if (result.affected === 0) {
    throw new InternalServerErrorException('Failed to update balance');
  }

  // Log for audit
  this.logger.log(`Balance updated for account ${accountId}: ${amount}`);

  return this.findOne(accountId, userId);
}
```

**Status:** ❌ Not Fixed
**Priority:** P0 - Fix Immediately

---

### 4. Password Reset Timing Attack Vulnerability

**Severity:** 🔴 CRITICAL
**File:** `/backend/src/modules/auth/auth.service.ts`
**Lines:** 482-503
**Impact:** Security vulnerability, Token enumeration, Account compromise

**Issue:**
```typescript
async resetPassword(passwordResetDto: ResetPasswordDto) {
  const users = await this.usersRepository.find({
    where: {
      passwordResetExpires: MoreThan(new Date()),
    },
  });

  let matchedUser: User | null = null;

  // ❌ TIMING ATTACK: Loop takes longer with more users
  for (const user of users) {
    const isTokenValid = await bcrypt.compare(
      passwordResetDto.token,
      user.passwordResetToken,
    );
    if (isTokenValid) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    throw new BadRequestException('Invalid or expired reset token');
  }
  // ...
}
```

**Problem:** Attacker can measure response time to determine if a token is valid. With multiple attempts, they can enumerate valid reset tokens.

**Fix:**
```typescript
async resetPassword(passwordResetDto: ResetPasswordDto) {
  // Use constant-time lookup by storing token hash as indexed column
  const tokenHash = await bcrypt.hash(passwordResetDto.token, 1); // Quick hash for lookup

  const user = await this.usersRepository.findOne({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: MoreThan(new Date()),
    },
  });

  if (!user) {
    // Delay response to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new BadRequestException('Invalid or expired reset token');
  }

  // Verify with constant-time comparison
  const isValid = await bcrypt.compare(passwordResetDto.token, user.passwordResetToken);
  if (!isValid) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    throw new BadRequestException('Invalid or expired reset token');
  }

  // Reset password...
}
```

**Alternative Better Fix:** Use UUID tokens stored unhashed with proper indexing.

**Status:** ❌ Not Fixed
**Priority:** P0 - Fix Immediately

---

### 5. Production Secret Exposure

**Severity:** 🔴 CRITICAL
**File:** `/backend/src/modules/auth/auth.service.ts`
**Lines:** 474-479
**Impact:** Security vulnerability if deployed to production

**Issue:**
```typescript
return {
  message: 'If an account with that email exists, a password reset link has been sent',
  // TODO: Remove this in production ❌ STILL HERE!
  resetToken, // Exposes sensitive token
  resetUrl,   // Exposes internal URLs
};
```

**Problem:** Password reset tokens and URLs exposed in API response. If this code reaches production, attackers can see reset tokens.

**Fix:**
```typescript
if (process.env.NODE_ENV === 'production') {
  return {
    message: 'If an account with that email exists, a password reset link has been sent',
  };
} else {
  // Development only
  return {
    message: 'If an account with that email exists, a password reset link has been sent',
    resetToken, // DEV ONLY
    resetUrl,   // DEV ONLY
  };
}
```

**Better Fix:** Remove completely and use proper email testing tools in development.

**Status:** ❌ Not Fixed
**Priority:** P0 - Fix Before Production

---

### 6. Invalid Auth Store Access - WebSocket Hook

**Severity:** 🔴 CRITICAL
**File:** `/frontend/src/hooks/useWebSocket.ts`
**Line:** 24
**Impact:** WebSocket authentication failure, Runtime error, No real-time updates

**Issue:**
```typescript
const { user, accessToken } = useAuthStore(); // ❌ accessToken doesn't exist in store!
```

**Problem:** The auth store (defined in `/frontend/src/stores/authStore.ts`) doesn't have an `accessToken` property. This will cause:
1. Runtime error when accessing undefined property
2. WebSocket authentication to fail
3. All real-time features to break

**Fix:**
```typescript
const { user } = useAuthStore();
// Tokens are in httpOnly cookies, no need to access them manually
```

**Status:** ❌ Not Fixed
**Priority:** P0 - Fix Immediately

---

### 7. Legacy Token Code Still in API Client

**Severity:** 🔴 CRITICAL
**File:** `/frontend/src/services/api.ts`
**Lines:** 13-16
**Impact:** Authentication confusion, Security inconsistency, Potential token leakage

**Issue:**
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // ❌ LEGACY CODE!
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Problem:** The application was migrated to use httpOnly cookies for authentication, but this legacy code still tries to read tokens from localStorage. This creates confusion and potential security issues.

**Fix:**
```typescript
api.interceptors.request.use((config) => {
  // Tokens are sent automatically via httpOnly cookies
  // No manual token handling needed
  return config;
});
```

**Status:** ❌ Not Fixed
**Priority:** P0 - Fix Immediately

---

## 🟠 HIGH PRIORITY BUGS (Priority 2 - Fix Before Production)

### 8. Missing Null Checks - Multiple Services

**Severity:** 🟠 HIGH
**Files:** Multiple
**Impact:** Runtime errors, Application crashes, Poor user experience

**Locations:**
- `/backend/src/modules/admin/admin.service.ts` (lines 68, 81, 98)
- `/backend/src/modules/groups/groups.service.ts` (lines 77, 89)
- `/backend/src/modules/budgets/budgets.service.ts` (line 45)
- Many other locations

**Issue:**
```typescript
async getUserById(id: string) {
  const user = await this.usersRepository.findOne({ where: { id } });
  return user.email; // ❌ Crashes if user is null!
}
```

**Fix:**
```typescript
async getUserById(id: string) {
  const user = await this.usersRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user.email;
}
```

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

### 9. Missing Input Validation - Transaction Controller

**Severity:** 🟠 HIGH
**File:** `/backend/src/modules/transactions/transactions.controller.ts`
**Lines:** 16, 21, 40
**Impact:** No validation, SQL injection risk, Data corruption

**Issue:**
```typescript
@Post()
create(@CurrentUser('id') userId: string, @Body() createDto: any) { // ❌ any type!
  return this.transactionsService.create(userId, createDto);
}

@Patch(':id')
update(@Param('id') id: string, @Body() updateDto: any) { // ❌ any type!
  return this.transactionsService.update(id, updateDto);
}
```

**Problem:** Using `any` type bypasses all validation. Malicious users can send:
- Negative amounts
- Future dates
- Invalid account IDs
- SQL injection attempts
- XSS payloads

**Fix:**
```typescript
// Create DTO with validation
import { IsNumber, IsString, IsDate, IsEnum, Min, MaxLength } from 'class-validator';

class CreateTransactionDto {
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER'])
  type: string;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsString()
  @MaxLength(200)
  description: string;

  @IsDate()
  date: Date;

  @IsString()
  accountId: string;
}

// Use in controller
@Post()
create(@CurrentUser('id') userId: string, @Body() createDto: CreateTransactionDto) {
  return this.transactionsService.create(userId, createDto);
}
```

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

### 10. Missing Error Handling - Import Service

**Severity:** 🟠 HIGH
**File:** `/backend/src/modules/import/import.service.ts`
**Lines:** 67-69
**Impact:** Information leakage, Unhelpful error messages, Security risk

**Issue:**
```typescript
try {
  // Parse file...
} catch (error) {
  throw new BadRequestException('Failed to parse file: ' + error.message); // ❌ Exposes internals!
}
```

**Problem:** Exposes internal error messages that may contain:
- File paths
- System information
- Stack traces
- Database errors

**Fix:**
```typescript
try {
  // Parse file...
} catch (error) {
  this.logger.error('File parsing failed', error.stack);

  if (error instanceof SyntaxError) {
    throw new BadRequestException('Invalid file format. Please ensure the file is valid CSV/Excel.');
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    throw new BadRequestException('File size exceeds maximum allowed (10MB).');
  } else {
    throw new BadRequestException('Failed to parse file. Please check the file format and try again.');
  }
}
```

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

### 11. Floating Point Precision Issues - Analytics Service

**Severity:** 🟠 HIGH
**File:** `/backend/src/modules/analytics/analytics.service.ts`
**Lines:** Multiple (96-99, 170-173, etc.)
**Impact:** Accumulating rounding errors, Incorrect financial calculations

**Issue:**
```typescript
return {
  totalIncome: Number(income.toFixed(2)), // ❌ Precision loss!
  totalExpenses: Number(expenses.toFixed(2)),
  netIncome: Number((income - expenses).toFixed(2)),
};
```

**Problem:**
- `toFixed(2)` rounds to 2 decimals
- Converting back to Number can introduce floating-point errors
- Small errors accumulate over many transactions
- Financial calculations should be exact

**Fix Option 1 - Store as Cents:**
```typescript
// Store all amounts as integer cents in database
// Convert only for display
return {
  totalIncome: Math.round(income), // Already in cents
  totalExpenses: Math.round(expenses),
  netIncome: Math.round(income - expenses),
};
```

**Fix Option 2 - Use Decimal Library:**
```typescript
import Decimal from 'decimal.js';

const income = new Decimal(incomeSum);
const expenses = new Decimal(expensesSum);

return {
  totalIncome: income.toNumber(),
  totalExpenses: expenses.toNumber(),
  netIncome: income.minus(expenses).toNumber(),
};
```

**Recommended:** Store amounts as integer cents (multiply by 100) in database, only convert to dollars for display.

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

### 12. No Transaction Scope - Merge Operations

**Severity:** 🟠 HIGH
**File:** `/backend/src/modules/transactions/transactions.service.ts`
**Lines:** 161-227
**Impact:** Data inconsistency, Partial updates, Database corruption

**Issue:**
```typescript
async mergeDuplicates(primaryId: string, duplicateIds: string[], userId: string) {
  // Step 1: Find transactions
  const primary = await this.findOne(primaryId, userId);
  const duplicates = await Promise.all(
    duplicateIds.map(id => this.findOne(id, userId))
  );

  // Step 2: Merge data
  // ... complex merging logic ...

  // Step 3: Save primary (NO TRANSACTION WRAPPER!)
  await this.transactionRepository.save(primary);

  // Step 4: Delete duplicates (If this fails, data is inconsistent!)
  await this.transactionRepository.softRemove(duplicates);

  // Step 5: Update balances (If this fails, balances are wrong!)
  await this.accountsService.recalculateBalance(primary.accountId);
}
```

**Problem:** If any step fails after step 3, the database is left in an inconsistent state.

**Fix:**
```typescript
async mergeDuplicates(primaryId: string, duplicateIds: string[], userId: string) {
  return await this.dataSource.transaction(async (manager) => {
    const transactionRepo = manager.getRepository(Transaction);
    const accountRepo = manager.getRepository(Account);

    // All operations within transaction
    const primary = await transactionRepo.findOne({ where: { id: primaryId, userId } });
    const duplicates = await transactionRepo.find({
      where: { id: In(duplicateIds), userId }
    });

    if (!primary || duplicates.length !== duplicateIds.length) {
      throw new NotFoundException('One or more transactions not found');
    }

    // Merge logic...

    await transactionRepo.save(primary);
    await transactionRepo.softRemove(duplicates);

    // Recalculate balance atomically
    const balance = await this.calculateAccountBalance(primary.accountId, manager);
    await accountRepo.update({ id: primary.accountId }, { balance });

    return primary;
  });
}
```

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

### 13. 2FA Backup Codes Not Persisted

**Severity:** 🟠 HIGH
**File:** `/backend/src/modules/auth/auth.service.ts`
**Lines:** 346-356
**Impact:** Backup codes can't be validated, Account lockout risk, Security issue

**Issue:**
```typescript
async enable2FA(userId: string, secret: string, code: string) {
  // ... verify code ...

  // Generate backup codes
  const backupCodes = this.generateBackupCodes(); // Creates 10 codes

  user.twoFactorEnabled = true;
  user.twoFactorSecret = secret;
  await this.usersRepository.save(user);

  return {
    message: '2FA successfully enabled',
    backupCodes, // ❌ Returned but NEVER SAVED!
  };
}
```

**Problem:** Backup codes are generated and shown to user but never saved to database. When user tries to use them, validation will fail.

**Fix:**
```typescript
async enable2FA(userId: string, secret: string, code: string) {
  // ... verify code ...

  // Generate and hash backup codes
  const backupCodes = this.generateBackupCodes();
  const hashedCodes = await Promise.all(
    backupCodes.map(code => bcrypt.hash(code, 10))
  );

  user.twoFactorEnabled = true;
  user.twoFactorSecret = secret;
  user.twoFactorBackupCodes = hashedCodes; // Save hashed codes
  await this.usersRepository.save(user);

  return {
    message: '2FA successfully enabled. Save these backup codes in a safe place.',
    backupCodes, // Show unhashed codes to user (only this once!)
  };
}

// Add verification method
async verify2FABackupCode(userId: string, code: string): Promise<boolean> {
  const user = await this.usersRepository.findOne({ where: { id: userId } });

  for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
    const isValid = await bcrypt.compare(code, user.twoFactorBackupCodes[i]);
    if (isValid) {
      // Remove used code
      user.twoFactorBackupCodes.splice(i, 1);
      await this.usersRepository.save(user);
      return true;
    }
  }

  return false;
}
```

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

### 14. React Hooks Dependency Issues - useWebSocket

**Severity:** 🟠 HIGH
**File:** `/frontend/src/hooks/useWebSocket.ts`
**Lines:** 102-110
**Impact:** Infinite re-renders, Memory leaks, Performance degradation

**Issue:**
```typescript
const connect = useCallback(() => {
  // ... connection logic ...
}, [url, options]); // ❌ options is an object, changes every render!

const disconnect = useCallback(() => {
  // ... disconnection logic ...
}, []); // ❌ May use stale socket reference!

useEffect(() => {
  if (autoConnect) {
    connect();
  }
  return () => {
    disconnect();
  };
}, [autoConnect, connect, disconnect]); // ❌ connect changes → infinite loop!
```

**Problem:**
1. `options` object creates new reference on every render
2. `connect` changes when `options` changes
3. Effect re-runs when `connect` changes
4. Infinite loop of connect/disconnect

**Fix:**
```typescript
const optionsRef = useRef(options);
useEffect(() => {
  optionsRef.current = options;
}, [options]);

const socketRef = useRef<Socket | null>(null);

const connect = useCallback(() => {
  if (socketRef.current?.connected) return;

  socketRef.current = io(url, optionsRef.current);
  // ... rest of connection logic ...
}, [url]); // Only depends on url

const disconnect = useCallback(() => {
  if (socketRef.current) {
    socketRef.current.disconnect();
    socketRef.current = null;
  }
}, []); // No dependencies

useEffect(() => {
  if (autoConnect) {
    connect();
  }
  return () => {
    disconnect();
  };
}, [autoConnect]); // Only autoConnect in dependencies
```

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

### 15. Missing Event Cleanup - useGroupWebSocket

**Severity:** 🟠 HIGH
**File:** `/frontend/src/hooks/useGroupWebSocket.ts`
**Lines:** 13-64
**Impact:** Memory leaks, Duplicate event handlers, Stale closures

**Issue:**
```typescript
useEffect(() => {
  if (!connected || !API_CONFIG.websocket.enabled) return;

  on('transaction:created', (data) => {
    // Handle event
  });

  on('transaction:updated', (data) => {
    // Handle event
  });

  on('group:settled', (data) => {
    // Handle event
  });

  // ❌ NO CLEANUP! Event listeners never removed!
}, [connected, on, groupId, queryClient]);
```

**Problem:**
1. Every time effect re-runs, new event listeners are added
2. Old listeners are never removed
3. Memory leak grows with each re-render
4. Same event triggers multiple handlers

**Fix:**
```typescript
useEffect(() => {
  if (!connected || !API_CONFIG.websocket.enabled) return;

  const handleTransactionCreated = (data: any) => {
    if (data.groupId === groupId) {
      queryClient.invalidateQueries(['group', groupId, 'transactions']);
    }
  };

  const handleTransactionUpdated = (data: any) => {
    if (data.groupId === groupId) {
      queryClient.invalidateQueries(['group', groupId, 'transactions']);
    }
  };

  const handleGroupSettled = (data: any) => {
    if (data.groupId === groupId) {
      queryClient.invalidateQueries(['group', groupId]);
    }
  };

  on('transaction:created', handleTransactionCreated);
  on('transaction:updated', handleTransactionUpdated);
  on('group:settled', handleGroupSettled);

  // ✅ CLEANUP
  return () => {
    off('transaction:created', handleTransactionCreated);
    off('transaction:updated', handleTransactionUpdated);
    off('group:settled', handleGroupSettled);
  };
}, [connected, on, off, groupId, queryClient]);
```

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

### 16. Potential Stale Closure - useGroupWebSocket

**Severity:** 🟠 HIGH
**File:** `/frontend/src/hooks/useGroupWebSocket.ts`
**Lines:** 13-64
**Impact:** Incorrect cache invalidation, Stale data, Poor UX

**Issue:**
```typescript
useEffect(() => {
  on('transaction:created', (data) => {
    queryClient.invalidateQueries(['group', groupId, 'transactions']);
    // ❌ groupId and queryClient might be stale!
  });
}, [connected, on, groupId, queryClient]);
```

**Problem:** The callback captures `groupId` and `queryClient` from closure. If they change, old callbacks still reference old values.

**Fix:**
```typescript
useEffect(() => {
  if (!connected || !API_CONFIG.websocket.enabled) return;

  const handleTransactionCreated = (data: any) => {
    // Use data.groupId from event, not closure
    if (data.groupId === groupId) {
      queryClient.invalidateQueries(['group', data.groupId, 'transactions']);
    }
  };

  on('transaction:created', handleTransactionCreated);

  return () => {
    off('transaction:created', handleTransactionCreated);
  };
}, [connected, on, off, groupId, queryClient]);
```

**Better Fix with useCallback:**
```typescript
const handleTransactionCreated = useCallback((data: any) => {
  if (data.groupId === groupId) {
    queryClient.invalidateQueries(['group', data.groupId, 'transactions']);
  }
}, [groupId, queryClient]);

useEffect(() => {
  if (!connected || !API_CONFIG.websocket.enabled) return;

  on('transaction:created', handleTransactionCreated);

  return () => {
    off('transaction:created', handleTransactionCreated);
  };
}, [connected, on, off, handleTransactionCreated]);
```

**Status:** ❌ Not Fixed
**Priority:** P1 - Fix Before Production

---

## 🟡 MEDIUM PRIORITY ISSUES (Priority 3 - Fix in Next Sprint)

### 17. parseInt/parseFloat Without Radix

**Severity:** 🟡 MEDIUM
**File:** `/backend/src/modules/admin/admin-dashboard.service.ts`
**Lines:** 196-197
**Impact:** Potential parsing errors with leading zeros

**Issue:**
```typescript
hour: parseInt(activity.hour), // ❌ Missing radix!
count: parseInt(activity.count),
```

**Problem:** Without radix parameter, `parseInt('08')` returns 0 in older JS versions (octal interpretation).

**Fix:**
```typescript
hour: parseInt(activity.hour, 10),
count: parseInt(activity.count, 10),
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

### 18. Unsafe String Parsing - Import Service

**Severity:** 🟡 MEDIUM
**File:** `/backend/src/modules/import/import.service.ts`
**Line:** 269
**Impact:** NaN values, Application crashes

**Issue:**
```typescript
amount: Math.abs(parseFloat(amount.replace(/[$,]/g, ''))),
```

**Problem:** If `amount` contains other characters, `parseFloat` returns NaN.

**Fix:**
```typescript
const cleanedAmount = amount.replace(/[$,]/g, '');
const parsedAmount = parseFloat(cleanedAmount);

if (isNaN(parsedAmount)) {
  throw new BadRequestException(`Invalid amount format: ${amount}`);
}

amount: Math.abs(parsedAmount),
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

### 19. Missing Pagination Limits

**Severity:** 🟡 MEDIUM
**File:** `/backend/src/modules/transactions/transactions.service.ts`
**Lines:** 58-64
**Impact:** Potential DoS via large requests

**Issue:**
```typescript
take: filters?.limit || 50, // ❌ No maximum enforced!
```

**Problem:** User can request `limit=999999` and overwhelm the database.

**Fix:**
```typescript
const MAX_LIMIT = 1000;
const DEFAULT_LIMIT = 50;

take: Math.min(filters?.limit || DEFAULT_LIMIT, MAX_LIMIT),
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

### 20. No Date Validation - Transaction Controller

**Severity:** 🟡 MEDIUM
**File:** `/backend/src/modules/transactions/transactions.controller.ts`
**Lines:** 28-31
**Impact:** Invalid Date objects, Application crashes

**Issue:**
```typescript
@Get('stats')
getStats(
  @CurrentUser('id') userId: string,
  @Query('startDate') startDate: string, // ❌ No validation!
  @Query('endDate') endDate: string,
) {
  return this.transactionsService.getStats(
    userId,
    new Date(startDate), // Could be Invalid Date!
    new Date(endDate)
  );
}
```

**Problem:** `new Date('invalid')` creates Invalid Date object, causing downstream errors.

**Fix:**
```typescript
// Create DTO with validation
class GetStatsDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

@Get('stats')
getStats(
  @CurrentUser('id') userId: string,
  @Query() query: GetStatsDto,
) {
  return this.transactionsService.getStats(
    userId,
    new Date(query.startDate),
    new Date(query.endDate)
  );
}
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

### 21. Missing Loading States - useTransactions Hook

**Severity:** 🟡 MEDIUM
**File:** `/frontend/src/features/transactions/hooks/useTransactions.ts`
**Impact:** Poor UX, No loading indicators

**Issue:**
```typescript
export const useTransactions = () => {
  const { read } = useCrud('/transactions');

  return {
    transactions: read.data, // ❌ No loading state exposed!
  };
};
```

**Fix:**
```typescript
export const useTransactions = () => {
  const { read } = useCrud('/transactions');

  return {
    transactions: read.data,
    isLoading: read.isLoading,
    error: read.error,
    refetch: read.refetch,
  };
};
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

### 22. No Cleanup for Dashboard Layout Drag State

**Severity:** 🟡 MEDIUM
**File:** `/frontend/src/features/dashboard/hooks/useDashboardLayout.ts`
**Impact:** Stuck UI state, Poor UX

**Issue:**
```typescript
const [isDragging, setIsDragging] = useState(false);

const handleDragStart = () => setIsDragging(true);
const handleDragEnd = () => setIsDragging(false);

// ❌ If component unmounts during drag, isDragging stuck as true
```

**Fix:**
```typescript
useEffect(() => {
  return () => {
    // Cleanup on unmount
    setIsDragging(false);
  };
}, []);
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

### 23. Axios Response Interceptor Changes Return Type

**Severity:** 🟡 MEDIUM
**File:** `/frontend/src/services/api.ts`
**Line:** 25
**Impact:** Unexpected behavior, Missing response headers/status

**Issue:**
```typescript
api.interceptors.response.use(
  (response) => response.data, // ❌ Changes axios behavior!
  (error) => Promise.reject(error)
);
```

**Problem:**
- Normal axios returns full response object
- This interceptor returns only `response.data`
- Developers expect `response.status`, `response.headers`, etc.
- Can cause confusion and bugs

**Fix Option 1 - Remove interceptor:**
```typescript
// Remove interceptor, access data explicitly
const { data } = await api.get('/accounts');
```

**Fix Option 2 - Document clearly:**
```typescript
/**
 * WARNING: Response interceptor returns response.data directly
 * To access headers/status, use response interceptor or error handler
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

### 24. No Request Rate Limiting

**Severity:** 🟡 MEDIUM
**File:** Backend configuration
**Impact:** API abuse, DoS attacks

**Issue:** No rate limiting configured on API endpoints.

**Fix:**
```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100, // 100 requests per minute
    }),
  ],
})
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

### 25. Missing CSRF Protection

**Severity:** 🟡 MEDIUM
**File:** Backend configuration
**Impact:** CSRF attacks on state-changing operations

**Issue:** No CSRF tokens for POST/PUT/DELETE requests.

**Fix:**
```typescript
// Install csurf
npm install csurf

// main.ts
import * as csurf from 'csurf';

app.use(csurf({ cookie: true }));
```

**Status:** ❌ Not Fixed
**Priority:** P2

---

## 🟢 LOW PRIORITY / CODE QUALITY ISSUES

### 26. Inconsistent Error Messages

**Severity:** 🟢 LOW
**Files:** Multiple
**Impact:** Confusing error messages, Poor UX

**Examples:**
- Some errors return `{ message: '...' }`
- Others return `{ error: '...' }`
- Some include error codes, others don't

**Fix:** Standardize error response format across all endpoints.

**Status:** ❌ Not Fixed
**Priority:** P3

---

### 27. Missing Logger Service

**Severity:** 🟢 LOW
**Files:** Multiple
**Impact:** Poor debugging, No log aggregation

**Issue:** Many services use `console.log` instead of proper logging service.

**Fix:**
```typescript
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);

  someMethod() {
    this.logger.log('Operation completed');
    this.logger.error('Operation failed', error.stack);
  }
}
```

**Status:** ❌ Not Fixed
**Priority:** P3

---

### 28. Type Safety - Many `any` Types

**Severity:** 🟢 LOW
**Files:** Multiple
**Impact:** Reduced type safety, Potential runtime errors

**Issue:** Numerous uses of `any` type throughout codebase.

**Fix:** Replace `any` with proper types or `unknown`.

**Status:** ❌ Not Fixed
**Priority:** P3

---

### 29. Missing API Documentation

**Severity:** 🟢 LOW
**Files:** Multiple controllers
**Impact:** Poor developer experience

**Issue:** Many endpoints lack Swagger/OpenAPI documentation.

**Fix:**
```typescript
@ApiOperation({ summary: 'Get all transactions' })
@ApiResponse({ status: 200, description: 'Returns all transactions' })
@ApiQuery({ name: 'limit', required: false, type: Number })
@Get()
findAll(@Query() filters: FilterDto) {
  // ...
}
```

**Status:** ❌ Not Fixed
**Priority:** P3

---

### 30. No Content Security Policy

**Severity:** 🟢 LOW
**File:** Frontend configuration
**Impact:** XSS vulnerability risk

**Issue:** Missing CSP headers in frontend.

**Fix:**
```typescript
// vite.config.ts or nginx.conf
headers: {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline';"
}
```

**Status:** ❌ Not Fixed
**Priority:** P3

---

## 📋 Summary & Recommendations

### Issues by Severity

| Severity | Count | Action Required |
|----------|-------|-----------------|
| 🔴 Critical | 7 | **Fix immediately before any deployment** |
| 🟠 High | 9 | **Must fix before production** |
| 🟡 Medium | 9 | **Fix in next sprint** |
| 🟢 Low | 5 | **Address as technical debt** |
| **Total** | **30** | |

### Critical Path to Production

**Phase 1 - Critical Fixes (1-2 days):**
1. Fix infinite recursion in Groups Service
2. Fix race conditions in transactions and balances
3. Fix authentication issues (WebSocket, legacy tokens)
4. Add transaction wrapping for atomic operations

**Phase 2 - Security Fixes (2-3 days):**
1. Add input validation DTOs
2. Fix password reset timing attack
3. Remove production secret exposure
4. Add 2FA backup code persistence
5. Fix error handling (no internal exposure)

**Phase 3 - Data Integrity (1-2 days):**
1. Add null checks throughout
2. Fix floating-point precision issues
3. Add proper error handling
4. Add transaction scopes for multi-step operations

**Phase 4 - Frontend Stability (1-2 days):**
1. Fix React hooks dependencies
2. Add event listener cleanup
3. Add loading/error states
4. Fix memory leaks

**Phase 5 - Quality Improvements (1 week):**
1. Add rate limiting
2. Add CSRF protection
3. Improve error messages
4. Add comprehensive logging
5. Improve type safety

### Testing Requirements

After fixes, ensure:
- [ ] All unit tests pass
- [ ] E2E tests cover critical paths
- [ ] Load testing for race conditions
- [ ] Security penetration testing
- [ ] Memory leak testing (frontend)

### Deployment Checklist

Before production deployment:
- [ ] All Critical (🔴) issues fixed
- [ ] All High (🟠) issues fixed
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Backup/restore procedures tested
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented

---

**Last Updated:** 2025-11-14
**Next Review:** After critical fixes implementation
