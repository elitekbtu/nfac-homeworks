import React, { useState, useEffect, useCallback } from 'react';
import { useThemeStore } from '../store/themeStore';
import Sidebar from './Sidebar';
import MobileMenuButton from './MobileMenuButton';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const isDark = useThemeStore((s) => s.isDark);

  const checkIsDesktop = useCallback(() => {
    setIsDesktop(window.innerWidth >= 768);
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    checkIsDesktop();
    
    const handleResize = () => {
      let timeoutId: number;
      timeoutId = window.setTimeout(checkIsDesktop, 100);
      clearTimeout(timeoutId);
      
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkIsDesktop]);

  return (
    <div className={`fixed inset-0 flex ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Menu Button */}
      {!isDesktop && (
        <div className="absolute top-4 left-4 z-30">
          <MobileMenuButton
            isOpen={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || isDesktop) && (
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isSidebarOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-20"
          />
        )}
      </AnimatePresence>

      {/* Main Content - full screen */}
      <main 
        className={`
          flex-1 overflow-auto
          transition-all duration-300
          ${isDesktop ? 'ml-64' : ''}
          ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}
        `}
      >
        <div className="h-full w-full p-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default React.memo(Layout);