import React from "react";
import FeedbackItem from "./FeedbackItem";
import type { Feedback } from "../store/feedbackStore";
import { useFeedbackStore } from "../store/feedbackStore";
import { useThemeStore } from "../store/themeStore";
import { InboxIcon } from "@heroicons/react/24/outline";

const FeedbackList: React.FC = () => {
  const feedbacks = useFeedbackStore(s => s.feedbacks);
  const sort = useFeedbackStore(s => s.sort);
  const filterCategory = useFeedbackStore(s => s.filterCategory);
  const isDark = useThemeStore(s => s.isDark);

  const filtered = feedbacks
    .filter((fb: Feedback) => filterCategory === 'all' || fb.category === filterCategory)
    .sort((a: Feedback, b: Feedback) => {
      if (sort === 'date') return b.createdAt - a.createdAt;
      return b.likes - a.likes;
    });

  if (feedbacks.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <InboxIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Нет идей — добавьте первую!</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <InboxIcon className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-base font-medium">Нет идей в категории "{filterCategory}"</p>
        <p className="text-sm mt-1">Попробуйте другую категорию или добавьте новую идею</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((fb: Feedback) => (
        <FeedbackItem key={fb.id} feedback={fb} />
      ))}
    </div>
  );
};

export default FeedbackList; 