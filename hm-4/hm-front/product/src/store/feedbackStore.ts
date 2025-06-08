import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Category = 'UI' | 'Performance' | 'Feature';
export type SortType = 'date' | 'popularity';

export interface Feedback {
  id: number;
  text: string;
  category: Category;
  likes: number;
  dislikes: number;
  createdAt: number;
}

interface FeedbackState {
  feedbacks: Feedback[];
  sort: SortType;
  filterCategory: Category | 'all';
  addFeedback: (feedback: Omit<Feedback, 'id' | 'likes' | 'dislikes' | 'createdAt'>) => void;
  deleteFeedback: (id: number) => void;
  likeFeedback: (id: number) => void;
  dislikeFeedback: (id: number) => void;
  setSort: (sort: SortType) => void;
  setFilterCategory: (category: Category | 'all') => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set) => ({
      feedbacks: [],
      sort: 'date',
      filterCategory: 'all',

      addFeedback: (newFeedback) =>
        set((state) => ({
          feedbacks: [
            {
              ...newFeedback,
              id: Date.now(),
              likes: 0,
              dislikes: 0,
              createdAt: Date.now(),
            },
            ...state.feedbacks,
          ],
        })),

      deleteFeedback: (id) =>
        set((state) => ({
          feedbacks: state.feedbacks.filter((f) => f.id !== id),
        })),

      likeFeedback: (id) =>
        set((state) => ({
          feedbacks: state.feedbacks.map((f) =>
            f.id === id ? { ...f, likes: f.likes + 1 } : f
          ),
        })),

      dislikeFeedback: (id) =>
        set((state) => ({
          feedbacks: state.feedbacks.map((f) =>
            f.id === id ? { ...f, dislikes: f.dislikes + 1 } : f
          ),
        })),

      setSort: (sort) => set({ sort }),
      setFilterCategory: (category) => set({ filterCategory: category }),
    }),
    {
      name: 'feedback-store',
    }
  )
); 