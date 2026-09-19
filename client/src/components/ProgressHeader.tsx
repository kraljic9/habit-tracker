import type { HabitStats } from "../hooks/useHabitStats";

interface ProgressHeaderProps {
    stats: HabitStats;
}

export default function ProgressHeader({ stats }: ProgressHeaderProps) {
    const { dailyProgress, maxStreak, totalCompletedToday, totalHabits } = stats;

    // SVG Circle Math
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (dailyProgress / 100) * circumference;

    return (
<>   {/* Daily Progress */}
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 p-5 rounded-2xl flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Daily progress
                    </p>
                    <p className="text-3xl font-extrabold text-emerald-400">{dailyProgress}%</p>
                </div>

                {/* SVG Circular Progress Bar */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        {/* Background Circle */}
                        <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            className="text-slate-800"
                            strokeWidth="5"
                            stroke="currentColor"
                            fill="transparent"
                        />
                        {/* Animated Progress Circle */}
                        <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            className="text-emerald-400 transition-all duration-500 ease-out"
                            strokeWidth="5"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                        />
                    </svg>
                    <span className="absolute font-bold text-xs text-emerald-400">
                        {dailyProgress}%
                    </span>
                </div>
            </div>

            {/* Active Streak */}
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Active Streak
                </p>
                <div className="text-3xl font-extrabold text-amber-500 flex items-center gap-2">
                    🔥 {maxStreak} Days
                </div>
            </div>

            {/* Daily Goals Completed */}
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Goals Completed
                </p>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                        {totalCompletedToday} / {totalHabits}
                    </span>
                    <span className="text-xs font-bold text-slate-400 tracking-wider">
                        COMPLETED
                    </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${totalHabits > 0 ? (totalCompletedToday / totalHabits) * 100 : 0}%` }}
                    />
                </div>
            </div>
      </>         
    );
}