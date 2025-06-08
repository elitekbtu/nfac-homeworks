import React from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '../store/themeStore';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ isOpen, onClick }) => {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <button
      onClick={onClick}
      className={`fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg shadow-lg transition-colors
        ${isDark 
          ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
          : 'bg-white text-gray-800 hover:bg-gray-100'}`}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? (
        <XMarkIcon className="w-6 h-6" />
      ) : (
        <Bars3Icon className="w-6 h-6" />
      )}
    </button>
  );
};

export default MobileMenuButton; 