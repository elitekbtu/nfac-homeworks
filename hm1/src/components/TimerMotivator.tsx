import React, { useState, useEffect, useMemo } from 'react';
import '../fonts.css';

type ThemeMode = 'light' | 'dark';
type DurationOptionValue = number | 'custom';
type DurationOption = { value: DurationOptionValue; label: string };

interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { value: 10, label: '10 секунд' },
  { value: 20, label: '20 секунд' },
  { value: 30, label: '30 секунд' },
  { value: 60, label: '1 минута' },
  { value: 120, label: '2 минуты' },
  { value: 300, label: '5 минут' },
];

const BASE_PHRASES = [
  'Ты молодец! Продолжай в том же духе! 🌟',
  'Отличная работа! Так держать! 💪',
  'Превосходно! Ты справился! 🎯',
  'Это было впечатляюще! 🚀',
  'Фантастический результат! ✨',
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-timer',
    name: 'Первый раз',
    description: 'Завершите таймер впервые',
    unlocked: false,
    icon: '🆕',
  },
  {
    id: 'marathoner',
    name: 'Марафонец',
    description: 'Завершите 5-минутный таймер',
    unlocked: false,
    icon: '🏃',
  },
  {
    id: 'motivator',
    name: 'Мотиватор',
    description: 'Добавьте свою фразу',
    unlocked: false,
    icon: '💬',
  },
  {
    id: 'veteran',
    name: 'Ветеран',
    description: 'Завершите таймер 10 раз',
    unlocked: false,
    icon: '🎖️',
  },
  {
    id: 'speedster',
    name: 'Скоростник',
    description: 'Завершите 10-секундный таймер',
    unlocked: false,
    icon: '⚡',
  },
];

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

const ThemeToggle = ({
  theme,
  toggleTheme,
}: {
  theme: ThemeMode;
  toggleTheme: () => void;
}) => (
  <button
    onClick={toggleTheme}
    className={`theme-toggle ${theme}`}
    aria-label={`Переключить на ${theme === 'light' ? 'тёмную' : 'светлую'} тему`}
  >
    {theme === 'light' ? '🌙' : '☀️'}
  </button>
);

const AchievementBadge = ({ achievement }: { achievement: Achievement }) => (
  <div className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
    <span className="achievement-icon">{achievement.icon}</span>
    <div className="achievement-info">
      <h4>{achievement.name}</h4>
      <p>{achievement.description}</p>
      <span className="achievement-status">
        {achievement.unlocked ? '✅ Открыто' : '🔒 Заблокировано'}
      </span>
    </div>
  </div>
);

