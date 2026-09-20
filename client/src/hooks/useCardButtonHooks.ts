import type { Habit } from "../types";
import type { CardButtonHooksReturn } from "../types";
import { useState } from 'react';
import { useEffect } from "react";

export function useCardButtonHooks(initialHabits: Habit[] = []): CardButtonHooksReturn {
            
            const [habits, setHabits] = useState<Habit[]>(initialHabits);
    
             // Habit Timer Tick Interval
                        useEffect(() => {
                            const interval = setInterval(() => {
                                setHabits((prevHabits) =>
                                prevHabits.map((habit) => {
                                    if (
                                    habit.metric.kind !== 'timer' ||
                                    !habit.metric.isRunning ||
                                    (habit.metric.durationSeconds ?? 0) >= habit.metric.targetMinutes * 60
                                    ) {
                                    return habit;
                                    }
            
                                const currentSeconds = habit.metric.durationSeconds ?? 0;
                                const nextSecond = currentSeconds + 1; 
                                const targetSeconds = habit.metric.targetMinutes * 60;
                                const isNewlyCompleted = nextSecond === targetSeconds;
            
            
                                return {
                                ...habit,
                                streak: isNewlyCompleted ? habit.streak + 1 : habit.streak,
                                metric: {
                                    ...habit.metric,
                                    durationSeconds: nextSecond,
                                    isRunning: !isNewlyCompleted,
                                },
                                };
                            })
                            );
                        }, 1000);
            
                        return () => clearInterval(interval);
                    }, []);
               
            // Add habits

            const handleAddHabit = (newHabit: Habit) => {
                    setHabits((prev) => [...prev, newHabit])
                }


            // Functions kind increment

            function handleIncrement(id : number) {
                setHabits((prevHabits) => prevHabits.map((habit) => {
                    if (habit.id !== id || habit.metric.kind !== 'numeric') {
                        return habit
                    }
                    
                    let nextCurrent = habit.metric.current + 1;
                    let isNewlyCompleted = nextCurrent === habit.metric.target
                    
                    return {
                        ...habit,
                        streak: isNewlyCompleted ? habit.streak + 1 : habit.streak,
                        metric: {
                            ...habit.metric,
                            current: nextCurrent
                        }
                    }
                    
                }))
            }
            
            function handleDecrement(id: number) {
                setHabits((prevHabits) => prevHabits.map((habit) => {
                    
                    if (habit.id !== id || habit.metric.kind !== 'numeric') {
                        return habit
                    }
                    
                    const wasCompleted = habit.metric.current >= habit.metric.target
                    let nextCurrent = Math.max(0, habit.metric.current - 1);
                    let isNotCompleted = wasCompleted && nextCurrent < habit.metric.target
                    
                    return {
                        ...habit,
                        streak: isNotCompleted ? Math.max(0, habit.streak - 1) : habit.streak,
                        metric: {
                            ...habit.metric,
                            current: nextCurrent
                        }
                    }
                }))
            }
            
            // Function kind timer
            
            function toggleTimer(id : number) {
                console.log("Toggling timer for ID:", id);
                setHabits((prevHabits) => prevHabits.map((habit) => {
                    if (habit.id !== id || habit.metric.kind !== 'timer') {
                        return habit
                    }
                    
                    return {
                        ...habit,
                        metric: {
                            ...habit.metric,
                            isRunning: !habit.metric.isRunning
                        }
                    }
                }))
            }
        

            function toggleCompleted(id: number) {
                setHabits((prevHabits) => prevHabits.map((habit) => {
                    if (id !== habit.id || habit.metric.kind !== 'boolean') {
                        return habit
                    }

                    let isCompleted = habit.isComplete === true;

                    return {
                        ...habit,
                        isComplete: !habit.isComplete,
                        streak: !isCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
                        metric: {
                            ...habit.metric,
                            completed: !habit.metric.completed
                        }
                    }
                }))
            }

            return {habits, handleAddHabit, handleDecrement, handleIncrement, toggleTimer, toggleCompleted}

}