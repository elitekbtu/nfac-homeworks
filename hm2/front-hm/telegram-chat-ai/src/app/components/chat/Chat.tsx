import { useEffect, useState, type FormEvent } from "react";

interface ChatProps {
  chat_id: number;
  chat_messages: string[];
  chat_type: "User" | "Ai";
}

const Chat = ({ chat_id, chat_messages, chat_type }: ChatProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatProps>({
    chat_id,
    chat_messages,
    chat_type,
  });

  // Синхронизируем chatHistory с пропсами, если они вдруг поменяются
  useEffect(() => {
    setChatHistory({ chat_id, chat_messages, chat_type });
  }, [chat_id, chat_messages, chat_type]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setChatHistory((prev) => ({
      ...prev,
      chat_messages: [...prev.chat_messages, inputMessage],
    }));
    setInputMessage("");
  };

  const handleClearHistory = () => {
    setChatHistory((prev) => ({ ...prev, chat_messages: [] }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="text"
            placeholder="please write some message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
        </label>
        <label>
          <input type="submit" value="Send message" />
        </label>
        <label>
          <input
            type="button"
            value="Clear chat history"
            onClick={handleClearHistory}
          />
        </label>
      </form>

      <ul>
        {chatHistory.chat_messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{chat_type}:</strong> {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
