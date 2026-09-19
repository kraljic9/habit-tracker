import { useEffect, useState } from "react"
import type { Habit } from "../types";
import HabitForm from "./HabitForm";

const DATE_OPTIONS = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
} as const

function Dashboard() {

    let [dailyProgress, setDailyProgress] = useState(0);
    let [activeStreak, setActiveStreak] = useState(0);
    let [weeklyGoal, setWeeklyGoal] = useState(0);

    let [habits, setHabits] = useState<Habit[]>([])
    let [isModalOpen, setIsModalOpen] = useState(false);

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
                setHabits(() => habits.map((habit) => {
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

                        {/* Daily Progress */}
                        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Daily progress</p>
                                <p className="text-3xl font-extrabold text-emerald-400">{dailyProgress}%</p>
                            </div>

                            <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-400">
                                {dailyProgress}%
                            </div>
                        </div>
                        
                        {/* Active Streak */}
                        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Streak</p>

                            <div className="text-3xl font-extrabold text-amber-500 flex items-center gap-2">
                                🔥 {activeStreak} Days
                            </div>
                        </div>
                        
                        {/* Weekly Goals */}
                        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Weekly Goals
                            </p>

                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold text-white">
                                {weeklyGoal} / 7
                                </span>
                                <span className="text-xs font-bold text-slate-400 tracking-wider">
                                    COMPLETED  
                                </span>
                            </div>

                            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                                <div 
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${(weeklyGoal / 7) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                            {/* Habit Category */}
                        <div className="flex flex-col gap-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</p>
                        
                        <div className="flex flex-col gap-4 w-full">
                            {habits.map((habit: Habit) => {
                            // Determine category styles & progress bar colors
                            let badgeStyle = "";
                            let barColor = "";

                            switch (habit.category) {
                                case "Coding":
                                badgeStyle = "bg-blue-600 text-white";
                                barColor = "bg-blue-500";
                                break;
                                case "Mindfulness":
                                badgeStyle = "bg-purple-600 text-white";
                                barColor = "bg-purple-500";
                                break;
                                case "Health":
                                badgeStyle = "bg-red-600 text-white";
                                barColor = "bg-red-500";
                                break;
                                case "Fitness":
                                badgeStyle = "bg-emerald-600 text-white";
                                barColor = "bg-emerald-500";
                                break;
                            }

                            // Calculate progress percentage dynamically
                            let progressPercent = 0;
                            if (habit.metric.kind === "numeric") {
                                progressPercent = Math.min((habit.metric.current / habit.metric.target) * 100, 100);
                            } else if (habit.metric.kind === "timer") {
                                const targetSecs = habit.metric.targetMinutes * 60;
                                progressPercent = Math.min(
                                ((habit.metric.durationSeconds ?? 0) / targetSecs) * 100,
                                100)
                            }

                    return (
                    <div key={habit.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col gap-3">
                        
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeStyle}`}>
                                {habit.category}
                            </span>
                            <h3 className="text-base font-semibold text-slate-100 mt-2">{habit.title}</h3>
                            </div>
                            <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">
                            🔥 {habit.streak} Days
                            </span>
                        </div>

                        {/* Metric-Specific Controls */}
                        {habit.metric.kind === "boolean" && (
                            <div className="flex items-center justify-between mt-2">
                            {
                            !habit.metric.completed ? <span className="text-sm text-slate-400">
                                Status: {habit.metric.completed ? "Done" : "Pending"}
                            </span> : <span className="text-sm font-medium text-emerald-400">
                                Completed ✅
                            </span>
                            }
                            <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                            onClick={() => toggleCompleted(habit.id)}>
                                {habit.metric.completed ? "Completed ✅" : "Mark Complete"}
                            </button>
                            </div>
                        )}

                       {/* Numeric Section */}
                        {habit.metric.kind === "numeric" && (
                        <div className="flex items-center justify-between mt-2">
                            {habit.metric.current < habit.metric.target ? (
                            <span className="text-sm text-slate-400">
                                {habit.metric.unit}: <strong className="text-slate-200">{habit.metric.current}</strong> / {habit.metric.target}
                            </span>
                            ) : (
                            <span className="text-sm font-medium text-emerald-400">
                                Completed ✅
                            </span>
                            )}
                            <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-bold border border-red-500/30 transition-colors"
                            onClick={() => handleDecrement(habit.id)}
                            disabled={habit.metric.current === 0}
                            >
                                -
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-bold border border-emerald-500/30 transition-colors"
                            onClick={() => handleIncrement(habit.id)}
                            disabled={habit.metric.current >= habit.metric.target}
                            >
                                +
                            </button>
                            </div>
                        </div>
                        )}

                        {/* Timer Section */}
                        {habit.metric.kind === "timer" && (
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-slate-400">
                            {habit.metric.durationSeconds < habit.metric.targetMinutes * 60 ? (
                                <>
                                Time:{''} <strong className="text-slate-200">{formatTime(habit.metric.durationSeconds)}</strong> / {formatTime(habit.metric.targetMinutes * 60)}
                                </>
                            ) : (
                                <span className="text-sm font-medium text-emerald-400">
                                Completed ✅
                                </span>
                            )}
                            </span>
                            <div className="flex gap-2">
                            <button
                                onClick={() => toggleTimer(habit.id)}
                                className={`px-3 py-1 text-xs font-medium rounded-lg text-white transition-colors ${
                                habit.metric.isRunning
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-indigo-500 hover:bg-indigo-600'
                                }`}
                            >
                                {habit.metric.isRunning ? 'Pause' : 'Start'}
                            </button>
                            </div>
                        </div>
                        )}

                        {/* Dynamic Progress Bar (Hidden for Boolean) */}
                        {habit.metric.kind !== "boolean" && (
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
                            <div 
                                className={`${barColor} h-full transition-all duration-300`}
                                style={{ width: `${progressPercent}%` }}
                            />
                            </div>
                        )}

                        </div>
                    )
                    })}
                </div>
                </div>

    </main>
</div>
    )
}

export default Dashboard