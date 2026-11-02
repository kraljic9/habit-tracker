import { DashboardLayout } from "./DashboardLayout";
import { useEffect, useState } from "react";
import { useCardButtonHooks } from "../hooks/useCardButtonHooks";
import type { User } from "../types";
import axios from "axios";
import OverallCompletionCard from "./Analysis/OverallCompletionCard";
import StreakCard from "./Analysis/StreakCard";


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
    
    return (
        <>
        <DashboardLayout 
                    currentUser={currentUser} 
                    setCurrentUser={setCurrentUser} 
                    isLogedIn={isLogedIn} 
                    setIsLogedIn={setIsLogedIn}
                    handleAddHabit={handleAddHabit}
                    title="Analysis"
                >

                  <OverallCompletionCard
                    monthlyRate={userAnalytics?.monthlyRate}
                  />
                  
                  <StreakCard
                    streakCount={userAnalytics?.streakCount}
                    largestStreak={userAnalytics?.largestStrak}
                  />


                </DashboardLayout>
        </>
    )
}

export default Analysis