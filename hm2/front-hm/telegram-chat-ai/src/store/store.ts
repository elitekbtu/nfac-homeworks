import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface UserProfile {
  username: string;
  model: 'gpt-3.5-turbo' | 'gpt-4';
  createdAt: number;
  lastUpdated: number;
}

interface Store {
  darkMode: boolean;
  toggleDarkMode: () => void;
  chats: Chat[];
  activeChat: string | null;
  userProfile: UserProfile;
  createChat: (name: string) => void;
  deleteChat: (id: string) => void;
  deleteAllChats: () => void;
  setActiveChat: (id: string | null) => void;
  addMessage: (chatId: string, message: Omit<Message, 'timestamp'>) => void;
  updateUsername: (username: string) => void;
  updateModel: (model: 'gpt-3.5-turbo' | 'gpt-4') => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      chats: [],
      activeChat: null,
      userProfile: {
        username: 'User',
        model: 'gpt-3.5-turbo',
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      },
      createChat: (name) => {
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
                  messages: [...chat.messages, { ...message, timestamp: Date.now() }],
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
    }),
    {
      name: 'telegram-ai-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        darkMode: state.darkMode,
        chats: state.chats,
        userProfile: state.userProfile,
      }),
      version: 1,
    }
  )
); 