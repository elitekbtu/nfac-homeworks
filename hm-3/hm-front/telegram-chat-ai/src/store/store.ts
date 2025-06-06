import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isFavorite?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  color?: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  category?: string;
  folderId?: string;
}

interface UserProfile {
  username: string;
  model: 'gpt-3.5-turbo' | 'gpt-4';
  createdAt: number;
  lastUpdated: number;
  preferences: {
    messageSize: 'small' | 'medium' | 'large';
    showTimestamps: boolean;
    language: string;
  };
}

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'lastUpdated';

interface Store {
  darkMode: boolean;
  toggleDarkMode: () => void;
  chats: Chat[];
  folders: Folder[];
  activeChat: string | null;
  userProfile: UserProfile;
  searchTerm: string;
  sortOption: SortOption;
  createChat: (name: string, category?: string, folderId?: string) => void;
  deleteChat: (id: string) => void;
  deleteAllChats: () => void;
  setActiveChat: (id: string | null) => void;
  addMessage: (chatId: string, message: Omit<Message, 'timestamp'>) => void;
  updateUsername: (username: string) => void;
  updateModel: (model: 'gpt-3.5-turbo' | 'gpt-4') => void;
  togglePinChat: (chatId: string) => void;
  toggleFavoriteMessage: (chatId: string, messageIndex: number) => void;
  updateChatCategory: (chatId: string, category: string) => void;
  setSearchTerm: (term: string) => void;
  setSortOption: (option: SortOption) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  createFolder: (name: string, color?: string) => void;
  deleteFolder: (id: string) => void;
  updateFolder: (id: string, updates: Partial<Omit<Folder, 'id'>>) => void;
  moveChatsToFolder: (chatIds: string[], folderId: string | null) => void;
}

const defaultPreferences = {
  messageSize: 'medium' as const,
  showTimestamps: true,
  language: 'en',
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      chats: [],
      folders: [],
      activeChat: null,
      searchTerm: '',
      sortOption: 'lastUpdated',
      userProfile: {
        username: 'User',
        model: 'gpt-3.5-turbo',
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        preferences: defaultPreferences,
      },
      createChat: (name, category, folderId) => {
        const now = Date.now();
        set((state) => ({
          chats: [
            ...state.chats,
            {
              id: now.toString(),
              name: name.trim(),
              messages: [],
              createdAt: now,
              updatedAt: now,
              category,
              folderId,
            },
          ],
          activeChat: now.toString(),
        }));
      },
      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
          activeChat: state.activeChat === id ? null : state.activeChat,
        })),
      deleteAllChats: () =>
        set({
          chats: [],
          activeChat: null,
        }),
      setActiveChat: (id) =>
        set({
          activeChat: id,
        }),
      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, { ...message, timestamp: Date.now(), isFavorite: false }],
                  updatedAt: Date.now(),
                }
              : chat
          ),
        })),
      updateUsername: (username) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            username: username.trim(),
            lastUpdated: Date.now(),
          },
        })),
      updateModel: (model) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            model,
            lastUpdated: Date.now(),
          },
        })),
      togglePinChat: (chatId) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, isPinned: !chat.isPinned }
              : chat
          ),
        })),
      toggleFavoriteMessage: (chatId, messageIndex) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg, idx) =>
                    idx === messageIndex
                      ? { ...msg, isFavorite: !msg.isFavorite }
                      : msg
                  ),
                }
              : chat
          ),
        })),
      updateChatCategory: (chatId, category) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? { ...chat, category }
              : chat
          ),
        })),
      setSearchTerm: (term) =>
        set({ searchTerm: term }),
      setSortOption: (option) =>
        set({ sortOption: option }),
      updatePreferences: (preferences) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            preferences: {
              ...defaultPreferences,
              ...state.userProfile.preferences,
              ...preferences,
            },
            lastUpdated: Date.now(),
          },
        })),
      createFolder: (name, color) => {
        const now = Date.now();
        set((state) => ({
          folders: [
            ...state.folders,
            {
              id: now.toString(),
              name: name.trim(),
              createdAt: now,
              color,
            },
          ],
        }));
      },
      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
          chats: state.chats.map((chat) =>
            chat.folderId === id ? { ...chat, folderId: undefined } : chat
          ),
        })),
      updateFolder: (id, updates) =>
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder
          ),
        })),
      moveChatsToFolder: (chatIds, folderId) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chatIds.includes(chat.id)
              ? { ...chat, folderId: folderId || undefined }
              : chat
          ),
        })),
    }),
    {
      name: 'telegram-ai-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        darkMode: state.darkMode,
        chats: state.chats,
        folders: state.folders,
        userProfile: {
          ...state.userProfile,
          preferences: {
            ...defaultPreferences,
            ...state.userProfile.preferences,
          },
        },
      }),
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure preferences are properly initialized after rehydration
          state.userProfile.preferences = {
            ...defaultPreferences,
            ...state.userProfile.preferences,
          };
        }
      },
    }
  )
); 