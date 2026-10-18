import type { ReactNode } from "react";

export type BooleanMetric = {kind: 'boolean', completed: boolean};
export type NumericMetric = {
  unit: ReactNode; kind: 'numeric', current: number, target: number,
};
export type TimerMetric = {kind: 'timer', durationSeconds: number, targetMinutes: number, isRunning?: boolean};

export type Metric = BooleanMetric | NumericMetric | TimerMetric;
export type Category = 'Health' | 'Coding' | 'Fitness' | 'Mindfulness'

export type LoginPayload = {username: string, password: string} | User;

export interface CardButtonHooksReturn {
    habits: Habit[],
    handleAddHabit: (newHabit: Habit) => void;
    handleIncrement: (id: number) => void,
    handleDecrement: (id: number) => void,
    toggleTimer: (id: number) => void,
    toggleCompleted: (id: number) => void
    handleDelete: (id: number) => void
}

export type Habit = {
    id: number;
    userId: number;
    title: string,
    category: Category,
    metric: Metric,
    streak: number
    isComplete: boolean,
}

export interface Users {
    users: User[];
}

export type User = {
    id: number,
    name: string,
    username: string,
    email: string,
    password: string,
    createdAt: string,
    totalStreak: number,
} 
