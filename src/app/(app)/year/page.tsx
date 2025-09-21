'use client';

import { formatDate, getYearStart, getYear } from '@/lib/dates';

export default function YearPage() {
  const yearStart = getYearStart();
  const currentYear = getYear();

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Yearly Goals
        </h1>
        <p className="text-gray-600">
          {currentYear}
        </p>
      </div>

      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Yearly Goals Coming Soon</h3>
        <p className="text-gray-600">
          This page will show your yearly goals and long-term planning.
        </p>
      </div>
    </div>
  );
}
