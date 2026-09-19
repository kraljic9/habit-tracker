import { useEffect, useState } from "react"
import type { Habit } from "../types";
import HabitForm from "./HabitForm";
import { useHabitStats } from "../hooks/useHabitStats";
import ProgressHeader from "./ProgressHeader";
import { HabitList } from "./HabitList";

const DATE_OPTIONS = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
} as const

function Dashboard() {
    
    let [habits, setHabits] = useState<Habit[]>([])
    let [isModalOpen, setIsModalOpen] = useState(false);
    
    const stats = useHabitStats(habits)

    const handleAddHabit = (newHabit: Habit) => {
        setHabits((prev) => [...prev, newHabit])
    }
    
    
    const [formattedDate, setFormattedDate] = useState(() => 
        new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
        )

        // Date Sync Interval
        useEffect(() => {
            const interval = setInterval(() => {
                const today = new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
                setFormattedDate((prevDate) => prevDate !== today ? today : prevDate)
            }, 6000)

            return () => clearInterval(interval);
        }, [])

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
            
            function formatTime(totalSeconds: number) {
                const mins = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                return `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

    return (
        <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 p-8">

            <div>
                {(isModalOpen ? (
                    <HabitForm
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAddHabit={handleAddHabit}
                    />
                ) : null)}
            </div>

            <nav className="flex items-center justify-between pb-8 mb-8 border-b border-slate-800">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Dashboard</p>
                <div>
                    {/* Add logo */}
                    <p className="text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-full cursor-pointer transition-all">
                        User's Dashboard <span className="text-xs ml-1 text-slate-400">&#8964;</span>
                    </p>
                </div>
            </nav>

            <main className="flex flex-col gap-8 max-w-7xl mx-auto">
                {/* Progress */}
                <div className="flex flex-col gap-6">
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div>
                        <h3 className="text-3xl font-bold tracking-tight text-white">My daily habits</h3>
                        <p className="text-sm text-slate-400 mt-1">{formattedDate}</p>
                    </div>

                    <button className="self-start sm:self-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95" onClick={() => setIsModalOpen((prev) => !prev)}>
                        + Add New Habit
                    </button>

                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                       <ProgressHeader stats={stats} />
                    </div>
                </div>

                            {/* Habit List */}
                        <div className="flex flex-col gap-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</p>

                            <HabitList
                                habits={habits}
                                toggleCompleted={toggleCompleted}
                                handleIncrement={handleIncrement}
                                handleDecrement={handleDecrement}
                                toggleTimer={toggleTimer}
                            />
                        <div className="flex flex-col gap-4 w-full">
                </div>
                </div>

    </main>
</div>
    )
}

export default Dashboard