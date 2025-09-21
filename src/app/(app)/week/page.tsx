'use client';

import { formatDate, getWeekStart, getWeekDays, isCurrentWeek } from '@/lib/dates';
import { Target, Plus } from 'lucide-react';
import { useState } from 'react';

export default function WeekPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekDays = getWeekDays(getWeekStart(selectedDate));

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

      <div className="text-center py-8">
        <Target size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No weekly goals yet</h3>
        <p className="text-gray-600 mb-4">Set your first weekly goal to get started</p>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mx-auto">
          <Plus size={16} />
          <span>Add Weekly Goal</span>
        </button>
      </div>
    </div>
  );
}
