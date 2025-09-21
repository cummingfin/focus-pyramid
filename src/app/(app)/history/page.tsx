'use client';

import { useState, useEffect } from 'react';
import { formatDate, todayUTC, getWeekStart } from '@/lib/dates';
import { Trophy, Target, Calendar, TrendingUp, Clock, Sparkles, Flame } from 'lucide-react';

interface DayHistory {
  date: string;
  dailyWins: number;
  dailyTotal: number;
  hasWin: boolean;
  completedGoals: string[];
}

interface WeekHistory {
  weekStart: string;
  weeklyWins: number;
  weeklyTotal: number;
  hasWin: boolean;
  days: DayHistory[];
}

export default function HistoryPage() {
  const [history, setHistory] = useState<WeekHistory[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const today = todayUTC();
    const weekStart = getWeekStart(today);
    const historyData: WeekHistory[] = [];
    
    // Generate last 4 weeks of data
    for (let weekOffset = 3; weekOffset >= 0; weekOffset--) {
      const weekDate = new Date(weekStart);
      weekDate.setDate(weekDate.getDate() - (weekOffset * 7));
      const weekKey = formatDate(weekDate, 'yyyy-MM-dd');
      
      const weekHistory: WeekHistory = {
        weekStart: formatDate(weekDate, 'MMM dd'),
        weeklyWins: 0,
        weeklyTotal: 0,
        hasWin: false,
        days: []
      };

      // Generate 7 days for this week
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const dayDate = new Date(weekDate);
        dayDate.setDate(dayDate.getDate() + dayOffset);
        const dayKey = formatDate(dayDate, 'yyyy-MM-dd');
        
        // Load goals for this day
        const dailyGoals = JSON.parse(localStorage.getItem('daily-outcomes') || '[]');
        const priorityGoals = dailyGoals.filter((g: any) => g.slot <= 3);
        const completedGoals = priorityGoals.filter((g: any) => g.done);
        const hasWin = completedGoals.length >= Math.ceil(priorityGoals.length * 0.67);
        
        weekHistory.days.push({
          date: formatDate(dayDate, 'MMM dd'),
          dailyWins: completedGoals.length,
          dailyTotal: priorityGoals.length,
          hasWin,
          completedGoals: completedGoals.map((g: any) => g.title)
        });

        if (hasWin) weekHistory.weeklyWins++;
        weekHistory.weeklyTotal++;
      }

      weekHistory.hasWin = weekHistory.weeklyWins >= Math.ceil(weekHistory.weeklyTotal * 0.67);
      historyData.push(weekHistory);
    }

    setHistory(historyData);
    
    // Calculate streaks
    let streak = 0;
    let bestStreakCount = 0;
    
    // Count current streak from today backwards
    for (let i = historyData.length - 1; i >= 0; i--) {
      const week = historyData[i];
      for (let j = week.days.length - 1; j >= 0; j--) {
        const day = week.days[j];
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() - (historyData.length - 1 - i) * 7 - (week.days.length - 1 - j));
        
        if (dayDate <= today) {
          if (day.hasWin) {
            streak++;
            bestStreakCount = Math.max(bestStreakCount, streak);
          } else {
            bestStreakCount = Math.max(bestStreakCount, streak);
            if (dayDate < today) streak = 0; // Only reset if it's not today
          }
        }
      }
    }
    
    setCurrentStreak(streak);
    setBestStreak(bestStreakCount);
  };

  const getWeekStats = () => {
    const thisWeek = history[history.length - 1];
    if (!thisWeek) return { wins: 0, total: 0, percentage: 0 };
    
    const wins = thisWeek.weeklyWins;
    const total = thisWeek.weeklyTotal;
    const percentage = total > 0 ? Math.round((wins / total) * 100) : 0;
    
    return { wins, total, percentage };
  };

  const weekStats = getWeekStats();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">History</h1>
        <p className="text-gray-600">Track your progress and build winning streaks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Current Streak */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Flame size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
              <p className="text-2xl font-bold text-gray-900">{currentStreak} days</p>
            </div>
          </div>
        </div>

        {/* Best Streak */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Trophy size={24} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Best Streak</h3>
              <p className="text-2xl font-bold text-gray-900">{bestStreak} days</p>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">This Week</h3>
              <p className="text-2xl font-bold text-gray-900">{weekStats.wins}/{weekStats.total}</p>
              <p className="text-sm text-gray-500">{weekStats.percentage}% win rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly History */}
      <div className="space-y-6">
        {history.map((week, weekIndex) => (
          <div key={weekIndex} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">Week of {week.weekStart}</h3>
                {week.hasWin && (
                  <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    <Trophy size={14} />
                    <span className="text-xs font-medium">WEEK WIN</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{week.weeklyWins}/{week.weeklyTotal} days</p>
                <p className="text-xs text-gray-500">
                  {week.weeklyTotal > 0 ? Math.round((week.weeklyWins / week.weeklyTotal) * 100) : 0}% win rate
                </p>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {week.days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`p-3 rounded-xl text-center transition-all duration-200 ${
                    day.hasWin
                      ? 'bg-green-50 border border-green-200'
                      : day.dailyTotal > 0
                      ? 'bg-gray-50 border border-gray-200'
                      : 'bg-gray-25 border border-gray-100'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-600 mb-1">{day.date}</div>
                  <div className="flex items-center justify-center mb-2">
                    {day.hasWin ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Trophy size={12} className="text-white" />
                      </div>
                    ) : day.dailyTotal > 0 ? (
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <Target size={12} className="text-gray-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.dailyTotal > 0 ? `${day.dailyWins}/${day.dailyTotal}` : '—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Completed Goals for the Week */}
            {week.days.some(day => day.completedGoals.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Completed Goals This Week</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(week.days.flatMap(day => day.completedGoals))
                  ).map((goal, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Motivation Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentStreak > 0 ? `Keep the momentum going!` : `Ready to start your streak?`}
          </h3>
          <p className="text-gray-600 mb-4">
            {currentStreak > 0 
              ? `You're on a ${currentStreak}-day winning streak. Consistency is the key to achieving your long-term goals.`
              : `Focus on completing 2 out of 3 priority goals each day to build your first winning streak.`
            }
          </p>
          {currentStreak >= 7 && (
            <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
              <Trophy size={16} />
              <span className="text-sm font-medium">Week Streak Master!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}