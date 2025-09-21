'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Plus, X, Archive, Lightbulb, Target, Calendar, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { formatDate, todayUTC, getWeekStart } from '@/lib/dates';

interface InactiveGoal {
  id: string;
  title: string;
  horizon: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'five-year';
  archivedAt: string;
  originalSlot?: number;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [inactiveGoals, setInactiveGoals] = useState<InactiveGoal[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalHorizon, setNewGoalHorizon] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'five-year'>('weekly');
  const router = useRouter();

  const weekKey = formatDate(getWeekStart(), 'yyyy-MM-dd');

  useEffect(() => {
    loadInactiveGoals();
  }, []);

  const loadInactiveGoals = () => {
    const stored = localStorage.getItem('inactive-goals');
    if (stored) {
      setInactiveGoals(JSON.parse(stored));
    }
  };

  const saveInactiveGoals = (goals: InactiveGoal[]) => {
    localStorage.setItem('inactive-goals', JSON.stringify(goals));
    setInactiveGoals(goals);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const addInactiveGoal = () => {
    if (!newGoalTitle.trim()) return;

    const newGoal: InactiveGoal = {
      id: `inactive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newGoalTitle.trim(),
      horizon: newGoalHorizon,
      archivedAt: new Date().toISOString()
    };

    const updatedGoals = [...inactiveGoals, newGoal];
    saveInactiveGoals(updatedGoals);
    
    setNewGoalTitle('');
    setNewGoalHorizon('weekly');
    setShowAddGoal(false);
  };

  const reactivateGoal = (goalId: string) => {
    const goal = inactiveGoals.find(g => g.id === goalId);
    if (!goal) return;

    // Add to the appropriate active goals list
    const horizonKeys = {
      'daily': 'daily-outcomes',
      'weekly': `weekly-goals-${weekKey}`,
      'monthly': 'monthly-goals',
      'yearly': 'yearly-goals',
      'five-year': 'five-year-goals'
    };

    const key = horizonKeys[goal.horizon];
    const activeGoals = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Find next available slot
    const usedSlots = activeGoals.map((g: any) => g.slot).filter(Boolean);
    const nextSlot = usedSlots.length === 0 ? 1 : Math.max(...usedSlots) + 1;
    
    const reactivatedGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      slot: nextSlot,
      title: goal.title,
      done: false,
      area: goal.horizon === 'daily' ? null : 'work',
      linkedToParent: null,
      created_at: new Date().toISOString()
    };

    const updatedActiveGoals = [...activeGoals, reactivatedGoal];
    localStorage.setItem(key, JSON.stringify(updatedActiveGoals));

    // Remove from inactive goals
    const updatedInactiveGoals = inactiveGoals.filter(g => g.id !== goalId);
    saveInactiveGoals(updatedInactiveGoals);
  };

  const deleteInactiveGoal = (goalId: string) => {
    const updatedGoals = inactiveGoals.filter(g => g.id !== goalId);
    saveInactiveGoals(updatedGoals);
  };

  const getHorizonIcon = (horizon: string) => {
    switch (horizon) {
      case 'daily': return Calendar;
      case 'weekly': return Target;
      case 'monthly': return TrendingUp;
      case 'yearly': return Clock;
      case 'five-year': return Sparkles;
      default: return Target;
    }
  };

  const getHorizonColor = (horizon: string) => {
    switch (horizon) {
      case 'daily': return 'text-red-500 bg-red-50';
      case 'weekly': return 'text-orange-500 bg-orange-50';
      case 'monthly': return 'text-green-500 bg-green-50';
      case 'yearly': return 'text-blue-500 bg-blue-50';
      case 'five-year': return 'text-purple-500 bg-purple-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const groupedGoals = inactiveGoals.reduce((acc, goal) => {
    if (!acc[goal.horizon]) {
      acc[goal.horizon] = [];
    }
    acc[goal.horizon].push(goal);
    return acc;
  }, {} as Record<string, InactiveGoal[]>);

  const horizonLabels = {
    'daily': 'Daily',
    'weekly': 'Weekly', 
    'monthly': 'Monthly',
    'yearly': 'Yearly',
    'five-year': '5-Year'
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and ideas</p>
      </div>

      {/* Ideas & Backlog Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-xl">
              <Lightbulb size={20} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ideas & Backlog</h3>
              <p className="text-sm text-gray-600">Store goals for later when you have more capacity</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            <span>Add Idea</span>
          </button>
        </div>

        {/* Add New Goal Form */}
        {showAddGoal && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Add New Idea</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="What's your idea or future goal?"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                autoFocus
              />
              <select
                value={newGoalHorizon}
                onChange={(e) => setNewGoalHorizon(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="five-year">5-Year Vision</option>
              </select>
              <div className="flex space-x-3">
                <button
                  onClick={addInactiveGoal}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-xl hover:bg-green-600 transition-colors"
                >
                  Save Idea
                </button>
                <button
                  onClick={() => {
                    setShowAddGoal(false);
                    setNewGoalTitle('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inactive Goals by Horizon */}
        {Object.keys(groupedGoals).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedGoals).map(([horizon, goals]) => {
              const HorizonIcon = getHorizonIcon(horizon);
              const colorClass = getHorizonColor(horizon);
              
              return (
                <div key={horizon} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <HorizonIcon size={16} className={colorClass.replace('bg-', 'text-').replace('-50', '-500')} />
                    <span className="font-medium text-gray-900">{horizonLabels[horizon as keyof typeof horizonLabels]}</span>
                    <span className="text-sm text-gray-500">({goals.length})</span>
                  </div>
                  <div className="space-y-2">
                    {goals.map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{goal.title}</p>
                          <p className="text-xs text-gray-500">
                            Added {formatDate(new Date(goal.archivedAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => reactivateGoal(goal.id)}
                            className="text-blue-500 hover:text-blue-600 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Reactivate goal"
                          >
                            <Target size={16} />
                          </button>
                          <button
                            onClick={() => deleteInactiveGoal(goal.id)}
                            className="text-red-500 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete permanently"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Archive size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No ideas stored yet</p>
            <p className="text-sm">Add goals you want to work on later when you have more capacity</p>
          </div>
        )}
      </div>

      {/* Account Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gray-100 p-2 rounded-xl">
            <Archive size={20} className="text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Account</h3>
            <p className="text-sm text-gray-600">Manage your account settings</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-xl">
            <Lightbulb size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">About Focus Pyramid</h3>
            <p className="text-sm text-gray-600">Learn more about this app</p>
          </div>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Focus Pyramid helps you achieve your long-term vision by breaking it down into manageable daily actions. 
            The connected pyramid system ensures every daily task supports your bigger goals.
          </p>
          <p>
            <strong>Key Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Connected goal hierarchy (Daily → Weekly → Monthly → Yearly → 5-Year)</li>
            <li>Priority focus (top 3 goals) with optional extras</li>
            <li>Win tracking and streak building</li>
            <li>Ideas backlog for future goals</li>
            <li>Clean, Apple-inspired design</li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            Built with Next.js, TypeScript, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
}