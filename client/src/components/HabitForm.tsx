import React, { useState } from 'react';
import type { Category, Metric, NumericMetric, TimerMetric, Habit } from '../types';

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHabit: (habit: Habit) => void;
}

export default function Form({ isOpen, onClose, onAddHabit }: FormProps) {
  type MetricKind = Metric['kind'];
  type NumericTarget = NumericMetric['target'];
  type NumericUnit = NumericMetric['unit'];
  type TimerMinutes = TimerMetric['targetMinutes'];

  let [category, setCategory] = useState<Category>('Health');
  let [metricKind, setMetricKind] = useState<MetricKind>('boolean');

  let [title, setTitle] = useState<string>('');
  let [targetGoal, setTargetGoal] = useState<NumericTarget>(1);
  let [unit, setUnit] = useState<NumericUnit>('');
  let [duaration, setDuaration] = useState<TimerMinutes>(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let metric: Metric;

    if (metricKind === 'boolean') {
      metric = {
        kind: 'boolean',
        completed: false,
      };
    } else if (metricKind === 'numeric') {
      metric = {
        kind: 'numeric',
        current: 0,
        target: targetGoal,
        unit: unit,
      };
    } else {
      metric = {
        kind: 'timer',
        durationSeconds: 0,
        targetMinutes: duaration,
      };
    }

    const newHabit: Habit = {
      id: Date.now(),
      title,
      category,
      metric,
      streak: 0,
      isComplete: false,
    };

    onAddHabit(newHabit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 text-stone-100 shadow-2xl transition-all flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-stone-800 pb-4">
          <h3 className="text-xl font-bold tracking-tight text-white">Add New Habit</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-800 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Habit Name Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Habit Name
          </label>
          <input
            type="text"
            name="HabitName"
            placeholder="e.g., Read 20 pages"
            className="w-full bg-stone-950 border border-stone-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 transition-all"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Category
          </label>
          <select
            name="categories"
            id=""
            className="w-full bg-stone-950 border border-stone-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white transition-all cursor-pointer"
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            <option value="Health">Health</option>
            <option value="Coding">Coding</option>
            <option value="Fitness">Fitness</option>
            <option value="Mindfulness">Mindfulness</option>
          </select>
        </div>

        {/* Metric Type Selector Segment */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Goal Type
          </label>
          <div className="grid grid-cols-3 gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={() => setMetricKind('boolean')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                metricKind === 'boolean'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-900'
              }`}
            >
              Boolean
            </button>
            <button
              type="button"
              onClick={() => setMetricKind('numeric')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                metricKind === 'numeric'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-900'
              }`}
            >
              Numeric
            </button>
            <button
              type="button"
              onClick={() => setMetricKind('timer')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                metricKind === 'timer'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-stone-900'
              }`}
            >
              Timer
            </button>
          </div>
        </div>

        {/* Dynamic Metric Inputs */}
        <div>
          {metricKind === 'numeric' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Target Goal
                </label>
                <input
                  type="number"
                  placeholder="10"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 transition-all"
                  onChange={(e) => setTargetGoal(Number(e.target.value) as NumericTarget)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="pages, glasses..."
                  className="w-full bg-stone-950 border border-stone-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 transition-all"
                  onChange={(e) => setUnit(e.target.value as NumericUnit)}
                />
              </div>
            </div>
          )}

          {metricKind === 'timer' && (
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Target Time
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  placeholder="15"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 pr-20 text-sm text-white placeholder-stone-600 transition-all"
                  onChange={(e) => setDuaration(Number(e.target.value) as TimerMinutes)}
                />
                <span className="absolute right-4 text-xs font-medium text-stone-400 pointer-events-none">
                  Minutes
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-stone-800 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 px-4 py-2.5 rounded-xl border border-stone-800 text-stone-300 hover:bg-stone-800 hover:text-white text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-1/2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            Create Habit
          </button>
        </div>
      </div>
    </div>
  );
}