import React from 'react';
import { useFeedbackStore } from '../store/feedbackStore';
import { useThemeStore } from '../store/themeStore';
import {
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import type { Category, SortType } from '../store/feedbackStore';

const categories: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'UI', label: 'UI' },
  { id: 'Performance', label: 'Performance' },
  { id: 'Feature', label: 'Feature' },
];

const sortOptions: { id: SortType; label: string }[] = [
  { id: 'date', label: 'По дате' },
  { id: 'popularity', label: 'По популярности' },
];

const Header: React.FC = () => {
  const isDark = useThemeStore((s) => s.isDark);
  const sort = useFeedbackStore((s) => s.sort);
  const setSort = useFeedbackStore((s) => s.setSort);
  const filterCategory = useFeedbackStore((s) => s.filterCategory);
  const setFilterCategory = useFeedbackStore((s) => s.setFilterCategory);
  const feedbacks = useFeedbackStore((s) => s.feedbacks);

  return (
    <div 
      className={`
        sticky top-0 z-20 
        ${isDark ? 'bg-gray-800/95' : 'bg-white/95'} 
        shadow-md mb-6 py-4 backdrop-blur-sm
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Stats Section */}
          <div className="flex items-center gap-3">
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Всего идей: {feedbacks.length}
              </span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Control */}
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              <ArrowsUpDownIcon className="w-5 h-5 shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className={`
                  min-w-[140px] py-0.5 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500
                  ${isDark 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-100 text-gray-900'}
                  border-none transition-colors
                `}
              >
                {sortOptions.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            {/* Category Filters */}
            <div className={`
              flex items-center gap-2 px-4 py-2 rounded-lg
              ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
            `}>
              <FunnelIcon className="w-5 h-5 shrink-0" />
              <div className="flex flex-wrap gap-2">
                {categories.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setFilterCategory(id)}
                    className={`
                      px-3 py-1.5 rounded-md transition-all text-sm font-medium
                      hover:scale-105 active:scale-95
                      ${filterCategory === id
                        ? (isDark 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                            : 'bg-purple-100 text-purple-700 shadow-lg shadow-purple-200/50')
                        : (isDark 
                            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm')
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 