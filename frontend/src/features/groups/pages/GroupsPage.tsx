import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@services/api';
import { Plus, Users, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import GroupModal from '../components/GroupModal';
import { PageHeader } from '@/components/ui/PageHeader';

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  // Detect modal state from URL path
  const isNewModal = location.pathname === '/groups/new';
  const modalMode = isNewModal ? 'new' : null;

  const { data: allGroups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  // Filter groups based on search
  const groups = useMemo(() => {
    if (!allGroups?.data) return allGroups;

    let filtered = allGroups.data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((group: any) =>
        group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return { ...allGroups, data: filtered };
  }, [allGroups, searchTerm]);

  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const handleCloseModal = () => {
    navigate('/groups');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search groups..."
        buttons={[
          {
            label: 'Create Group',
            icon: Plus,
            onClick: () => navigate('/groups/new'),
            variant: 'primary' as const,
          },
        ]}
      />

      {/* Loading/Empty States */}
      {isLoading ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">Loading groups...</p>
        </div>
      ) : groups?.data?.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">No groups yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Create a group to start sharing expenses with others
          </p>
          <button
            onClick={() => navigate('/groups/new')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups?.data?.map((group: any) => {
            const totalMembers = group.members?.length || 0;
            const totalExpenses = group.totalExpenses || 0;
            const yourBalance = group.yourBalance || 0;

            return (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className="cursor-pointer rounded-lg bg-white p-6 shadow transition-all hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    {group.description && (
                      <p className="mt-1 text-sm text-gray-500">{group.description}</p>
                    )}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Stats */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{totalMembers} members</p>
                      <p className="text-xs text-gray-500">In this group</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        ${Number(totalExpenses).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Total expenses</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        yourBalance >= 0 ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <TrendingUp
                        className={`h-4 w-4 ${
                          yourBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          yourBalance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {yourBalance >= 0 ? 'You are owed' : 'You owe'} $
                        {Math.abs(yourBalance).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">Your balance</p>
                    </div>
                  </div>
                </div>

                {/* Created date */}
                <div className="mt-4 border-t pt-3 text-xs text-gray-500">
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <GroupModal
        isOpen={!!modalMode}
        onClose={handleCloseModal}
        onSuccess={(groupId) => {
          navigate(`/groups/${groupId}`);
        }}
      />
    </div>
  );
}
