import { useState } from "react"
import CommunityGroups from "./Community/CommunityGroups"
import GroupChallenges from "./Community/GroupChallenges"
import Leaderboard from "./Community/Leaderboard"
import MileStones from "./Community/MileStones"
import { DashboardLayout } from "./DashboardLayout"
import type { User } from "../types"
import { useCardButtonHooks } from "../hooks/useCardButtonHooks"


function Community() {

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('currentUser')
        return saved ? JSON.parse(saved) : null
    })

     const [isLogedIn, setIsLogedIn] = useState<boolean>(() => !!currentUser) 

     const {habits, handleAddHabit} = useCardButtonHooks(
             currentUser?.id ? currentUser.id : undefined
         );


   return (
   <>
   <DashboardLayout 
        currentUser={currentUser} 
        setCurrentUser={setCurrentUser} 
        isLogedIn={isLogedIn} 
        setIsLogedIn={setIsLogedIn}
        handleAddHabit={handleAddHabit}
        title="Community"
   >
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <CommunityGroups/>

        <MileStones/>

        <Leaderboard/>

        <div className="lg:col-span-3">
            <GroupChallenges/>
        </div>

    </div>
   </DashboardLayout>



    </>
    )
}

export default Community