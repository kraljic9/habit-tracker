import { Link } from "react-router-dom"
import Settings from "./Settings"
import Community from "./Community"
import Analysis from "./Analysis"

function Nav() {
    return(
        <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 text-slate-300">
            <div className="flex items-center gap-3 px-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">H</span>
                <p className="text-xl font-bold tracking-tight text-white">Habitly</p>
            </div>

            <div className="flex flex-col gap-2">
                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-400 font-medium border border-indigo-500/20 transition-all hover:bg-indigo-600/20">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <p>Dashboard</p>
                </Link>
                
                <Link to="/analysis" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium transition-all">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    <p>Analysis</p>
                </Link>
                
                <Link to="/community" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium transition-all">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    <p>Community</p>
                </Link>

                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium transition-all">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    <p>Settings</p>
                </Link>
            </div>
        </aside>
    )
}

export default Nav