'use client';

import { useState, useEffect } from 'react';
import { formatDate, todayUTC, getWeekStart } from '@/lib/dates';
import { Check, Plus, X, Link as LinkIcon } from 'lucide-react';

export default function TodayPage() {
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);
  const [editingSlot, setEditingSlot] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [editText, setEditText] = useState('');
  const [maxSlots, setMaxSlots] = useState(3);
  const [showLinkModal, setShowLinkModal] = useState<number | null>(null);

  const weekKey = formatDate(getWeekStart(), 'yyyy-MM-dd');

  // Load outcomes and weekly goals from localStorage
  useEffect(() => {
    const savedOutcomes = localStorage.getItem('daily-outcomes');
    if (savedOutcomes) {
      setOutcomes(JSON.parse(savedOutcomes));
    }
    const savedMaxSlots = localStorage.getItem('daily-max-slots');
    if (savedMaxSlots) {
      setMaxSlots(parseInt(savedMaxSlots));
    }
    const savedWeeklyGoals = localStorage.getItem(`weekly-goals-${weekKey}`);
    if (savedWeeklyGoals) {
      setWeeklyGoals(JSON.parse(savedWeeklyGoals));
    }
  }, [weekKey]);

  // Save outcomes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('daily-outcomes', JSON.stringify(outcomes));
    localStorage.setItem('daily-max-slots', maxSlots.toString());
  }, [outcomes, maxSlots]);

  const handleAddOutcome = (slot: 1 | 2 | 3 | 4 | 5) => {
    if (!editText.trim()) return;

    const newOutcomeObj = {
      id: Date.now().toString(),
      slot,
      title: editText.trim(),
      done: false,
      linkedToWeeklyGoal: null,
      created_at: new Date().toISOString()
    };

    setOutcomes(prev => {
      const filtered = prev.filter(o => o.slot !== slot);
      return [...filtered, newOutcomeObj];
    });

    setEditText('');
    setEditingSlot(null);
  };

  const handleEditOutcome = (slot: 1 | 2 | 3 | 4 | 5, newTitle: string) => {
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

  const linkToWeeklyGoal = (outcomeSlot: number, weeklyGoalId: string) => {
    setOutcomes(prev => 
      prev.map(o => 
        o.slot === outcomeSlot ? { ...o, linkedToWeeklyGoal: weeklyGoalId } : o
      )
    );
    setShowLinkModal(null);
  };

  const getOutcomeForSlot = (slot: 1 | 2 | 3 | 4 | 5) => {
    return outcomes.find(o => o.slot === slot);
  };

  const getLinkedWeeklyGoal = (weeklyGoalId: string) => {
    return weeklyGoals.find(g => g.id === weeklyGoalId);
  };

  const addMoreSlots = () => {
    setMaxSlots(5);
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
        <p className="text-sm text-blue-600 mt-1">
          💡 Link your daily outcomes to weekly goals for better focus
        </p>
      </div>

      <div className="space-y-4">
        {Array.from({ length: maxSlots }, (_, i) => i + 1).map((slot) => {
          const outcome = getOutcomeForSlot(slot as 1 | 2 | 3 | 4 | 5);
          const isEditing = editingSlot === slot;
          const linkedGoal = outcome?.linkedToWeeklyGoal ? getLinkedWeeklyGoal(outcome.linkedToWeeklyGoal) : null;
          
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
                              handleEditOutcome(slot as 1 | 2 | 3 | 4 | 5, editText);
                            } else if (e.key === 'Escape') {
                              setEditingSlot(null);
                              setEditText('');
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditOutcome(slot as 1 | 2 | 3 | 4 | 5, editText)}
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
                          className={`${outcome.done ? 'line-through text-gray-500' : 'text-gray-900'} cursor-pointer`}
                          onClick={() => {
                            setEditText(outcome.title);
                            setEditingSlot(slot as 1 | 2 | 3 | 4 | 5);
                          }}
                        >
                          {outcome.title}
                        </span>
                        
                        {linkedGoal ? (
                          <div className="flex items-center space-x-2 mt-2">
                            <LinkIcon size={12} className="text-blue-500" />
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              → {linkedGoal.title}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <button
                              onClick={() => setShowLinkModal(slot)}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                            >
                              <LinkIcon size={10} />
                              <span>Link to weekly goal</span>
                            </button>
                          </div>
                        )}
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
                            handleAddOutcome(slot as 1 | 2 | 3 | 4 | 5);
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
                        onClick={() => handleAddOutcome(slot as 1 | 2 | 3 | 4 | 5)}
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
              <span className="font-medium">Add 2 more outcomes</span>
            </div>
          </div>
        )}
      </div>

      {/* Link to Weekly Goal Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Link to Weekly Goal</h3>
            <p className="text-gray-600 mb-4">Choose which weekly goal this daily outcome supports:</p>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {weeklyGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => linkToWeeklyGoal(showLinkModal, goal.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-gray-900">{goal.title}</div>
                  <div className="text-sm text-gray-500">{goal.area}</div>
                </button>
              ))}
            </div>

            {weeklyGoals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No weekly goals set yet</p>
                <p className="text-sm">Create weekly goals first to link your daily outcomes</p>
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowLinkModal(null)}
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
