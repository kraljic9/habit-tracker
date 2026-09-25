import { useState } from "react"
import type { User } from "../types"

interface AccountProps {
    isOpen: boolean,
    onClose: () => void,
    onAddUser: (newUser: User) => void,
    onLogInUser: (credentials: { username: string; password: string }) => void;
}

export default function AccountForm({isOpen, onClose, onAddUser, onLogInUser}: AccountProps) {

    const [name, setName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic check for registration mode
        if (!isLoggingIn && password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const newUser: User = {
            id: Date.now(),
            name: name,
            username: userName,
            email: email,
            password: password,
            createdAt: new Date().toISOString(),
            totalStreak: 0,
            habits: []
        };

        if (!isLoggingIn) {
            onAddUser(newUser);
            onLogInUser(newUser);
        } else {
            onLogInUser({ username: userName, password: password });
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md text-slate-100 shadow-xl relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    ✕
                </button>

                <h3 className="text-2xl font-bold mb-6">
                    {isLoggingIn ? "Login" : "Register"}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLoggingIn && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-400 font-semibold">Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required
                                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold">Username</label>
                        <input 
                            type="text" 
                            value={userName} 
                            onChange={(e) => setUserName(e.target.value)} 
                            required
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    {!isLoggingIn && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-400 font-semibold">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    {!isLoggingIn && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-slate-400 font-semibold">Confirm Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required
                                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold py-2.5 rounded-xl transition-all active:scale-95"
                    >
                        {isLoggingIn ? "Login now" : "Register now"}
                    </button>
                </form>

                <p className="text-xs text-slate-400 mt-6 text-center">
                    {isLoggingIn ? (
                        <>
                            Don't have an account?{" "}
                            <span 
                                onClick={() => setIsLoggingIn(false)} 
                                className="text-amber-500 hover:underline cursor-pointer font-semibold"
                            >
                                Signup now
                            </span>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <span 
                                onClick={() => setIsLoggingIn(true)} 
                                className="text-amber-500 hover:underline cursor-pointer font-semibold"
                            >
                                Login now
                            </span>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}