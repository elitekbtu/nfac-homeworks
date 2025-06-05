import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import {
  Cog6ToothIcon,
  UserCircleIcon,
  PlusIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    darkMode,
    toggleDarkMode,
    chats,
    createChat,
    deleteChat,
    deleteAllChats,
    userProfile,
    updateUsername,
    updateModel,
    activeChat,
    setActiveChat,
  } = useStore();

  // Handle clicks outside of modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateChat = () => {
    const name = prompt('Enter chat name:');
    if (name) {
      createChat(name);
      setIsOpen(true);
    }
  };

  return (
    <div
      className={`${
        isOpen ? 'w-80' : 'w-0'
      } transition-all duration-300 h-screen bg-white dark:bg-gray-800 flex flex-col shadow-2xl overflow-hidden border-r border-gray-200 dark:border-gray-700`}
    >
      {isOpen && (
        <>
          <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-telegram-button" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Chat
              </h1>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-300 hover:rotate-90"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={handleCreateChat}
                className="w-full flex items-center justify-center gap-2 p-4 bg-telegram-button text-white rounded-xl hover:bg-telegram-button/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                New Chat
              </button>
            </div>

            <div className="px-4 space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeChat === chat.id
                      ? 'bg-telegram-button/10 text-telegram-button'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <span className="truncate font-medium">
                    {chat.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-all duration-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowSettings(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
            >
              <UserCircleIcon className="h-6 w-6 text-telegram-button" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Profile</span>
            </button>

            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowProfile(false);
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
            >
              <Cog6ToothIcon className="h-6 w-6 text-telegram-button" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Settings</span>
            </button>
          </div>

          {showSettings && (
            <div 
              ref={settingsRef}
              className="absolute bottom-28 left-4 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-700 animate-fade-in"
            >
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Settings</h3>
              <div className="space-y-3">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300"
                >
                  {darkMode ? (
                    <SunIcon className="h-6 w-6 text-amber-500" />
                  ) : (
                    <MoonIcon className="h-6 w-6 text-telegram-button" />
                  )}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all chats?')) {
                      deleteAllChats();
                      setShowSettings(false);
                    }
                  }}
                  className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300"
                >
                  <TrashIcon className="h-6 w-6" />
                  <span className="font-medium">Delete All Chats</span>
                </button>
              </div>
            </div>
          )}

          {showProfile && (
            <div 
              ref={profileRef}
              className="absolute bottom-28 left-4 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-700 animate-fade-in"
            >
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={userProfile.username}
                    onChange={(e) => updateUsername(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-telegram-button focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                    placeholder="Enter your username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
                  <select
                    value={userProfile.model}
                    onChange={(e) => updateModel(e.target.value as any)}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-telegram-button focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                  >
                    <option value="gpt-3.5-turbo" className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">GPT-3.5 Turbo</option>
                    <option value="gpt-4" className="text-gray-900 dark:text-white bg-white dark:bg-gray-700">GPT-4</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}