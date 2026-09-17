import { NavLink } from "react-router-dom";

function Nav() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 text-slate-300">
      <div className="flex items-center gap-3 px-2">
        <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
          H
        </span>
        <p className="text-xl font-bold tracking-tight text-white">Habitly</p>
      </div>

      <div className="flex flex-col gap-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isActive ? 'bg-indigo-400' : 'bg-slate-500'
                }`}
              />
              <p>Dashboard</p>
            </>
          )}
        </NavLink>

        <NavLink
          to="/analysis"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isActive ? 'bg-indigo-400' : 'bg-slate-500'
                }`}
              />
              <p>Analysis</p>
            </>
          )}
        </NavLink>

        <NavLink
          to="/community"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isActive ? 'bg-indigo-400' : 'bg-slate-500'
                }`}
              />
              <p>Community</p>
            </>
          )}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isActive ? 'bg-indigo-400' : 'bg-slate-500'
                }`}
              />
              <p>Settings</p>
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}

export default Nav;