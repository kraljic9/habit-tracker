interface StreakCardProps {
    streakCount: number,
    largestStreak: number,
}

export default function StreakCard({ streakCount, largestStreak }: StreakCardProps) {
    return (
       <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col justify-between text-white">
            <h3 className="text-sm font-medium text-slate-400">Longest Current Streak</h3>
            
            <div className="my-3 flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <span className="text-3xl font-bold ">
                    {largestStreak === 0 ? 0 : largestStreak} {largestStreak === 1 ? 'Day' : 'Days'}
                </span>
            </div>

            <p className="text-sm text-slate-400">
                Current: <span className="text-orange-300">
                    {streakCount === 0 ? 0 : streakCount} {streakCount === 1 ? 'day' : 'days'}
                </span>
            </p>
        </div>
    );
}