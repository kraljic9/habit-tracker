import { useEffect, useState } from "react"
import type { Habit } from "../types";
import HabitForm from "./HabitForm";
function Dashboard() {

    let [dailyProgress, setDailyProgress] = useState(0);
    let [activeStreak, setActiveStreak] = useState(0);
    let [weeklyGoal, setWeeklyGoal] = useState(0);

    let [habits, setHabits] = useState<Habit[]>([])
    let [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddHabit = (newHabit: Habit) {
        setHabits((prev) => [...prev, newHabit])
    }
    
        const DATE_OPTIONS = {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        } as const

        const [formattedDate, setFormattedDate] = useState(() => 
              new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
        )

        useEffect(() => {
            const interval = setInterval(() => {
                const today = new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
                setFormattedDate((prevDate) => prevDate !== today ? today : prevDate)
            }, 6000)

            return () => clearInterval(interval);
        }, [])

    return (
        <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 p-8">

            <div>
                {(isModalOpen ? (
                    <HabitForm
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
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

                    <div className="min-h-32 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-500 text-sm">
                        
                    </div>
                </div>

            </main>
        </div>
    )
}

export default Dashboard