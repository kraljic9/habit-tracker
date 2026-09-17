import React, { useState } from 'react';
import type {Category, Metric, NumericMetric, TimerMetric, Habit } from '../types';

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  // Pass children or add your internal form elements inside!
  onAddHabit: (habit: Habit) => void
}

export default function Form({ isOpen, onClose, onAddHabit }: FormProps) {
  
  type MetricKind = Metric['kind']
  type NumericTarget = NumericMetric['target']
  type NumericUnit = NumericMetric['unit']
  type TimerMinutes = TimerMetric['targetMinutes'] 

  let [category, setCategory] = useState<Category>('Health');
  let [metricKind, setMetricKind] = useState<MetricKind>('boolean')

  let [title, setTitle] = useState<string>('');
  let [targetGoal, setTargetGoal] = useState<NumericTarget>(1);
  let [unit, setUnit] = useState<NumericUnit>('')
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
        durationMinutes: 0,
        targetMinutes: duaration,
      };
    }
    
    const newHabit: Habit = {
      id: Date.now(), // or crypto.randomUUID()
      title,
      category,
      metric,
      streak: 0,
    };
    
    onAddHabit(newHabit)
    
    onClose()
  }

  if (!isOpen) return null;

  return (
    /* Overlay: Semi-transparent backdrop blurring out the dashboard behind it */
    <div 
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all"
      onClick={onClose}
    >
      {/* Card: Centered floating box with rounded corners and warm mocha/slate surface */}
      <div 
        className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 text-stone-100 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the card
      >
        <div className="flex justify-between items-center mb-6 border-b border-stone-800 pb-4">
          <h3 className="text-xl font-bold tracking-tight text-white">Add New Habit</h3>
          <button 
            onClick={onClose} 
            className="text-stone-400 hover:text-white text-lg font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-800 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Your custom form inputs go here */}

        <label> Habit Name </label>
        <input type="text" name='HabitName' className='bg-white rounded-lg w-full' onChange={(e) => setTitle(e.target.value)
        }/>
      
        <label> Categorie </label>
        <select name="categories" id="" onChange={(e) => setCategory(e.target.value as Category)}>
            <option value="Health">Health</option>
            <option value="Coding">Coding</option>
            <option value="Fitness">Fitness</option>
            <option value="Mindfulness">Mindfulness</option>
          </select>     

        <div>
            <button onClick={() => setMetricKind('boolean')}>Boolean</button>
            <button onClick={() => setMetricKind('numeric')}>Numeric</button>
            <button onClick={() => setMetricKind('timer')}>Timer</button>
        </div>  

        <div>
            {metricKind === 'numeric' && (
              <>
              <label>Target Goal</label>
              <input type="number" onChange={(e) => setTargetGoal(Number(e.target.value) as NumericTarget)}/>

              <label>Unit</label>
              <input type="text" onChange={(e) => setUnit(e.target.value as NumericUnit)}/>
              </>
            ) }

            {metricKind === 'timer' && (
              <>
              <label>Time</label>
              <input type="number" onChange={(e) => setDuaration(Number(e.target.value) as TimerMinutes)}/><span>Minutes</span>
              </>
            )}
        </div>
      
        <div>
          <button onClick={handleSubmit}>Create Habit</button>
          <button onClick={onClose}>Cancle</button>
        </div>

      </div>
    </div>
  );
}