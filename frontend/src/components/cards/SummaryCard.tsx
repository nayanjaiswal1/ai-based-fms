import { ReactNode } from 'react';

export interface SummaryCardConfig {
  id: string;
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  valueColor?: string;
  formatter?: (value: any) => string;
}

export interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  valueColor?: string;
  className?: string;
}

export function SummaryCard({
  label,
  value,
  icon,
  iconBgColor,
  iconColor,
  valueColor = 'text-foreground',
  className = '',
}: SummaryCardProps) {
  return (
    <div className={`rounded-lg bg-card p-6 shadow transition-colors ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgColor}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export interface SummaryCardsProps {
  cards: SummaryCardConfig[];
  className?: string;
}

export function SummaryCards({ cards, className = '' }: SummaryCardsProps) {
  return (
    <div className={`grid gap-6 md:grid-cols-4 ${className}`}>
      {cards.map((card) => (
        <SummaryCard
          key={card.id}
          label={card.label}
          value={card.formatter ? card.formatter(card.value) : card.value}
          icon={card.icon}
          iconBgColor={card.iconBgColor}
          iconColor={card.iconColor}
          valueColor={card.valueColor}
        />
      ))}
    </div>
  );
}
