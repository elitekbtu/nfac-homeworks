import React from "react";
import FeedbackForm from "./components/FeedbackForm";
import FeedbackList from "./components/FeedbackList";
import Layout from "./components/Layout";
import Header from "./components/Header";
import { useThemeStore } from "./store/themeStore";
import './App.css';

const AppContent: React.FC = () => {
  const isDark = useThemeStore(s => s.isDark);

  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className={`w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-6`}>
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold mb-8 text-center
          ${isDark 
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400'
            : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500'
          }`}>
          Product Feedback Board
        </h1>
        <FeedbackForm />
        <FeedbackList />
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <Layout>
    <AppContent />
  </Layout>
);

export default App;
