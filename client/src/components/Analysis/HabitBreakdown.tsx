interface HabitBrakedownProp {
    healthStreak: number;
    codingStreak: number; 
    fitnessStreak: number;
    mindfulnessStreak: number;
    habits?: any[];
}

export default function HabitBrakedown({ 
    healthStreak, 
    codingStreak, 
    fitnessStreak, 
    mindfulnessStreak 
}: HabitBrakedownProp) {
    
    // Define the 4 fixed categories with their corresponding props and badge styles
    const categories = [
        { name: 'Coding', streak: codingStreak, badgeStyle: 'bg-blue-600 text-white' },
        { name: 'Mindfulness', streak: mindfulnessStreak, badgeStyle: 'bg-purple-600 text-white' },
        { name: 'Health', streak: healthStreak, badgeStyle: 'bg-red-600 text-white' },
        { name: 'Fitness', streak: fitnessStreak, badgeStyle: 'bg-emerald-600 text-white' },
    ];

    return (
        <div className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl text-white">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Habit Breakdown</h3>
            
            <div className="space-y-4">
                {categories.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                        {/* Category Pill Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${cat.badgeStyle}`}>
                            {cat.name}
                        </span>

                        {/* Streak count & Progress Bar */}
                        <div className="flex items-center space-x-4">
                            <span className="text-slate-300 font-medium flex items-center gap-1">
                                🔥 {cat.streak} Days
                            </span>

                            <div className="w-24 bg-slate-700/60 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(100, (cat.streak / 30) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}