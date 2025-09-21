'use client';

import { useState, useEffect } from 'react';
import { Check, Plus } from 'lucide-react';

export default function FiveYearPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

  const currentYear = new Date().getFullYear();
  const fiveYearPeriod = `${currentYear}-${currentYear + 4}`;

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('five-year-goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('five-year-goals', JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = (slot: 1 | 2 | 3 | 4 | 5) => {
    if (!newGoal.trim()) return;

    const newGoalObj = {
      id: Date.now().toString(),
      slot,
      title: newGoal.trim(),
      done: false,
      area: 'work', // Default to work
      created_at: new Date().toISOString()
    };

    setGoals(prev => {
      const filtered = prev.filter(g => g.slot !== slot);
      return [...filtered, newGoalObj];
    });

    setNewGoal('');
    setSelectedSlot(null);
  };

  const toggleGoal = (goalId: string) => {
    setGoals(prev => 
      prev.map(g => 
        g.id === goalId ? { ...g, done: !g.done } : g
      )
    );
  };

  const getGoalForSlot = (slot: 1 | 2 | 3 | 4 | 5) => {
    return goals.find(g => g.slot === slot);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          5-Year Vision
        </h1>
        <p className="text-gray-600">
          {fiveYearPeriod}
        </p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((slot) => {
          const goal = getGoalForSlot(slot as 1 | 2 | 3 | 4 | 5);
          
          return (
            <div key={slot} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {goal ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleGoal(goal.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        goal.done
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {goal.done && <Check size={14} />}
                    </button>
                    <div className="flex-1">
                      <span className={`${goal.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {goal.title}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          goal.area === 'work' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {goal.area}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">No goal set for slot {slot}</span>
                  <button
                    onClick={() => setSelectedSlot(slot as 1 | 2 | 3 | 4 | 5)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add 5-Year Goal</h3>
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="What do you want to achieve in the next 5 years?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleAddGoal(selectedSlot)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setNewGoal('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
