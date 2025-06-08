import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface Feedback {
  id: number;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: number;
}

type SortType = "date" | "popularity";

interface FeedbackContextType {
  feedbacks: Feedback[];
  addFeedback: (text: string) => void;
  deleteFeedback: (id: number) => void;
  likeFeedback: (id: number) => void;
  dislikeFeedback: (id: number) => void;
  sortType: SortType;
  setSortType: (type: SortType) => void;
  total: number;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

const FEEDBACKS_KEY = "feedbacks_v1";

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem(FEEDBACKS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [sortType, setSortType] = useState<SortType>("date");

  useEffect(() => {
    localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
  }, [feedbacks]);

  const addFeedback = (text: string) => {
    setFeedbacks([
      ...feedbacks,
      {
        id: Date.now(),
        text,
        likes: 0,
        dislikes: 0,
        createdAt: Date.now(),
      },
    ]);
  };

  const deleteFeedback = (id: number) => {
    setFeedbacks(feedbacks.filter(fb => fb.id !== id));
  };

  const likeFeedback = (id: number) => {
    setFeedbacks(feedbacks.map(fb => fb.id === id ? { ...fb, likes: fb.likes + 1 } : fb));
  };

  const dislikeFeedback = (id: number) => {
    setFeedbacks(feedbacks.map(fb => fb.id === id ? { ...fb, dislikes: fb.dislikes + 1 } : fb));
  };

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (sortType === "date") {
      return b.createdAt - a.createdAt;
    } else {
      return b.likes - a.likes;
    }
  });

  return (
    <FeedbackContext.Provider value={{
      feedbacks: sortedFeedbacks,
      addFeedback,
      deleteFeedback,
      likeFeedback,
      dislikeFeedback,
      sortType,
      setSortType,
      total: feedbacks.length,
    }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedbacks = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedbacks must be used within FeedbackProvider");
  return ctx;
}; 