const TimerMotivator = () => {
  const [name, setName] = useLocalStorage('timerMotivator-name', '');
  const [customPhrases, setCustomPhrases] = useLocalStorage<string[]>('timerMotivator-customPhrases', []);
  const [theme, setTheme] = useLocalStorage<ThemeMode>('timerMotivator-theme', 'light');
  const [completionCount, setCompletionCount] = useLocalStorage('timerMotivator-completionCount', 0);
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>('timerMotivator-achievements', INITIAL_ACHIEVEMENTS);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const [selectedPresetDuration, setSelectedPresetDuration] = useState<number>(
    DURATION_OPTIONS[0].value as number
  );
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState<string>("60");

  const [currentPhrase, setCurrentPhrase] = useState('');
  const [newPhrase, setNewPhrase] = useState('');
  const [showPhraseForm, setShowPhraseForm] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const allPhrases = useMemo(() => [...BASE_PHRASES, ...customPhrases], [customPhrases]);
  
  const actualTimerDuration = useMemo(() => {
    if (isCustomMode) {
      const customSeconds = parseInt(customDurationInput, 10);
      return isNaN(customSeconds) || customSeconds <= 0 ? 0 : customSeconds;
    }
    return selectedPresetDuration;
  }, [isCustomMode, customDurationInput, selectedPresetDuration]);

  const progress = useMemo(() => {
    if (actualTimerDuration === 0) return 0;
    return (timeLeft / actualTimerDuration) * 100;
  }, [timeLeft, actualTimerDuration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isRunning) {
      completeTimer();
    }
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if(isComplete){
      checkAchievements();
    }
  }, [completionCount, actualTimerDuration, customPhrases, isComplete]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleDurationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (value === 'custom') {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
      setSelectedPresetDuration(Number(value));
    }
  };

  const handleCustomDurationInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDurationInput(event.target.value);
  };
  
  const startTimer = () => {
    if (!name.trim()) {
        alert("Пожалуйста, введите ваше имя.");
        return;
    }
    
    const durationToUse = actualTimerDuration;

    if (durationToUse <= 0) {
        alert("Пожалуйста, выберите или введите корректную длительность таймера (больше 0 секунд).");
        return;
    }

    setTimeLeft(durationToUse);
    setIsRunning(true);
    setIsComplete(false);
    setCurrentPhrase('');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft(0);
  };

  const completeTimer = () => {
    setIsRunning(false);
    setIsComplete(true);
    setCompletionCount(completionCount + 1);
    setCurrentPhrase(allPhrases[Math.floor(Math.random() * allPhrases.length)]);
    new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3').play()
      .catch(e => console.error('Audio error:', e));
  };

  const addCustomPhrase = () => {
    if (newPhrase.trim()) {
      setCustomPhrases([...customPhrases, newPhrase.trim()]);
      setNewPhrase('');
      setShowPhraseForm(false);
    }
  };

  const removeCustomPhrase = (index: number) => {
    setCustomPhrases(customPhrases.filter((_, i) => i !== index));
  };

  const checkAchievements = () => {
    const currentDuration = actualTimerDuration;
    const updatedAchievementsList = achievements.map(ach => {
      if (ach.unlocked) return ach; 

      let newUnlockState = false;
      switch (ach.id) {
        case 'first-timer':
          newUnlockState = completionCount >= 1;
          break;
        case 'marathoner':
          newUnlockState = currentDuration >= 300 && isComplete;
          break;
        case 'motivator':
          newUnlockState = customPhrases.length > 0;
          break;
        case 'veteran':
          newUnlockState = completionCount >= 10;
          break;
        case 'speedster':
          newUnlockState = currentDuration === 10 && isComplete;
          break;
      }
      
      if (newUnlockState && !ach.unlocked) {
        setNewAchievement({ ...ach, unlocked: true });
        setTimeout(() => setNewAchievement(null), 3000);
      }
      return { ...ach, unlocked: newUnlockState };
    });
    setAchievements(updatedAchievementsList);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins}м ` : ''}${secs}с`;
  };
  
  const getSelectedDropdownValue = (): DurationOptionValue => {
    return isCustomMode ? 'custom' : selectedPresetDuration;
  };

  return (
    <div className={`app-container ${theme}`}>
      <header className="app-header">
        <h1 className="app-title">Таймер-Мотиватор</h1>
        <div className="header-controls">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button 
            className="achievements-button"
            onClick={() => setShowAchievements(!showAchievements)}
            aria-label="Показать достижения"
          >
            🏆 {completionCount}
          </button>
        </div>
      </header>

      <main className="app-main">
        {!isRunning && !isComplete ? (
          <div className="setup-panel">
            <div className="input-group">
              <label htmlFor="name-input">Ваше имя:</label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                className="text-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="duration-select">Длительность:</label>
              <select
                id="duration-select"
                value={getSelectedDropdownValue()}
                onChange={handleDurationChange}
                className="select-input"
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="custom">Свое время (секунды)</option>
              </select>
              {isCustomMode && (
                <input
                  id="custom-duration-input"
                  type="number"
                  value={customDurationInput}
                  onChange={handleCustomDurationInputChange}
                  placeholder="Время в секундах"
                  className="text-input custom-duration-input"
                  min="1"
                />
              )}
            </div>

            <div className="phrase-management">
              <button
                className="phrase-toggle-button"
                onClick={() => setShowPhraseForm(!showPhraseForm)}
              >
                {showPhraseForm ? 'Скрыть форму' : 'Добавить фразу'}
              </button>

              {showPhraseForm && (
                <div className="phrase-form">
                  <input
                    type="text"
                    value={newPhrase}
                    onChange={(e) => setNewPhrase(e.target.value)}
                    placeholder="Введите мотивационную фразу"
                    className="text-input"
                  />
                  <button
                    className="add-phrase-button"
                    onClick={addCustomPhrase}
                    disabled={!newPhrase.trim()}
                  >
                    Добавить
                  </button>
                </div>
              )}

              {customPhrases.length > 0 && (
                <div className="custom-phrases">
                  <h3>Ваши фразы:</h3>
                  <ul>
                    {customPhrases.map((phrase, index) => (
                      <li key={index}>
                        <span>{phrase}</span>
                        <button
                          className="remove-phrase-button"
                          onClick={() => removeCustomPhrase(index)}
                          aria-label={`Удалить фразу: ${phrase}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              className="start-button"
              onClick={startTimer}
              disabled={!name.trim() || actualTimerDuration <= 0}
            >
              Старт
            </button>
          </div>
        ) : isRunning ? (
          <div className="timer-panel">
            <h2 className="timer-title">
              {name}, осталось: <span className="time-left">{formatTime(timeLeft)}</span>
            </h2>
            
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              ></div>
            </div>

            <button className="reset-button" onClick={resetTimer}>
              Сбросить
            </button>
          </div>
        ) : (
          <div className="completion-panel">
            <h2 className="congratulations">
              Ты справился, {name}! 🎉
            </h2>
            <p className="motivational-phrase">{currentPhrase}</p>
            
            <div className="completion-buttons">
              <button className="try-again-button" onClick={startTimer}>
                Попробовать снова
              </button>
              <button className="reset-button" onClick={resetTimer}>
                Сбросить
              </button>
            </div>
          </div>
        )}
      </main>
      
      {newAchievement && (
        <div className="achievement-notification">
          <div className="achievement-badge unlocked">
            <span className="achievement-icon">{newAchievement.icon}</span>
            <div className="achievement-info">
              <h4>Новое достижение!</h4>
              <p>{newAchievement.name}</p>
            </div>
          </div>
        </div>
      )}

      {showAchievements && (
        <div className="achievements-panel" role="dialog" aria-modal="true" aria-labelledby="achievements-title">
          <div className="achievements-header">
            <h3 id="achievements-title">Ваши достижения</h3>
            <button 
              className="close-button"
              onClick={() => setShowAchievements(false)}
              aria-label="Закрыть панель достижений"
            >
              ×
            </button>
          </div>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerMotivator;