'use client';

import { useState, useEffect } from 'react';
import { formatDate, todayUTC } from '@/lib/dates';
import { Check, Plus } from 'lucide-react';

export default function TodayPage() {
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [newOutcome, setNewOutcome] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | 3 | null>(null);

  // Load outcomes from localStorage on component mount
  useEffect(() => {
    const savedOutcomes = localStorage.getItem('daily-outcomes');
    if (savedOutcomes) {
      setOutcomes(JSON.parse(savedOutcomes));
    }
  }, []);

  // Save outcomes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('daily-outcomes', JSON.stringify(outcomes));
  }, [outcomes]);

  const handleAddOutcome = (slot: 1 | 2 | 3) => {
    if (!newOutcome.trim()) return;

    const newOutcomeObj = {
      id: Date.now().toString(),
      slot,
      title: newOutcome.trim(),
      done: false,
      created_at: new Date().toISOString()
    };

    setOutcomes(prev => {
      const filtered = prev.filter(o => o.slot !== slot);
      return [...filtered, newOutcomeObj];
    });

    setNewOutcome('');
    setSelectedSlot(null);
  };

  const toggleOutcome = (outcomeId: string) => {
    setOutcomes(prev => 
      prev.map(o => 
        o.id === outcomeId ? { ...o, done: !o.done } : o
      )
    );
  };

  const getOutcomeForSlot = (slot: 1 | 2 | 3) => {
    return outcomes.find(o => o.slot === slot);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Today's Focus
        </h1>
        <p className="text-gray-600">
          {formatDate(todayUTC(), 'EEEE, MMMM do, yyyy')}
        </p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((slot) => {
          const outcome = getOutcomeForSlot(slot as 1 | 2 | 3);
          
          return (
            <div key={slot} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {outcome ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleOutcome(outcome.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        outcome.done
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {outcome.done && <Check size={14} />}
                    </button>
                    <span className={`${outcome.done ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {outcome.title}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">No outcome set for slot {slot}</span>
                  <button
                    onClick={() => setSelectedSlot(slot as 1 | 2 | 3)}
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
            <h3 className="text-lg font-semibold mb-4">Add Daily Outcome</h3>
            <input
              type="text"
              value={newOutcome}
              onChange={(e) => setNewOutcome(e.target.value)}
              placeholder="What do you want to achieve today?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleAddOutcome(selectedSlot)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setSelectedSlot(null);
                  setNewOutcome('');
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
