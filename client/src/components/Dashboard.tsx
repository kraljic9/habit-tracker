import { useEffect, useState } from "react"
import { useHabitStats } from "../hooks/useHabitStats";
import ProgressHeader from "./ProgressHeader";
import { HabitList } from "./HabitList";
import { useCardButtonHooks } from "../hooks/useCardButtonHooks";
import type { User } from "../types";
import { DashboardLayout } from "./DashboardLayout";

function Dashboard() {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('currentUser')
        return saved ? JSON.parse(saved) : null
    })
    
    const [isLogedIn, setIsLogedIn] = useState<boolean>(() => !!currentUser)  
    
    const {habits, handleAddHabit, handleDecrement, handleIncrement, toggleTimer, toggleCompleted, handleDelete} = useCardButtonHooks(
        currentUser?.id ? currentUser.id : undefined
    );
    
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser))
        } else {
            localStorage.removeItem('currentUser')
        }
    }, [currentUser])

    const userHabits = habits;
    const stats = useHabitStats(userHabits)

    return (
        <DashboardLayout 
            currentUser={currentUser} 
            setCurrentUser={setCurrentUser} 
            isLogedIn={isLogedIn} 
            setIsLogedIn={setIsLogedIn}
            handleAddHabit={handleAddHabit}
            title="My daily habits"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
               <ProgressHeader stats={stats}/>
            </div>

            <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My habits</p>

                {currentUser ? (
                    <HabitList
                        habits={userHabits}
                        toggleCompleted={toggleCompleted}
                        handleIncrement={handleIncrement}
                        handleDecrement={handleDecrement}
                        toggleTimer={toggleTimer}
                        handleDelete={handleDelete}
                    />
                ) : null}
            </div>
        </DashboardLayout>
    )
}

export default Dashboard    