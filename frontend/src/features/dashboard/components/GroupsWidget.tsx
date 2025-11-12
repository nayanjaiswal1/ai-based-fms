import { Users, ArrowRight } from 'lucide-react';

interface GroupData {
  data: any[];
}

interface GroupsWidgetProps {
  groups: GroupData | undefined;
  onClick: () => void;
}

export function GroupsWidget({ groups, onClick }: GroupsWidgetProps) {
  if (!groups?.data || groups.data.length === 0) return null;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Groups</h2>
        <ArrowRight className="h-5 w-5 text-gray-400" />
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-semibold text-gray-900">{groups.data.length} Groups</p>
            <p className="text-sm text-gray-500">Active expense sharing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
