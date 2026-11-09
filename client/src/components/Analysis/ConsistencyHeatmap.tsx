interface CompletionRecord {
    last_completed_date: string;
    completion_count: string | number; 
}

interface ConsistencyHeatmapProps {
    completeAmount: CompletionRecord[];
}

export default function ConsistencyHeatmap({completeAmount} : ConsistencyHeatmapProps) {

    const count = 89;
    let heatMapArr = [];
    let calcDate = new Date();

    const getLocalDateString = (d: Date) => {
        let year = d.getFullYear();
        let month = String(d.getMonth() + 1).padStart(2, '0');
        let date = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${date}`
    }
    
    heatMapArr.push(getLocalDateString(calcDate))

    for (let i = 0; i < count; i++) {
        calcDate = new Date(calcDate.getTime() - 86400000)
        heatMapArr.push(getLocalDateString(calcDate))
    }

    let reversed: any = heatMapArr.reverse();
  
    const completionMap: any = {};
    
    completeAmount?.forEach((item) => {
        const dateKey = item.last_completed_date.split('T')[0];
        completionMap[dateKey] = Number(item.completion_count);
    })

    const heatMap = reversed.map((dateStr: any) => ({
        date: dateStr,
        count: completionMap[dateStr] || 0      
}))

    return(
        <div className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl text-white">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Consistency Heatmap</h3>
            
            <div className="flex flex-wrap gap-1.5">
                {heatMap.map((item: any) => {
                    let bgColor = 'bg-slate-800/80'; 
                    if (item.count > 0 && item.count <= 2) bgColor = 'bg-orange-900/60';
                    if (item.count >= 3) bgColor = 'bg-orange-500'; 

                    return (
                        <div 
                            key={item.date} 
                            className={`w-3.5 h-3.5 rounded-sm transition-colors ${bgColor}`} 
                            title={`${item.date}: ${item.count} completions`}
                        />
                    );
                })}
            </div>
        </div>
    )
}