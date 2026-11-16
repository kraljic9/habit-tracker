import axios from "axios";
import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';

interface DailyCategories {
    Health: number;
    Fitness: number;
    Coding: number;
    Mindfulness: number;
}

export const MonthlyCompletionChart = () => {
    
    const getCurrentYearMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };
    

    const [monthlyData, setMonthlyData] = useState<Record<string, DailyCategories>>({});
    const [currentMonth, setCurrentMonth] = useState(getCurrentYearMonth);
    

    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/analytics/${currentMonth}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMonthlyData(response.data);
            } catch (err) {
                console.error("Failed to fetch monthly data", err);
            }
        };

        
        fetchMonthlyData();
    }, [currentMonth]); 
    
    const chartData = Object.entries(monthlyData).map(([fullDate, categories]: [string, any]) => ({
        date: fullDate.split('-')[2],
        ...categories
    }))


    const formattedMonth = new Date(`${currentMonth}-01`).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
});


  const legendItems = [
    { name: 'Health', badgeStyle: 'bg-red-600 text-white' },
    { name: 'Fitness', badgeStyle: 'bg-emerald-600 text-white' },
    { name: 'Coding', badgeStyle: 'bg-blue-600 text-white' },
    { name: 'Mindfulness', badgeStyle: 'bg-purple-600 text-white' },
];

return (
        <div className="w-full h-full min-h-[420px] bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow flex flex-col overflow-hidden">
            {/* Header row: Title + Month on left, block legend on right (padded) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-2">
                <div>
                    <h2 className="text-lg font-semibold">Monthly Habit Completion</h2>
                    <p className="text-xs text-slate-400">{formattedMonth}</p>
                </div>

                <div className="flex items-center gap-4">
                    {legendItems.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <span
                                className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${item.badgeStyle}`}
                            >
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart fills the remaining container height cleanly */}
            <div className="flex-1 min-h-0 pb-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid stroke="#334155" />
                        <XAxis
                            dataKey="date"
                            stroke="rgba(51, 65, 85, 0.5)"
                            tick={{ fill: 'rgba(226, 232, 240, 0.8)' }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            unit="%"
                            stroke="rgba(51, 65, 85, 0.5)"
                            tick={{ fill: 'rgba(226, 232, 240, 0.8)' }}
                        />
                        
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(30, 41, 59, 0.6)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(51, 65, 85, 0.5)',
                                borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: '#e2e8f0' }}
                        />

                        <Line type="monotone" dataKey="Health" stroke="#dc2626" strokeWidth={2} />
                        <Line type="monotone" dataKey="Fitness" stroke="#059669" strokeWidth={2} />
                        <Line type="monotone" dataKey="Coding" stroke="#2563eb" strokeWidth={2} />
                        <Line type="monotone" dataKey="Mindfulness" stroke="#9333ea" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default MonthlyCompletionChart;