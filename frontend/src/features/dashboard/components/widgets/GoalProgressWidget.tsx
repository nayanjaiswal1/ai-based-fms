import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

interface Props {
  goals?: Goal[];
  config?: Record<string, any>;
}

export function GoalProgressWidget({ goals = [], config }: Props) {
  const navigate = useNavigate();

  const activeGoals = goals.slice(0, 3);

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {config?.title || 'Goal Progress'}
        </h3>
        <Target className="h-5 w-5 text-purple-500" />
      </div>

      <div className="space-y-4">
        {activeGoals.map((goal) => {
          const progress = getProgress(goal.currentAmount, goal.targetAmount);
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{goal.name}</p>
                  <p className="text-xs text-gray-500">{goal.category}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 ml-2">
                  {progress.toFixed(0)}%
                </p>
              </div>
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progress >= 100 ? 'bg-green-500' :
                      progress >= 75 ? 'bg-blue-500' :
                      progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>${goal.currentAmount.toFixed(2)}</span>
                <span>of ${goal.targetAmount.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {activeGoals.length === 0 && (
        <div className="text-center py-6">
          <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">No active goals</p>
          <button
            onClick={() => navigate('/goals')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {activeGoals.length > 0 && (
        <button
          onClick={() => navigate('/goals')}
          className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Goals
        </button>
      )}
    </div>
  );
}
