import { useEffect, useState } from "react"

function Dashboard() {

    let [dailyProgress, setDailyProgress] = useState(0);
    let [activeStreak, setActiveStreak] = useState(0);
    let [weeklyGoal, setWeeklyGoal] = useState(0);

    let [habits, setHabits] = useState([])

        const DATE_OPTIONS = {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        } as const

        const [formattedDate, setFormattedDate] = useState(() => 
              new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
        )

        useEffect(() => {
            const interval = setInterval(() => {
                const today = new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
                setFormattedDate((prevDate) => prevDate !== today ? today : prevDate)
            }, 6000)


            return () => clearInterval(interval);
        }, [])

    return (
        <>
            <nav>
                <p>Dashboard</p>

                <div>
                    {/* Add logo */}
                    <p>User's Dashboard <span>&#8964;</span></p>
                </div>
            </nav>

            <main>

                {/* Progress */}
                <div>
                    <h3>My daily habits</h3>
                    <p>{formattedDate}</p>
                </div>

                {/* Habit Category */}
                <div>

                </div>

            </main>
        </>
    )
}

export default Dashboard