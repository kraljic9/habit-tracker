interface WeeklyProgressCardProps {
    weeklyScore: number;
}

export default function WeeklyProgressCard({ weeklyScore }: WeeklyProgressCardProps) {

    const safeScore = Math.min(Math.max(weeklyScore, 0), 7)
    const percentage = (safeScore / 7) * 100

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col justify-between text-white">
            <h3 className="text-sm font-medium text-slate-400">Weekly Average Progress</h3>

            <div className="my-3">
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold tracking-tight text-white">
                        {safeScore.toFixed(1)} / 7 
                    </span>
                    <span className="text-sm font-medium text-slate-400">completed</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}