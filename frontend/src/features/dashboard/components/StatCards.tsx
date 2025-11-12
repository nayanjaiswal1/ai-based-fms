import { LucideIcon } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

interface StatCardsProps {
  cards: StatCard[];
}

export function StatCards({ cards }: StatCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <div
          key={stat.title}
          onClick={stat.onClick}
          className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`rounded-lg p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
