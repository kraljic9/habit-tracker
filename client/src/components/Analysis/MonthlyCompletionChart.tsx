import axios from "axios";
import { useEffect, useState } from "react";

export default function MonthlyCompletionChart() {
    // Helper to get current year-month string like "2026-11"
    const getCurrentYearMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const [currentMonth, setCurrentMonth] = useState(getCurrentYearMonth);
    const [monthlyData, setMonthlyData] = useState<any>(null);

    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/analytics/${currentMonth}`, {
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

    return (
        <>
        </>
    );
}