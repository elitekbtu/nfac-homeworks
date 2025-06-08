import React from "react";
import { useFeedbackStore } from "../store/feedbackStore";
import { useThemeStore } from "../store/themeStore";
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  TrashIcon,
  TagIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { Feedback } from "../store/feedbackStore";
import { motion } from "framer-motion";

interface FeedbackItemProps {
  feedback: Feedback;
}

const FeedbackItem: React.FC<FeedbackItemProps> = ({ feedback }) => {
  const likeFeedback = useFeedbackStore((s) => s.likeFeedback);
  const dislikeFeedback = useFeedbackStore((s) => s.dislikeFeedback);
  const deleteFeedback = useFeedbackStore((s) => s.deleteFeedback);
  const isDark = useThemeStore((s) => s.isDark);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        p-6 rounded-xl transition-all
        ${isDark ? 'bg-gray-700/50' : 'bg-white'}
        hover:shadow-lg hover:scale-[1.01]
      `}
    >
      <div className="flex flex-col gap-4">
        {/* Main content */}
        <div className="flex items-start justify-between gap-4">
          <p className={`flex-grow text-lg ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            {feedback.text}
          </p>
          <button
            onClick={() => deleteFeedback(feedback.id)}
            className={`
              shrink-0 p-2 rounded-lg transition-all
              hover:scale-110 active:scale-95
              ${isDark 
                ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300' 
                : 'hover:bg-red-100 text-red-500 hover:text-red-600'}
            `}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Category */}
          <div className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            ${isDark ? 'bg-gray-600 text-purple-300' : 'bg-purple-100 text-purple-700'}
          `}>
            <TagIcon className="w-4 h-4" />
            <span className="font-medium">{feedback.category}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Like/Dislike buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => likeFeedback(feedback.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
                  hover:scale-105 active:scale-95
                  ${isDark 
                    ? 'hover:bg-green-900/50 text-green-400 hover:text-green-300' 
                    : 'hover:bg-green-100 text-green-600 hover:text-green-700'}
                `}
              >
                <HandThumbUpIcon className="w-4 h-4" />
                <span className="font-medium">{feedback.likes}</span>
              </button>

              <button
                onClick={() => dislikeFeedback(feedback.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
                  hover:scale-105 active:scale-95
                  ${isDark 
                    ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300' 
                    : 'hover:bg-red-100 text-red-600 hover:text-red-700'}
                `}
              >
                <HandThumbDownIcon className="w-4 h-4" />
                <span className="font-medium">{feedback.dislikes}</span>
              </button>
            </div>

            {/* Timestamp */}
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              ${isDark ? 'text-gray-400 bg-gray-600' : 'text-gray-500 bg-gray-100'}
            `}>
              <ClockIcon className="w-4 h-4" />
              <span>{formatDate(feedback.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackItem; 