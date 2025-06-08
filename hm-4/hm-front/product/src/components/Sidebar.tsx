import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { useFeedbackStore } from '../store/feedbackStore';
import { motion } from 'framer-motion';
import {
  SunIcon,
  MoonIcon,
  ChartBarIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

type Category = 'all' | 'UI' | 'Performance' | 'Feature';

interface SidebarProps {
  onClose?: () => void;
}

const categories: { id: Category; icon: React.ReactNode; label: string }[] = [
  { id: 'all', icon: <ChartBarIcon className="w-5 h-5" />, label: 'Все идеи' },
  { id: 'UI', icon: <ComputerDesktopIcon className="w-5 h-5" />, label: 'Интерфейс' },
  { id: 'Performance', icon: <RocketLaunchIcon className="w-5 h-5" />, label: 'Производительность' },
  { id: 'Feature', icon: <SparklesIcon className="w-5 h-5" />, label: 'Новые функции' },
];

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const filterCategory = useFeedbackStore((s) => s.filterCategory);
  const setFilterCategory = useFeedbackStore((s) => s.setFilterCategory);

  const handleCategoryClick = (id: Category | 'all') => {
    setFilterCategory(id);
    onClose?.();
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`
        fixed md:sticky top-0 left-0 z-30 
        h-full w-64 shrink-0
        ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} 
        border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} 
        p-5 shadow-lg
      `}
    >
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Категории</h2>
          <nav className="space-y-2">
            {categories.map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => handleCategoryClick(id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                  ${filterCategory === id 
                    ? (isDark ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700')
                    : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
              ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {isDark ? (
              <>
                <SunIcon className="w-5 h-5" />
                <span>Светлая тема</span>
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5" />
                <span>Тёмная тема</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar; 