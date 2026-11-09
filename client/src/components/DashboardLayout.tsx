import { useState, useEffect } from "react";
import HabitForm from "./HabitForm";
import AccountForm from "./AccountForm";
import type { User, LoginPayload } from "../types";
import axios from "axios";

const DATE_OPTIONS = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
} as const;

interface DashboardLayoutProps {
    children: React.ReactNode;
    currentUser: User | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    isLogedIn: boolean;
    setIsLogedIn: React.Dispatch<React.SetStateAction<boolean>>;
    handleAddHabit: (habit: any) => void;
    title: string; // Dynamic title per page (e.g. "My daily habits" or "Analytics")
}

export function DashboardLayout({ 
    children, 
    currentUser, 
    setCurrentUser, 
    isLogedIn, 
    setIsLogedIn,
    handleAddHabit,
    title
}: DashboardLayoutProps) {
    let [isModalOpen, setIsModalOpen] = useState(false);
    let [isAccountModelOpen, setIsAccountModelOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [formattedDate, setFormattedDate] = useState(() => 
        new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const today = new Date(Date.now()).toLocaleDateString('en-US', DATE_OPTIONS);
            setFormattedDate((prevDate) => prevDate !== today ? today : prevDate);
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    const handleAddUser = async (newUser: User) => {
        try {
            const response = await axios.post('/api/register/user', newUser);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setCurrentUser(user);
            setIsLogedIn(true);
        } catch (err) {
            console.error("Registration failed", err);
        }
    };

    const handleLoginUser = async (payload: LoginPayload) => {
        try {
            const response = await axios.post('http://localhost:5000/api/login/user', payload);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setCurrentUser(user);
            setIsLogedIn(true);
        } catch (err) {
            alert("Invalid username or password");
        }
    };

    return (
        <div className="flex-1 min-h-screen bg-slate-950 text-slate-100 p-8">
            {/* Modals */}
            {isModalOpen && (
                <HabitForm
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAddHabit={handleAddHabit}
                    user={currentUser}
                />
            )}

            {isAccountModelOpen && (
                <AccountForm
                    isOpen={isAccountModelOpen}
                    onClose={() => setIsAccountModelOpen(false)}
                    onAddUser={handleAddUser}
                    onLogInUser={handleLoginUser}
                />
            )}

            {/* Navigation Bar */}
            <nav className="flex items-center justify-between pb-8 mb-8 border-b border-slate-800">
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Dashboard</p>
                <div className="relative">
                    <p 
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-full cursor-pointer transition-all select-none"
                    >
                        {isLogedIn ? `${currentUser?.username}'s dashboard` : 'Guest please login'} <span className="text-xs ml-1 text-slate-400">&#8964;</span>
                    </p>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-lg py-2 z-50">
                            {isLogedIn ? (
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsLogedIn(false);
                                        setCurrentUser(null);
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('currentUser');
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsAccountModelOpen((prev) => !prev);
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

            {/* Main Page Content */}
            <main className="flex flex-col gap-8 max-w-7xl mx-auto">
                <div className="flex flex-col gap-6">
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-3xl font-bold tracking-tight text-white">{title}</h3>
                            <p className="text-sm text-slate-400 mt-1">{formattedDate}</p>
                        </div>

                        <button 
                            className="self-start sm:self-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95" 
                            onClick={() => setIsModalOpen(true)}
                        >
                            + Add New Habit
                        </button>
                    </header>
                </div>

                {/* Unique page content gets rendered here */}
                {children}
            </main>
        </div>
    );
}