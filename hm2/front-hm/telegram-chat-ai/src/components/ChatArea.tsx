import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export default function ChatArea() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chats, activeChat, addMessage, userProfile } = useStore();

  const activeMessages = chats.find((chat) => chat.id === activeChat)?.messages || [];
  const activeChatName = chats.find((chat) => chat.id === activeChat)?.name;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat || isLoading) return;

    // Add user message
    addMessage(activeChat, { role: 'user', content: message });
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: userProfile.model,
          messages: [
            ...activeMessages,
            { role: 'user', content: message }
          ],
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        addMessage(activeChat, {
          role: 'assistant',
          content: data.choices[0].message.content,
        });
      } else {
        throw new Error('Invalid response from OpenAI');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage(activeChat, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeChat) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="p-8 text-center max-w-lg mx-auto">
          <div className="flex justify-center mb-6">
            <ChatBubbleLeftEllipsisIcon className="h-16 w-16 text-telegram-button animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Welcome to AI Chat
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select an existing chat or create a new one to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="py-4 px-20 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <ChatBubbleLeftIcon className="h-5 w-5 text-telegram-button" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeChatName}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fade-in`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-telegram-button text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
              }`}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </p>
              <div className={`text-xs mt-1 text-right ${
                msg.role === 'user' 
                  ? 'text-white/80' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[70%] rounded-2xl p-4 bg-gray-100 dark:bg-gray-800 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-telegram-button rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-telegram-button rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-telegram-button rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-telegram-button focus:border-transparent text-gray-900 dark:text-white transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="p-4 bg-telegram-button text-white rounded-xl hover:bg-telegram-button/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}