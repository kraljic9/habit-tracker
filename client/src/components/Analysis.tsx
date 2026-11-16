import { DashboardLayout } from "./DashboardLayout";
import { useEffect, useState } from "react";
import { useCardButtonHooks } from "../hooks/useCardButtonHooks";
import type { User } from "../types";
import axios from "axios";
import OverallCompletionCard from "./Analysis/OverallCompletionCard";
import StreakCard from "./Analysis/StreakCard";
import WeeklyProgressCard from "./Analysis/WeeklyProgressCard";
import ConsistencyHeatmap from "./Analysis/ConsistencyHeatmap";
import HabitBrakedown from "./Analysis/HabitBreakdown";
import MonthlyCompletionChart from "./Analysis/MonthlyCompletionChart";


function Analysis() {

const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('currentUser')
        return saved ? JSON.parse(saved) : null
    })
    
    const [isLogedIn, setIsLogedIn] = useState<boolean>(() => !!currentUser)    
    
    const {habits, handleAddHabit} = useCardButtonHooks(
        currentUser?.id ? currentUser.id : undefined
    );

    const [userAnalytics, setUserAnalytics] = useState<any>(null); 
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser))
        } else {
            localStorage.removeItem('currentUser')
        }
    }, [currentUser])
    
    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!currentUser) return;
            
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/analytics', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserAnalytics(response.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };

        
        fetchAnalytics();
    }, [currentUser]);
    
console.log(userAnalytics)

    return (
    <DashboardLayout 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
        isLogedIn={isLogedIn} 
        setIsLogedIn={setIsLogedIn}
        handleAddHabit={handleAddHabit}
        title="Analysis"
    >
        {/* Top Row: 3 Equal KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <OverallCompletionCard
                monthlyRate={userAnalytics?.monthlyRate}
            />
            
            <StreakCard
                streakCount={userAnalytics?.currentStreak}
                largestStreak={userAnalytics?.largestStreak}
            />

            <WeeklyProgressCard
                weeklyScore={userAnalytics?.weeklyScore}
            />
        </div>

        {/* Bottom Row: 2/3 Chart on Left, 1/3 Stacked Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Spans 2 columns */}
            <div className="lg:col-span-2">
                <MonthlyCompletionChart />
            </div>

            {/* Right Side: Spans 1 column, stacked vertically */}
            <div className="flex flex-col gap-6">
                <ConsistencyHeatmap
                    completeAmount={userAnalytics?.completeAmount}
                />

                <HabitBrakedown 
                    healthStreak={userAnalytics?.healthStreak} 
                    codingStreak={userAnalytics?.codingStreak}
                    fitnessStreak={userAnalytics?.fitnessStreak} 
                    mindfulnessStreak={userAnalytics?.mindfulnessStreak}
                    habits={habits}
                />
            </div>
        </div>
    </DashboardLayout>
);
}

export default Analysis