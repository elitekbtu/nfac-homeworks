import './App.css'
import { Routes, Route } from 'react-router-dom';
import TimerMotivator from './components/TimerMotivator';

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<TimerMotivator />} />
        </Routes>
    </>
  )
}

export default App
