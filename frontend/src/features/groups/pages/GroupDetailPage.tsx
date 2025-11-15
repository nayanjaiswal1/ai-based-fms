import { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@services/api';
import {
  ArrowLeft,
  Users,
  DollarSign,
  Plus,
  Settings,
  TrendingUp,
  Receipt,
  User,
  Calendar,
} from 'lucide-react';
import { StatusBar } from '@/components/ui/StatusBar';
import { useCurrency } from '@/hooks/useCurrency';
import { useConfirm } from '@/hooks/useConfirm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { confirmState, confirm, closeConfirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances' | 'members'>('expenses');

  // Determine base path for navigation
  const basePath = location.pathname.includes('/shared-finance') ? '/shared-finance/groups' : '/groups';

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getOne(id!),
    enabled: !!id,
  });

  const { data: expenses } = useQuery({
    queryKey: ['group-expenses', id],
    queryFn: () => groupsApi.getExpenses(id!),
    enabled: !!id,
  });

  const { data: balances } = useQuery({
    queryKey: ['group-balances', id],
    queryFn: () => groupsApi.getBalances(id!),
    enabled: !!id,
  });

  const settleUpMutation = useMutation({
    mutationFn: (data: any) => groupsApi.settleUp(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', id] });
      toast.success('Settlement recorded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to settle up');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Group not found</p>
        <button
          onClick={() => navigate(basePath)}
          className="mt-4 text-primary hover:underline"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const { formatLocale } = useCurrency();

  const groupData = group.data;
  const totalMembers = groupData.members?.length || 0;
  const totalExpenses = groupData.totalExpenses || 0;
  const yourBalance = groupData.yourBalance || 0;

  const statusBarItems = useMemo(() => [
    {
      id: 'members',
      label: 'Members',
      value: totalMembers.toString(),
      icon: Users,
      color: '#3b82f6',
      details: [
        { label: 'Total Members', value: totalMembers },
        { label: 'Active Members', value: groupData.members?.filter((m: any) => m.isActive)?.length || 0 },
      ],
    },
    {
      id: 'expenses',
      label: 'Total Expenses',
      value: formatLocale(totalExpenses),
      icon: DollarSign,
      color: '#10b981',
      details: [
        { label: 'Total Amount', value: formatLocale(totalExpenses) },
        { label: 'Number of Expenses', value: groupData.expenseCount || 0 },
      ],
    },
    {
      id: 'balance',
      label: yourBalance >= 0 ? 'You are owed' : 'You owe',
      value: formatLocale(Math.abs(yourBalance)),
      icon: TrendingUp,
      color: yourBalance >= 0 ? '#10b981' : '#ef4444',
      details: [
        { label: 'Your Balance', value: formatLocale(yourBalance) },
        { label: 'Status', value: yourBalance >= 0 ? 'Owed to you' : 'You owe' },
      ],
    },
  ], [totalMembers, totalExpenses, yourBalance, groupData, formatLocale]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(basePath)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {groupData.description && (
            <div>
              <p className="text-sm text-muted-foreground">{groupData.description}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/groups/edit/${id}`)}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => {
              // TODO: Add expense to group
              toast('Add expense feature coming soon');
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>


      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'expenses'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('balances')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'balances'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Balances
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-4 px-1 border-b-2 transition-colors ${
              activeTab === 'members'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Members
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {expenses?.data?.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
                <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-medium text-foreground">No expenses yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your first expense to start tracking
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses?.data?.map((expense: any) => (
                  <div
                    key={expense.id}
                    className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{expense.description}</h4>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {expense.paidBy?.name || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          ${Number(expense.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Split {expense.splitType}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="space-y-4">
            {balances?.data?.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/50 p-12 text-center">
                <p className="text-muted-foreground">All settled up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {balances?.data?.map((balance: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {balance.from} → {balance.to}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {balance.from} owes {balance.to}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          ${Number(balance.amount).toFixed(2)}
                        </p>
                        <button
                          onClick={() => {
                            confirm({
                              title: 'Settle Up',
                              message: `Mark ${balance.from} as having paid ${balance.to} $${Number(balance.amount).toFixed(2)}?`,
                              variant: 'info',
                              confirmLabel: 'Settle',
                              onConfirm: async () => {
                                await settleUpMutation.mutateAsync({
                                  from: balance.fromId,
                                  to: balance.toId,
                                  amount: balance.amount,
                                });
                              },
                            });
                          }}
                          className="mt-1 text-xs text-primary hover:underline"
                        >
                          Settle up
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupData.members?.map((member: any) => (
              <div
                key={member.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog {...confirmState} onClose={closeConfirm} />

      {/* Excel-style Status Bar */}
      <StatusBar items={statusBarItems} />
    </div>
  );
}
