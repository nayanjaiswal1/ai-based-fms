import { useState, useEffect } from 'react';
import { ReportSchedule, ReportScheduleFrequency } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';

interface ReportSchedulerProps {
  schedule?: ReportSchedule;
  onChange: (schedule: ReportSchedule) => void;
}

export default function ReportScheduler({ schedule, onChange }: ReportSchedulerProps) {
  const [enabled, setEnabled] = useState(schedule?.enabled || false);
  const [frequency, setFrequency] = useState<ReportScheduleFrequency>(
    schedule?.frequency || ReportScheduleFrequency.MONTHLY
  );
  const [dayOfWeek, setDayOfWeek] = useState(schedule?.dayOfWeek || 1);
  const [dayOfMonth, setDayOfMonth] = useState(schedule?.dayOfMonth || 1);
  const [time, setTime] = useState(schedule?.time || '09:00');
  const [emailRecipients, setEmailRecipients] = useState<string>(
    schedule?.emailRecipients?.join(', ') || ''
  );

  useEffect(() => {
    const newSchedule: ReportSchedule = {
      enabled,
      frequency,
      dayOfWeek: frequency === ReportScheduleFrequency.WEEKLY ? dayOfWeek : undefined,
      dayOfMonth: frequency === ReportScheduleFrequency.MONTHLY ? dayOfMonth : undefined,
      time,
      emailRecipients: emailRecipients
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e),
    };
    onChange(newSchedule);
  }, [enabled, frequency, dayOfWeek, dayOfMonth, time, emailRecipients]);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Report Schedule
        </CardTitle>
        <CardDescription>
          Automatically generate and email this report on a recurring basis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="schedule-enabled" className="text-base">
              Enable Schedule
            </Label>
            <p className="text-sm text-muted-foreground">
              Turn on automatic report generation
            </p>
          </div>
          <Switch
            id="schedule-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(value) => setFrequency(value as ReportScheduleFrequency)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReportScheduleFrequency.DAILY}>Daily</SelectItem>
                  <SelectItem value={ReportScheduleFrequency.WEEKLY}>Weekly</SelectItem>
                  <SelectItem value={ReportScheduleFrequency.MONTHLY}>Monthly</SelectItem>
                  <SelectItem value={ReportScheduleFrequency.QUARTERLY}>
                    Quarterly
                  </SelectItem>
                  <SelectItem value={ReportScheduleFrequency.YEARLY}>Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === ReportScheduleFrequency.WEEKLY && (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select
                  value={dayOfWeek.toString()}
                  onValueChange={(value) => setDayOfWeek(parseInt(value))}
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {frequency === ReportScheduleFrequency.MONTHLY && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">Day of Month</Label>
                <Select
                  value={dayOfMonth.toString()}
                  onValueChange={(value) => setDayOfMonth(parseInt(value))}
                >
                  <SelectTrigger id="dayOfMonth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(28)].map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Maximum day is 28 to ensure validity across all months
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailRecipients">Email Recipients</Label>
              <Input
                id="emailRecipients"
                type="text"
                placeholder="email1@example.com, email2@example.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple email addresses with commas
              </p>
            </div>

            {schedule?.lastRun && (
              <div className="pt-4 border-t">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Run:</span>
                    <span className="font-medium">
                      {new Date(schedule.lastRun).toLocaleString()}
                    </span>
                  </div>
                  {schedule.nextRun && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Run:</span>
                      <span className="font-medium">
                        {new Date(schedule.nextRun).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
