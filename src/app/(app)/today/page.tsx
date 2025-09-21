'use client';

import { useState, useEffect } from 'react';
import { formatDate, todayUTC } from '@/lib/dates';
import { Check, Plus, X } from 'lucide-react';

export default function TodayPage() {
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [editingSlot, setEditingSlot] = useState<1 | 2 | 3 | null>(null);
  const [editText, setEditText] = useState('');

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
    if (!editText.trim()) return;

    const newOutcomeObj = {
      id: Date.now().toString(),
      slot,
      title: editText.trim(),
      done: false,
      created_at: new Date().toISOString()
    };

    setOutcomes(prev => {
      const filtered = prev.filter(o => o.slot !== slot);
      return [...filtered, newOutcomeObj];
    });

    setEditText('');
    setEditingSlot(null);
  };

  const handleEditOutcome = (slot: 1 | 2 | 3, newTitle: string) => {
    if (!newTitle.trim()) return;

    setOutcomes(prev => 
      prev.map(o => 
        o.slot === slot ? { ...o, title: newTitle.trim() } : o
      )
    );
    setEditingSlot(null);
    setEditText('');
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
          const isEditing = editingSlot === slot;
          
          return (
            <div key={slot} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {outcome ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
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
                    {isEditing ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditOutcome(slot as 1 | 2 | 3, editText);
                            } else if (e.key === 'Escape') {
                              setEditingSlot(null);
                              setEditText('');
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditOutcome(slot as 1 | 2 | 3, editText)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSlot(null);
                            setEditText('');
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <span 
                        className={`flex-1 ${outcome.done ? 'line-through text-gray-500' : 'text-gray-900'} cursor-pointer`}
                        onClick={() => {
                          setEditText(outcome.title);
                          setEditingSlot(slot as 1 | 2 | 3);
                        }}
                      >
                        {outcome.title}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddOutcome(slot as 1 | 2 | 3);
                          } else if (e.key === 'Escape') {
                            setEditingSlot(null);
                            setEditText('');
                          }
                        }}
                        placeholder="What do you want to achieve today?"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddOutcome(slot as 1 | 2 | 3)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingSlot(null);
                          setEditText('');
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-500">No outcome set for slot {slot}</span>
                      <button
                        onClick={() => setEditingSlot(slot as 1 | 2 | 3)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <Plus size={16} />
                        <span>Add</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
