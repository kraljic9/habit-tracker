import type { Habit } from "../types";

export interface HabitCardProps {
  habit: Habit;
  toggleCompleted: (id: number) => void;
  handleIncrement: (id: number) => void;
  handleDecrement: (id: number) => void;
  toggleTimer: (id: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function HabitCard({
  habit,
  toggleCompleted,
  handleIncrement,
  handleDecrement,
  toggleTimer,
}: HabitCardProps) {
  // Category badge & progress bar styling
  let badgeStyle = "";
  let barColor = "";

  switch (habit.category) {
    case "Coding":
      badgeStyle = "bg-blue-600 text-white";
      barColor = "bg-blue-500";
      break;
    case "Mindfulness":
      badgeStyle = "bg-purple-600 text-white";
      barColor = "bg-purple-500";
      break;
    case "Health":
      badgeStyle = "bg-red-600 text-white";
      barColor = "bg-red-500";
      break;
    case "Fitness":
      badgeStyle = "bg-emerald-600 text-white";
      barColor = "bg-emerald-500";
      break;
  }

  // Calculate progress percentage dynamically
  let progressPercent = 0;
  if (habit.metric.kind === "numeric") {
    progressPercent = Math.min(
      (habit.metric.current / habit.metric.target) * 100,
      100
    );
  } else if (habit.metric.kind === "timer") {
    const targetSecs = habit.metric.targetMinutes * 60;
    progressPercent = Math.min(
      ((habit.metric.durationSeconds ?? 0) / targetSecs) * 100,
      100
    );
  }

  return (
    <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeStyle}`}>
            {habit.category}
          </span>
          <h3 className="text-base font-semibold text-slate-100 mt-2">
            {habit.title}
          </h3>
        </div>
        <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">
          🔥 {habit.streak} Days
        </span>
      </div>

      {/* Boolean Metric Controls */}
      {habit.metric.kind === "boolean" && (
        <div className="flex items-center justify-between mt-2">
          {!habit.metric.completed ? (
            <span className="text-sm text-slate-400">
              Status: {habit.metric.completed ? "Done" : "Pending"}
            </span>
          ) : (
            <span className="text-sm font-medium text-emerald-400">
              Completed ✅
            </span>
          )}
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
            onClick={() => toggleCompleted(habit.id)}
          >
            {habit.metric.completed ? "Completed ✅" : "Mark Complete"}
          </button>
        </div>
      )}

      {/* Numeric Metric Controls */}
      {habit.metric.kind === "numeric" && (
        <div className="flex items-center justify-between mt-2">
          {habit.metric.current < habit.metric.target ? (
            <span className="text-sm text-slate-400">
              {habit.metric.unit}:{" "}
              <strong className="text-slate-200">{habit.metric.current}</strong> /{" "}
              {habit.metric.target}
            </span>
          ) : (
            <span className="text-sm font-medium text-emerald-400">
              Completed ✅
            </span>
          )}
          <div className="flex gap-2">
            <button
              className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-bold border border-red-500/30 transition-colors disabled:opacity-50"
              onClick={() => handleDecrement(habit.id)}
              disabled={habit.metric.current === 0}
            >
              -
            </button>
            <button
              className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-bold border border-emerald-500/30 transition-colors disabled:opacity-50"
              onClick={() => handleIncrement(habit.id)}
              disabled={habit.metric.current >= habit.metric.target}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Timer Metric Controls */}
      {habit.metric.kind === "timer" && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-slate-400">
            {habit.metric.durationSeconds < habit.metric.targetMinutes * 60 ? (
              <>
                Time:{" "}
                <strong className="text-slate-200">
                  {formatTime(habit.metric.durationSeconds)}
                </strong>{" "}
                / {formatTime(habit.metric.targetMinutes * 60)}
              </>
            ) : (
              <span className="text-sm font-medium text-emerald-400">
                Completed ✅
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => toggleTimer(habit.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg text-white transition-colors ${
                habit.metric.isRunning
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {habit.metric.isRunning ? "Pause" : "Start"}
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Progress Bar */}
      {habit.metric.kind !== "boolean" && (
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-1">
          <div
            className={`${barColor} h-full transition-all duration-300`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}