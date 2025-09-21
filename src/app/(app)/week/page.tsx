'use client';

import { formatDate, getWeekStart, getWeekDays, isCurrentWeek } from '@/lib/dates';
import { Target, Plus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WeekPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | 3 | 4 | 5 | null>(null);

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
  }, [weekKey]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`weekly-goals-${weekKey}`, JSON.stringify(goals));
  }, [goals, weekKey]);

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

      {goals.length > 0 ? (
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
      ) : (
        <div className="text-center py-8">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No weekly goals yet</h3>
          <p className="text-gray-600 mb-4">Set your first weekly goal to get started</p>
          <button 
            onClick={() => setSelectedSlot(1)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mx-auto"
          >
            <Plus size={16} />
            <span>Add Weekly Goal</span>
          </button>
        </div>
      )}

      {selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Weekly Goal</h3>
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="What do you want to achieve this week?"
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
