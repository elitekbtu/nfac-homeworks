import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import type { Chat, Folder } from '../store/store';
import {
  Cog6ToothIcon,
  UserCircleIcon,
  PlusIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { FolderIcon as FolderIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFolderFilter, setShowFolderFilter] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const categoryModalRef = useRef<HTMLDivElement>(null);
  const folderFilterRef = useRef<HTMLDivElement>(null);

  const {
    darkMode,
    toggleDarkMode,
    chats,
    folders,
    createChat,
    createFolder,
    deleteFolder,
    moveChatsToFolder,
    deleteChat,
    deleteAllChats,
    userProfile,
    updateUsername,
    updateModel,
    activeChat,
    setActiveChat,
    searchTerm,
    setSearchTerm,
    sortOption,
    togglePinChat,
    updateChatCategory,
    updatePreferences,
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
      if (folderFilterRef.current && !folderFilterRef.current.contains(event.target as Node)) {
        setShowFolderFilter(false);
      }
      if (categoryModalRef.current && !categoryModalRef.current.contains(event.target as Node)) {
        setShowCategoryModal(false);
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

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name) {
      createFolder(name);
    }
  };

  const handleUpdateCategory = (category: string) => {
    if (selectedChatId) {
      updateChatCategory(selectedChatId, category);
      setShowCategoryModal(false);
      setSelectedChatId(null);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? Chats will be moved to root.')) {
      deleteFolder(folderId);
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleMoveToFolder = (chatId: string, folderId: string | null) => {
    moveChatsToFolder([chatId], folderId);
  };

  // Sort and filter chats
  const sortedAndFilteredChats = [...chats]
    .filter(chat => {
      const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFolder = selectedFolderFilter === null || 
        (selectedFolderFilter === 'root' ? !chat.folderId : chat.folderId === selectedFolderFilter);
      
      return matchesSearch && matchesFolder;
    })
    .sort((a, b) => {
      // Pinned chats always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortOption) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'lastUpdated':
        default:
          return b.updatedAt - a.updatedAt;
      }
    });

  // Group chats by folders
  const chatsByFolder = sortedAndFilteredChats.reduce((acc, chat) => {
    const folderId = chat.folderId || 'root';
    if (!acc[folderId]) {
      acc[folderId] = [];
    }
    acc[folderId].push(chat);
    return acc;
  }, {} as Record<string, typeof chats>);

  return (
    <div className={`${
      isOpen ? 'w-96' : 'w-0'
    } transition-all duration-300 h-screen bg-white dark:bg-gray-800 flex flex-col shadow-2xl overflow-hidden border-r border-gray-200 dark:border-gray-700`}>
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

          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-telegram-button focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <button
                onClick={() => setShowFolderFilter(!showFolderFilter)}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 ${
                  selectedFolderFilter !== null 
                    ? 'text-telegram-button' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateChat}
                className="flex-1 flex items-center justify-center gap-2 p-4 bg-telegram-button text-white rounded-xl hover:bg-telegram-button/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <PlusIcon className="h-5 w-5" />
                New Chat
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
              >
                <FolderIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Folder Filter Dropdown */}
            {showFolderFilter && (
              <div
                ref={folderFilterRef}
                className="absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
              >
                <button
                  onClick={() => {
                    setSelectedFolderFilter(null);
                    setShowFolderFilter(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedFolderFilter === null 
                      ? 'text-telegram-button' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All Folders
                </button>
                <button
                  onClick={() => {
                    setSelectedFolderFilter('root');
                    setShowFolderFilter(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedFolderFilter === 'root' 
                      ? 'text-telegram-button' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Root
                </button>
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setSelectedFolderFilter(folder.id);
                      setShowFolderFilter(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                      selectedFolderFilter === folder.id 
                        ? 'text-telegram-button' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FolderIcon className="h-4 w-4" />
                    {folder.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              {/* Root level chats */}
              {(!selectedFolderFilter || selectedFolderFilter === 'root') && chatsByFolder.root?.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat === chat.id}
                  onSelect={() => setActiveChat(chat.id)}
                  onPin={() => togglePinChat(chat.id)}
                  onDelete={() => deleteChat(chat.id)}
                  onMoveToFolder={(folderId) => handleMoveToFolder(chat.id, folderId)}
                  folders={folders}
                />
              ))}

              {/* Folders and their chats */}
              {folders.map((folder) => (
                <div key={folder.id} className="mb-2">
                  <div
                    className={`flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer group ${
                      selectedFolderFilter === folder.id ? 'bg-telegram-button/10' : ''
                    }`}
                    onClick={() => toggleFolderExpansion(folder.id)}
                  >
                    {expandedFolders.has(folder.id) ? (
                      <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                    )}
                    <FolderIconSolid className={`h-5 w-5 ${
                      selectedFolderFilter === folder.id 
                        ? 'text-telegram-button' 
                        : 'text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`} />
                    <span className={`flex-1 text-sm font-medium ${
                      selectedFolderFilter === folder.id 
                        ? 'text-telegram-button' 
                        : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-300'
                    }`}>
                      {folder.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300"
                    >
                      <TrashIcon className="h-4 w-4 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400" />
                    </button>
                  </div>
                  {expandedFolders.has(folder.id) && chatsByFolder[folder.id]?.map((chat) => (
                    <div key={chat.id} className="ml-6">
                      <ChatItem
                        chat={chat}
                        isActive={activeChat === chat.id}
                        onSelect={() => setActiveChat(chat.id)}
                        onPin={() => togglePinChat(chat.id)}
                        onDelete={() => deleteChat(chat.id)}
                        onMoveToFolder={(folderId) => handleMoveToFolder(chat.id, folderId)}
                        folders={folders}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom buttons */}
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

          {/* Category Modal */}
          {showCategoryModal && (
            <div 
              ref={categoryModalRef}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-700 animate-fade-in"
            >
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Set Category</h3>
              <div className="space-y-2">
                {['Work', 'Personal', 'Study', 'Other'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleUpdateCategory(category)}
                    className="w-full text-left px-4 py-2 rounded-xl transition-all duration-300 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings Modal */}
          {showSettings && (
            <div 
              ref={settingsRef}
              className="absolute bottom-28 left-4 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-4 border border-gray-200 dark:border-gray-700 animate-fade-in"
            >
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Settings</h3>
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message Size</label>
                  <select
                    value={userProfile.preferences.messageSize}
                    onChange={(e) => updatePreferences({ messageSize: e.target.value as any })}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-telegram-button focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Timestamps</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      updatePreferences({ showTimestamps: !userProfile?.preferences?.showTimestamps });
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userProfile?.preferences?.showTimestamps ? 'bg-telegram-button' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userProfile?.preferences?.showTimestamps ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

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

          {/* Profile Modal */}
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
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-telegram-button focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400"
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
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
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

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onPin: () => void;
  onDelete: () => void;
  onMoveToFolder: (folderId: string | null) => void;
  folders: Folder[];
}

function ChatItem({ chat, isActive, onSelect, onPin, onDelete, onMoveToFolder, folders }: ChatItemProps) {
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowFolderMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 ${
      isActive
        ? 'bg-telegram-button/10 text-telegram-button'
        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0" onClick={onSelect}>
        <div className="flex-shrink-0">
          {chat.isPinned ? (
            <BookmarkIconSolid className="h-5 w-5 text-telegram-button" />
          ) : (
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{chat.name}</div>
          {chat.category && (
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {chat.category}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onPin}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300"
        >
          {chat.isPinned ? (
            <BookmarkIconSolid className="h-4 w-4" />
          ) : (
            <BookmarkIcon className="h-4 w-4" />
          )}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowFolderMenu(!showFolderMenu)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300"
          >
            <FolderIcon className="h-4 w-4" />
          </button>
          {showFolderMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <button
                onClick={() => {
                  onMoveToFolder(null);
                  setShowFolderMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Move to root
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onMoveToFolder(folder.id);
                    setShowFolderMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Move to {folder.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all duration-300"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}