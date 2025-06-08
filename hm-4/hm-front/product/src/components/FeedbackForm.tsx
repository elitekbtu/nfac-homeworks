import React, { useState } from "react";
import { useFeedbackStore } from "../store/feedbackStore";
import { useThemeStore } from "../store/themeStore";
import { 
  PaperAirplaneIcon,
  TagIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";
import type { Category } from "../store/feedbackStore";

const categories: { id: Category; icon: React.ReactNode; label: string }[] = [
  { id: 'UI', icon: <TagIcon className="w-4 h-4" />, label: 'UI' },
  { id: 'Performance', icon: <TagIcon className="w-4 h-4" />, label: 'Performance' },
  { id: 'Feature', icon: <TagIcon className="w-4 h-4" />, label: 'Feature' },
];

const FeedbackForm: React.FC = () => {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Category>("UI");
  const addFeedback = useFeedbackStore((s) => s.addFeedback);
  const isDark = useThemeStore((s) => s.isDark);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    addFeedback({
      text: text.trim(),
      category,
    });
    
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className={`
        p-6 rounded-xl transition-all
        ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}
        hover:shadow-lg hover:scale-[1.01]
      `}>
        <div className="space-y-4">
          {/* Textarea with icon */}
          <div className="relative">
            <div className="absolute top-3 left-4">
              <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Поделитесь своей идеей..."
              className={`
                w-full pl-12 pr-4 py-3 rounded-lg resize-none
                focus:outline-none focus:ring-2 focus:ring-purple-500
                ${isDark 
                  ? 'bg-gray-800 text-white border-gray-600' 
                  : 'bg-white text-gray-900 border-gray-200'} 
                border-2 transition-all
              `}
              rows={3}
            />
          </div>
          
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Category select with icon */}
            <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[200px]">
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                <TagIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={`
                  w-full pl-12 pr-4 py-2.5 rounded-lg appearance-none
                  focus:outline-none focus:ring-2 focus:ring-purple-500
                  ${isDark 
                    ? 'bg-gray-800 text-white border-gray-600' 
                    : 'bg-white text-gray-900 border-gray-200'}
                  border-2 transition-all
                `}
              >
                {categories.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
                <svg className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!text.trim()}
              className={`
                flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-medium
                transition-all duration-200
                ${text.trim() 
                  ? 'bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'}
                ${isDark && !text.trim() ? 'bg-gray-700' : ''}
              `}
            >
              <span>Отправить</span>
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default FeedbackForm; 