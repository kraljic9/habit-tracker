// backend types.ts
export type Category = 'health' | 'fitness' | 'productivity' | 'learning' | 'other';

export type Metric = 
  | { kind: 'numeric'; current: number; target: number }
  | { kind: 'timer'; durationSeconds: number; targetMinutes: number; isRunning: boolean }
  | { kind: 'boolean'; completed: boolean };

export interface Habit {
  id: number;
  userId: number;
  title: string;
  category: Category;
  metric: Metric;
  streak: number;
  isComplete: boolean;
}

export interface User {
    id: number,
    name: string,
    username: string,
    email: string,
    password: string,
    createdAt: string,
    totalStreak: number,
    habits: Habit[];
}