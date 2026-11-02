interface overallCompletionCardProps {
         monthlyRate?: number;
    }

export default function OverallCompletionCard({monthlyRate} : overallCompletionCardProps) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h4 className="text-slate-400 text-sm font-medium">Overall Completion</h4>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
                {monthlyRate !== undefined ? `${monthlyRate}%` : 'Loading...' }
            </p>
        </div>
    )
}

