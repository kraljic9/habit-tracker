import { useEffect, useState } from "react"
import HabitForm from "./HabitForm";
import { useHabitStats } from "../hooks/useHabitStats";
import ProgressHeader from "./ProgressHeader";
import { HabitList } from "./HabitList";
import { useCardButtonHooks } from "../hooks/useCardButtonHooks";
import  AccountForm  from "./AccountForm";
import type{ User } from "../types";

const DATE_OPTIONS = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
} as const

function Dashboard() {
    
    let [isModalOpen, setIsModalOpen] = useState(false);
    let [isAccountModelOpen, setIsAccountModelOpen] = useState(false)
    const {habits, handleAddHabit, handleDecrement, handleIncrement, toggleTimer, toggleCompleted} = useCardButtonHooks();
    
    const stats = useHabitStats(habits)

    const [isLogedIn, setIsLogedIn] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false) // Controls dropdown visibility

    const [currentUser, setCurrentUser] = useState<User | null>();

    const [users, setUsers] = useState<User[]>([])

    const handleAddUser = (newUser: User) => {
        setUsers((prev) => [...prev, newUser])
    }

    const handleLoginUser = (credentials: { username: string }) => {
        const foundUser = users.find((user) => user.username === credentials.username);
  
        if (foundUser) {
            setCurrentUser(foundUser);
            setIsLogedIn(true);
        } else {
            alert("User not found!");
        }
    };

    const [formattedDate, setFormattedDate] = useState(() => 
        new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
    )

    // Date Sync Interval
    useEffect(() => {
        const interval = setInterval(() => {
            const today = new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
            setFormattedDate((prevDate) => prevDate !== today ? today : prevDate)
        }, 6000)

        return () => clearInterval(interval);
    }, [])

    function formatTime(totalSeconds: number) {
        const mins = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 p-8">

            <div>
                {(isModalOpen ? (
                    <HabitForm
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAddHabit={handleAddHabit}
                    />
                ) : null)}
            </div>

            <div>
                {(isAccountModelOpen ? (
                    <AccountForm
                        isOpen={isAccountModelOpen}
                        onClose={() => setIsAccountModelOpen(false)}
                        onAddUser={handleAddUser}
                        onLogInUser={handleLoginUser}
                    />
                ) : null)}
            </div>

            <nav className="flex items-center justify-between pb-8 mb-8 border-b border-slate-800">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Dashboard</p>
                <div className="relative">
                    
                    {/* Trigger Button */}
                    <p 
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-full cursor-pointer transition-all select-none"
                    >
                       {isLogedIn ? `User's dashboard` : 'Guest please login'} <span className="text-xs ml-1 text-slate-400">&#8964;</span>
                    </p>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-lg py-2 z-50">
                            {isLogedIn ? (
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsLogedIn(false); // Handles logout logic
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsAccountModelOpen((prev) => !prev)
                                        // Open your auth modal here
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                                >
                                    Login / Register
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            <main className="flex flex-col gap-8 max-w-7xl mx-auto">
                {/* Progress */}
                <div className="flex flex-col gap-6">
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div>
                        <h3 className="text-3xl font-bold tracking-tight text-white">My daily habits</h3>
                        <p className="text-sm text-slate-400 mt-1">{formattedDate}</p>
                    </div>

                    <button className="self-start sm:self-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95" onClick={() => setIsModalOpen((prev) => !prev)}>
                        + Add New Habit
                    </button>

                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                       <ProgressHeader stats={stats} />
                    </div>
                </div>

                {/* Habit List */}
                <div className="flex flex-col gap-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</p>

                    <HabitList
                        habits={habits}
                        toggleCompleted={toggleCompleted}
                        handleIncrement={handleIncrement}
                        handleDecrement={handleDecrement}
                        toggleTimer={toggleTimer}
                    />
                    <div className="flex flex-col gap-4 w-full">
                    </div>
                </div>

            </main>
        </div>
    )
}

export default Dashboard