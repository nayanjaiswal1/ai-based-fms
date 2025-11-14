import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SharedExpensesList } from '../components/SharedExpensesList';

export function SharedExpensesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'debts' | 'groups'>('all');

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Shared Expenses</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="debts">Personal Debts</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <SharedExpensesList filter="all" />
        </TabsContent>

        <TabsContent value="debts">
          <SharedExpensesList filter="debts" />
        </TabsContent>

        <TabsContent value="groups">
          <SharedExpensesList filter="groups" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
