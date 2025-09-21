'use client';

import { useState, useEffect } from 'react';
import { supabase, ensureToday } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { formatDate, todayUTC } from '@/lib/dates';
import { Check, Plus } from 'lucide-react';

export default function TodayPage() {
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentWorkspace } = useAppStore();
  const [newOutcome, setNewOutcome] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<1 | 2 | 3 | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      loadTodayOutcomes();
    }
  }, [currentWorkspace]);

  const loadTodayOutcomes = async () => {
    if (!currentWorkspace) return;

    try {
      const dayId = await ensureToday(currentWorkspace);
      if (!dayId) return;

      const { data, error } = await supabase
        .from('daily_outcomes')
        .select(`
          *,
          weekly_goal:weekly_goals(*),
          area:areas(*)
        `)
        .eq('day_id', dayId)
        .order('slot');

      if (error) {
        console.error('Error loading outcomes:', error);
      } else {
        setOutcomes(data || []);
      }
    } catch (error) {
      console.error('Error loading outcomes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOutcome = async (slot: 1 | 2 | 3) => {
    if (!currentWorkspace || !newOutcome.trim()) return;

    try {
      const dayId = await ensureToday(currentWorkspace);
      if (!dayId) return;

      const { error } = await supabase
        .from('daily_outcomes')
        .upsert({
          day_id: dayId,
          slot,
          weekly_goal_id: 'placeholder',
          area_id: 'placeholder',
          title: newOutcome.trim(),
          done: false
        });

      if (error) {
        console.error('Error adding outcome:', error);
      } else {
        setNewOutcome('');
        setSelectedSlot(null);
        loadTodayOutcomes();
      }
    } catch (error) {
      console.error('Error adding outcome:', error);
    }
  };

  const toggleOutcome = async (outcomeId: string, done: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_outcomes')
        .update({ done })
        .eq('id', outcomeId);

      if (error) {
        console.error('Error updating outcome:', error);
      } else {
        loadTodayOutcomes();
      }
    } catch (error) {
      console.error('Error updating outcome:', error);
    }
  };

  const getOutcomeForSlot = (slot: 1 | 2 | 3) => {
    return outcomes.find(o => o.slot === slot);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          TodayToday's Focusapos;s Focus
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
                      onClick={() => toggleOutcome(outcome.id, !outcome.done)}
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
