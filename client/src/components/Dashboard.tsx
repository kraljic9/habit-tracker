import { useState } from "react"

function Dashboard() {

    let [dailyProgress, setDailyProgress] = useState(0);
    let [activeStreak, setActiveStreak] = useState(0);
    let [weeklyGoal, setWeeklyGoal] = useState(0);

    let [habits, setHabits] = useState([])

    return (
        <>
            <nav>
                <p>Dashboard</p>

                <div>
                    <img src="" alt="" />
                    <p>User's Dashboard <span>&#8964;</span></p>
                </div>
            </nav>

            <main>

                {/* Progress */}
                <div>

                </div>

                {/* Habit Category */}
                <div>

                </div>

            </main>
        </>
    )
}

export default Dashboard