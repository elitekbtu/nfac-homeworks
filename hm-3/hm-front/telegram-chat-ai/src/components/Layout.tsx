import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { useStore } from '../store/store';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const darkMode = useStore((state) => state.darkMode);
  const mainRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mainRef.current && 
          mainRef.current.contains(event.target as Node) && 
          window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Simple TanStack Query example: fetch a random dog image
  const { data, isLoading, error } = useQuery({
    queryKey: ['randomDog'],
    queryFn: async () => {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
  });

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main ref={mainRef} className="flex-1 flex flex-col relative">
        {/* Simple TanStack Query Example */}
        <div className="absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 p-2 rounded shadow-md flex items-center gap-2">
          {isLoading && <span>Loading dog...</span>}
          {error && <span className="text-red-500">Error loading dog</span>}
          {data && data.message && (
            <img src={data.message} alt="Random Dog" className="h-12 w-12 rounded object-cover" />
          )}
        </div>
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 p-2 rounded-full bg-telegram-button text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group z-10"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
        <div className="flex-1">
          <ChatArea />
        </div>
      </main>
    </div>
  );
}