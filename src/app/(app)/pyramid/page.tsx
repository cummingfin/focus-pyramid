'use client';

import { useState, useEffect } from 'react';
import { formatDate, todayUTC, getWeekStart, getMonthName, getYear } from '@/lib/dates';
import { Check, Plus, X, Target, Calendar, TrendingUp, Clock, Star } from 'lucide-react';
import Link from 'next/link';

export default function PyramidPage() {
  const [allGoals, setAllGoals] = useState({
    daily: [] as any[],
    weekly: [] as any[],
    monthly: [] as any[],
    yearly: [] as any[],
    fiveYear: [] as any[]
  });

  // Load all goals from localStorage
  useEffect(() => {
    const dailyGoals = JSON.parse(localStorage.getItem('daily-outcomes') || '[]');
    const weekKey = formatDate(getWeekStart(), 'yyyy-MM-dd');
    const weeklyGoals = JSON.parse(localStorage.getItem(`weekly-goals-${weekKey}`) || '[]');
    const monthlyGoals = JSON.parse(localStorage.getItem('monthly-goals') || '[]');
    const yearlyGoals = JSON.parse(localStorage.getItem('yearly-goals') || '[]');
    const fiveYearGoals = JSON.parse(localStorage.getItem('five-year-goals') || '[]');

    setAllGoals({
      daily: dailyGoals,
      weekly: weeklyGoals,
      monthly: monthlyGoals,
      yearly: yearlyGoals,
      fiveYear: fiveYearGoals
    });
  }, []);

  const getProgressForHorizon = (goals: any[]) => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.done).length;
    return Math.round((completed / goals.length) * 100);
  };

  const PyramidLevel = ({ 
    title, 
    icon: Icon, 
    goals, 
    color, 
    link, 
    subtitle,
    progress 
  }: {
    title: string;
    icon: any;
    goals: any[];
    color: string;
    link: string;
    subtitle: string;
    progress: number;
  }) => {
    return (
      <Link href={link} className="block group">
        <div className={`${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Icon size={24} className="text-white" />
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-white/80 text-sm">{subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white text-2xl font-bold">{progress}%</div>
              <div className="text-white/60 text-xs">Complete</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {goals.slice(0, 3).map((goal, index) => (
              <div key={goal.id || index} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  goal.done ? 'bg-white border-white' : 'border-white/60'
                } flex items-center justify-center`}>
                  {goal.done && <Check size={10} className="text-blue-600" />}
                </div>
                <span className={`text-white text-sm truncate ${
                  goal.done ? 'line-through opacity-70' : ''
                }`}>
                  {goal.title}
                </span>
              </div>
            ))}
            {goals.length > 3 && (
              <div className="text-white/60 text-xs">
                +{goals.length - 3} more goals
              </div>
            )}
            {goals.length === 0 && (
              <div className="text-white/60 text-sm italic">
                No goals set yet
              </div>
            )}
          </div>

          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Focus Pyramid
        </h1>
        <p className="text-gray-600">
          Your connected goals across all time horizons
        </p>
      </div>

      <div className="space-y-6">
        {/* 5-Year Vision */}
        <PyramidLevel
          title="5-Year Vision"
          icon={Star}
          goals={allGoals.fiveYear}
          color="bg-gradient-to-r from-purple-600 to-purple-800"
          link="/five-year"
          subtitle={`${new Date().getFullYear()}-${new Date().getFullYear() + 4}`}
          progress={getProgressForHorizon(allGoals.fiveYear)}
        />

        {/* Yearly Goals */}
        <div className="flex justify-center">
          <div className="w-8 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        <PyramidLevel
          title="Yearly Goals"
          icon={Clock}
          goals={allGoals.yearly}
          color="bg-gradient-to-r from-blue-600 to-blue-800"
          link="/year"
          subtitle={getYear().toString()}
          progress={getProgressForHorizon(allGoals.yearly)}
        />

        {/* Monthly Goals */}
        <div className="flex justify-center">
          <div className="w-6 h-6 bg-gradient-to-b from-blue-400 to-green-400 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>

        <PyramidLevel
          title="Monthly Goals"
          icon={TrendingUp}
          goals={allGoals.monthly}
          color="bg-gradient-to-r from-green-600 to-green-800"
          link="/month"
          subtitle={`${getMonthName()} ${getYear()}`}
          progress={getProgressForHorizon(allGoals.monthly)}
        />

        {/* Weekly Goals */}
        <div className="flex justify-center">
          <div className="w-5 h-5 bg-gradient-to-b from-green-400 to-orange-400 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>

        <PyramidLevel
          title="Weekly Goals"
          icon={Target}
          goals={allGoals.weekly}
          color="bg-gradient-to-r from-orange-600 to-orange-800"
          link="/week"
          subtitle={`Week of ${formatDate(getWeekStart(), 'MMM dd')}`}
          progress={getProgressForHorizon(allGoals.weekly)}
        />

        {/* Daily Outcomes */}
        <div className="flex justify-center">
          <div className="w-4 h-4 bg-gradient-to-b from-orange-400 to-red-400 rounded-full flex items-center justify-center">
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
        </div>

        <PyramidLevel
          title="Today's Focus"
          icon={Calendar}
          goals={allGoals.daily}
          color="bg-gradient-to-r from-red-600 to-red-800"
          link="/today"
          subtitle={formatDate(todayUTC(), 'EEEE, MMMM do')}
          progress={getProgressForHorizon(allGoals.daily)}
        />
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How it works</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>5-Year Vision</strong> → Break down into yearly goals</p>
          <p>• <strong>Yearly Goals</strong> → Break down into monthly milestones</p>
          <p>• <strong>Monthly Goals</strong> → Break down into weekly targets</p>
          <p>• <strong>Weekly Goals</strong> → Break down into daily outcomes</p>
          <p>• <strong>Daily Outcomes</strong> → Your immediate actions</p>
        </div>
      </div>
    </div>
  );
}
