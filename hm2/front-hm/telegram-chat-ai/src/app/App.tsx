import '../app/App.css';
import { Routes, Route } from "react-router-dom";
import Chat from './components/chat/Chat';
function App() {

  return (
    <Routes>
        <Route path="/chat" element={<Chat chat_id={1} chat_messages={["Hello", "How are you?"]} chat_type="User" />} />
    </Routes>
  )
}

export default App
