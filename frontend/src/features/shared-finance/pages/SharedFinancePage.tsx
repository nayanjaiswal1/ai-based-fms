import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GroupsPage from '@/features/groups/pages/GroupsPage';
import LendBorrowPage from '@/features/lend-borrow/pages/LendBorrowPage';
import { Users, HandCoins } from 'lucide-react';

export default function SharedFinancePage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes('lend-borrow')) {
      return 'lend-borrow';
    }
    return 'groups';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Sync tab with URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL to reflect the active tab
    if (value === 'lend-borrow') {
      navigate('/shared-finance/lend-borrow', { replace: true });
    } else {
      navigate('/shared-finance/groups', { replace: true });
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Page Title */}
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Money & People</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage shared expenses with groups and track personal loans
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex h-full min-h-0 flex-col">
        <TabsList className="grid w-full max-w-md grid-cols-2 flex-shrink-0">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="lend-borrow" className="flex items-center gap-2">
            <HandCoins className="h-4 w-4" />
            Lend/Borrow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6 flex-1 overflow-y-auto">
          <GroupsPage />
        </TabsContent>

        <TabsContent value="lend-borrow" className="mt-6 flex-1 overflow-y-auto">
          <LendBorrowPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
