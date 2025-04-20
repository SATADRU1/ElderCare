export interface Reminder {
  id: string;
  type: 'medication' | 'appointment' | 'hydration' | 'custom';
  title: string;
  description?: string;
  time: string;
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  elderlyId: string;
  relatedItemId?: string;
  completed: boolean;
  completedTime?: string;
  notified: boolean;
  alarmDuration?: number;
  createdAt: string;
} 