import React from 'react';

export interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date } | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  className = '',
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (disabled && disabled(newDate)) return;
    onSelect?.(newDate);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isSelected = (day: number) => {
    if (!selected) return false;
    const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selected instanceof Date) {
      return (
        currentDate.getDate() === selected.getDate() &&
        currentDate.getMonth() === selected.getMonth() &&
        currentDate.getFullYear() === selected.getFullYear()
      );
    }
    return false;
  };

  return (
    <div className={`p-3 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={previousMonth}
          className="px-3 py-1 hover:bg-accent rounded-md"
          type="button"
        >
          ←
        </button>
        <div className="font-semibold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={nextMonth}
          className="px-3 py-1 hover:bg-accent rounded-md"
          type="button"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const isDisabled = disabled && disabled(currentDate);
          const selected = isSelected(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              type="button"
              className={`
                h-9 w-9 p-0 font-normal rounded-md
                hover:bg-accent hover:text-accent-foreground
                ${selected ? 'bg-primary text-primary-foreground' : ''}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
