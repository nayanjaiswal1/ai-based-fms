export enum SharedExpenseType {
  PERSONAL_DEBT = 'personal_debt',
  GROUP_EXPENSE = 'group_expense',
  TRIP = 'trip',
  HOUSEHOLD = 'household',
}

export enum DebtDirection {
  LEND = 'lend',
  BORROW = 'borrow',
}

export enum ParticipantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum SplitType {
  EQUAL = 'equal',
  CUSTOM = 'custom',
  PERCENTAGE = 'percentage',
  SHARES = 'shares',
  FULL = 'full',
}

export interface SharedExpenseGroup {
  id: string;
  name: string;
  description?: string;
  type: SharedExpenseType;
  isOneToOne: boolean;
  participantCount: number;
  otherPersonName?: string;
  otherPersonEmail?: string;
  otherPersonPhone?: string;
  debtDirection?: DebtDirection;
  icon?: string;
  color?: string;
  currency: string;
  isActive: boolean;
  createdBy: string;
  participants?: SharedExpenseParticipant[];
  transactions?: SharedExpenseTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface SharedExpenseParticipant {
  id: string;
  groupId: string;
  userId?: string;
  participantName?: string;
  participantEmail?: string;
  role: ParticipantRole;
  balance: number;
  isActive: boolean;
  user?: any;
}

export interface SharedExpenseTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  currency: string;
  paidBy: string;
  splitType: SplitType;
  splits: Record<string, number>;
  notes?: string;
  attachments?: string[];
  categoryId?: string;
  category?: any;
  groupId: string;
  isSettlement: boolean;
  createdBy: string;
  createdAt: string;
}

export interface CreatePersonalDebtDto {
  description: string;
  amount: number;
  date: string;
  otherPersonName: string;
  otherPersonEmail?: string;
  otherPersonPhone?: string;
  debtDirection: DebtDirection;
  currency?: string;
  notes?: string;
  categoryId?: string;
}

export interface CreateGroupExpenseDto {
  name: string;
  description?: string;
  type: SharedExpenseType;
  icon?: string;
  color?: string;
  currency?: string;
  participantUserIds?: string[];
  participantEmails?: string[];
}

export interface AddTransactionDto {
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  splitType: SplitType;
  splits?: Record<string, number>;
  notes?: string;
  categoryId?: string;
}

export interface SharedExpenseDisplayData extends SharedExpenseGroup {
  displayName: string;
  displaySubtitle: string;
  iconType: 'person' | 'group';
  iconColor: string;
  sortKey: string;
}
