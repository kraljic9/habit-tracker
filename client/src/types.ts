export type BooleanMetric = {kind: 'boolean', completed: boolean};
export type NumericMetric = {kind: 'numeric', current: number, target: number, unit: string};
export type TimerMetric = {kind: 'timer', durationSeconds: number, targetMinutes: number, isRunning?: boolean};

export type Metric = BooleanMetric | NumericMetric | TimerMetric;
export type Category = 'Health' | 'Coding' | 'Fitness' | 'Mindfulness'

export interface CardButtonHooksReturn {
    habits: Habit[],
    handleAddHabit: (newHabit: Habit) => void;
    handleIncrement: (id: number) => void,
    handleDecrement: (id: number) => void,
    toggleTimer: (id: number) => void,
    toggleCompleted: (id: number) => void
}

export type Habit = {
    id: number,
    title: string,
    category: Category,
    metric: Metric,
    streak: number
    isComplete: boolean,
}