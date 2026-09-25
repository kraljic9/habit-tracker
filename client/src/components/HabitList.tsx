import type { Habit, User } from "../types";
import { HabitCard } from "./HabitCard";

interface HabitListProps {
  habits: Habit[];
  toggleCompleted: (id: number) => void;
  handleIncrement: (id: number) => void;
  handleDecrement: (id: number) => void;
  toggleTimer: (id: number) => void;
}

export function HabitList({ habits, ...handlers }: HabitListProps) {
  return (
    <div className="flex flex-col gap-4">
      {habits?.map((habit) => (
        <HabitCard key={habit.id} habit={habit} {...handlers} />
      ))}
    </div>
  );
}
