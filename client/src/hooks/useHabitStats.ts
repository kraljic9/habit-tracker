import { useMemo } from "react";
import type { Habit } from "../types";

export interface HabitStats {
    dailyProgress: number;
    totalCompletedToday: number;
    totalHabits: number;
    maxStreak: number;
}

export function useHabitStats(habits: Habit[]): HabitStats {
        return useMemo(() => {
        if (habits.length === 0) {
            return { dailyProgress: 0, totalCompletedToday: 0, totalHabits: 0, maxStreak: 0 };
        }

        let totalProgressSum = 0;
        let completedCount = 0;
        let maxStreakVal = 0;

        habits.forEach((habit) => {
            let habitPercent = 0;

            if (habit.metric.kind === "boolean") {
                habitPercent = habit.metric.completed ? 100 : 0;
            } else if (habit.metric.kind === "numeric") {
                habitPercent = Math.min((habit.metric.current / habit.metric.target) * 100, 100);
            } else if (habit.metric.kind === "timer") {
                const targetSecs = habit.metric.targetMinutes * 60;
                habitPercent = Math.min(((habit.metric.durationSeconds ?? 0) / targetSecs) * 100, 100);
            }

            if (habitPercent >= 100) {
                completedCount += 1;
            }

            if (habit.streak > maxStreakVal) {
                maxStreakVal = habit.streak;
            }

            totalProgressSum += habitPercent;
        });

        return {
            dailyProgress: Math.round(totalProgressSum / habits.length),
            totalCompletedToday: completedCount,
            totalHabits: habits.length,
            maxStreak: maxStreakVal,
        };
    }, [habits]);
}
