'use client';

import { formatDate, getWeekStart, getWeekDays, isCurrentWeek } from '@/lib/dates';
import { Target, Plus, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WeekPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [goals, setGoals] = useState<any[]>([]);
  const [editingSlot, setEditingSlot] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [editText, setEditText] = useState('');
  const [maxSlots, setMaxSlots] = useState(3);

  const weekDays = getWeekDays(getWeekStart(selectedDate));
  const weekKey = formatDate(getWeekStart(selectedDate), 'yyyy-MM-dd');

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem(`weekly-goals-${weekKey}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      setGoals([]);
    }
    const savedMaxSlots = localStorage.getItem(`weekly-max-slots-${weekKey}`);
    if (savedMaxSlots) {
      setMaxSlots(parseInt(savedMaxSlots));
    }
  }, [weekKey]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`weekly-goals-${weekKey}`, JSON.stringify(goals));
    localStorage.setItem(`weekly-max-slots-${weekKey}`, maxSlots.toString());
  }, [goals, weekKey, maxSlots]);

  const handleAddGoal = (slot: 1 | 2 | 3 | 4 | 5) => {
    if (!editText.trim()) return;

    const newGoalObj = {
      id: Date.now().toString(),
      slot,
      title: editText.trim(),
      done: false,
      area: 'work',
      created_at: new Date().toISOString()
    };

    setGoals(prev => {
      const filtered = prev.filter(g => g.slot !== slot);
      return [...filtered, newGoalObj];
    });

    setEditText('');
    setEditingSlot(null);
  };

  const handleEditGoal = (slot: 1 | 2 | 3 | 4 | 5, newTitle: string) => {
    if (!newTitle.trim()) return;

    setGoals(prev => 
      prev.map(g => 
        g.slot === slot ? { ...g, title: newTitle.trim() } : g
      )
    );
    setEditingSlot(null);
    setEditText('');
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

  const addMoreSlots = () => {
    setMaxSlots(5);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Weekly Goals</h1>
        <p className="text-gray-600">
          Week of {formatDate(getWeekStart(selectedDate), 'MMM dd')} - {formatDate(weekDays[6], 'MMM dd, yyyy')}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 7);
              setSelectedDate(newDate);
            }}
            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            ← Previous Week
          </button>
          
          <button
            onClick={() => setSelectedDate(new Date())}
            className={`px-3 py-1 rounded ${
              isCurrentWeek(selectedDate)
                ? 'bg-blue-600 text-white'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            Current Week
          </button>
          
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 7);
              setSelectedDate(newDate);
            }}
            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            Next Week →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`text-center p-2 rounded ${
              day.toDateString() === new Date().toDateString()
                ? 'bg-blue-100 text-blue-900'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <div className="text-sm font-medium">{formatDate(day, 'EEE')}</div>
            <div className="text-lg">{formatDate(day, 'd')}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: maxSlots }, (_, i) => i + 1).map((slot) => {
          const goal = getGoalForSlot(slot as 1 | 2 | 3 | 4 | 5);
          const isEditing = editingSlot === slot;
          
          return (
            <div key={slot} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {goal ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
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
                    {isEditing ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditGoal(slot as 1 | 2 | 3 | 4 | 5, editText);
                            } else if (e.key === 'Escape') {
                              setEditingSlot(null);
                              setEditText('');
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditGoal(slot as 1 | 2 | 3 | 4 | 5, editText)}
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
                      <div className="flex-1">
                        <span 
                          className={`${goal.done ? 'line-through text-gray-500' : 'text-gray-900'} cursor-pointer`}
                          onClick={() => {
                            setEditText(goal.title);
                            setEditingSlot(slot as 1 | 2 | 3 | 4 | 5);
                          }}
                        >
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
                            handleAddGoal(slot as 1 | 2 | 3 | 4 | 5);
                          } else if (e.key === 'Escape') {
                            setEditingSlot(null);
                            setEditText('');
                          }
                        }}
                        placeholder="What do you want to achieve this week?"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        autoFocus
                      />
                      <button
                        onClick={() => handleAddGoal(slot as 1 | 2 | 3 | 4 | 5)}
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
                      <span className="text-gray-500">No goal set for slot {slot}</span>
                      <button
                        onClick={() => setEditingSlot(slot as 1 | 2 | 3 | 4 | 5)}
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

        {maxSlots < 5 && (
          <div 
            className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            onClick={addMoreSlots}
          >
            <div className="flex items-center justify-center space-x-2 text-gray-500 hover:text-blue-600">
              <Plus size={20} />
              <span className="font-medium">Add 2 more goals</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
