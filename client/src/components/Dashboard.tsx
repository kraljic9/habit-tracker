import { useEffect, useState } from "react"
import type { Habit } from "../types";
import HabitForm from "./HabitForm";
function Dashboard() {

    let [dailyProgress, setDailyProgress] = useState(0);
    let [activeStreak, setActiveStreak] = useState(0);
    let [weeklyGoal, setWeeklyGoal] = useState(0);

    let [habits, setHabits] = useState<Habit[]>([])
    let [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddHabit = (newHabit: Habit) => {
        setHabits((prev) => [...prev, newHabit])
    }

    console.log(habits)

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
      // 1. Determine category styles & progress bar colors
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

      // 2. Calculate progress percentage dynamically
      let progressPercent = 0;
      if (habit.metric.kind === "numeric") {
        progressPercent = Math.min((habit.metric.current / habit.metric.target) * 100, 100);
      } else if (habit.metric.kind === "timer") {
        progressPercent = Math.min((habit.metric.durationMinutes / habit.metric.targetMinutes) * 100, 100);
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
              <span className="text-sm text-slate-400">
                Status: {habit.metric.completed ? "Done" : "Pending"}
              </span>
              <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                {habit.metric.completed ? "Completed ✅" : "Mark Complete"}
              </button>
            </div>
          )}

          {habit.metric.kind === "numeric" && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-400">
                {habit.metric.unit}: <strong className="text-slate-200">{habit.metric.current}</strong> / {habit.metric.target}
              </span>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-bold border border-red-500/30 transition-colors">
                  -
                </button>
                <button className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-bold border border-emerald-500/30 transition-colors">
                  +
                </button>
              </div>
            </div>
          )}

          {habit.metric.kind === "timer" && (
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-400">
                Time: <strong className="text-slate-200">{habit.metric.durationMinutes}m</strong> / {habit.metric.targetMinutes}m
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white">Start</button>
                <button className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">Pause</button>
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
      );
    })}
  </div>
</div>

            </main>
        </div>
    )
}

export default Dashboard