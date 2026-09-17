import React, { use, useState } from 'react';
import type { Category, Metric } from '../types';

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  // Pass children or add your internal form elements inside!
  children?: React.ReactNode; 
}

export default function Form({ isOpen, onClose, children }: FormProps) {
  
  type MetricKind = Metric['kind']

  let [category, setCategory] = useState<Category>('Health');
  let [metricKind, setMetricKind] = useState<MetricKind>('boolean')

  let [habitName, setHabitName] = useState<string>('');
  let [targetGoal, setTargetGoal] = useState<number>(1);
  let [unit, setUnit] = useState<string>('')
  let [duaration, setDuaration] = useState<number>(15);

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
        <input type="text" name='HabitName' className='bg-white rounded-lg w-full'/>
      
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

        </div>
      

        <div>
          <button>Cancle</button>
          <button>Create Habit</button>
        </div>

      </div>
    </div>
  );
}