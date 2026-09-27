import axios from "axios";
import type { Habit } from "../types";
import type { CardButtonHooksReturn } from "../types";
import { useState } from 'react';
import { useEffect } from "react";

export function useCardButtonHooks(userId?: number): CardButtonHooksReturn {
            
            const [habits, setHabits] = useState<Habit[]>([]);
    
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


            // Display users habits
            useEffect(() => {

                if (!userId) return;

                const fetchHabits = async () => {
                    try{
                        const response = await axios.get('http://localhost:5000/api/habits');
                        setHabits(response.data);
                    }catch(err){
                        console.log('Error accured failed to fetch habits', err)
                    }
                }

                fetchHabits();
            }, [])
               
            // Add habits
            const handleAddHabit = async (habitData: Omit<Habit, 'id' | 'userId'>) => {
                    if (!userId) return;

                    try {
                        const response = await axios.post('http://localhost:5000/api/habits', {
                            ...habitData,
                            userId: userId // Attach the userId from the hook parameter
                        });
                        setHabits(prev => [...prev, response.data]);
                    } catch (err) {
                        console.error("Failed to create habit", err);
                    }
                };


            // Sync habit edit

            const syncHabitWithServer = async (updatedHabit: Habit) => {
                try{
                    await axios.put(`http://localhost:5000/api/habits/${updatedHabit.id}`, updatedHabit)
                }
                catch(err) {
                    console.error("Failed to persist habit update", err);
                }
            }

            // Functions kind increment

            function handleIncrement(id : number) {
                setHabits((prevHabits) => prevHabits.map((habit) => {
                    if (habit.id !== id || habit.metric.kind !== 'numeric') {
                        return habit
                    }
                    
                    let nextCurrent = habit.metric.current + 1;
                    let isNewlyCompleted = nextCurrent === habit.metric.target
                    
                    const update = {
                        ...habit,
                        streak: isNewlyCompleted ? habit.streak + 1 : habit.streak,
                        metric: {
                            ...habit.metric,
                            current: nextCurrent
                        }
                    }

                    syncHabitWithServer(update);
                    return update
                }))
            }
            
            // function kind decrement

            function handleDecrement(id: number) {
                setHabits((prevHabits) => prevHabits.map((habit) => {
                    
                    if (habit.id !== id || habit.metric.kind !== 'numeric') {
                        return habit
                    }
                    
                    const wasCompleted = habit.metric.current >= habit.metric.target
                    let nextCurrent = Math.max(0, habit.metric.current - 1);
                    let isNotCompleted = wasCompleted && nextCurrent < habit.metric.target
                    
                    const update = {
                        ...habit,
                        streak: isNotCompleted ? Math.max(0, habit.streak - 1) : habit.streak,
                        metric: {
                            ...habit.metric,
                            current: nextCurrent
                        }
                    }

                    syncHabitWithServer(update)
                    return update
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