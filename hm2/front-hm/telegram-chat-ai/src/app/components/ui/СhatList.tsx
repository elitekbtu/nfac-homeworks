function ChatList() {
  // Можно добавить состояние для хранения списка чатов
  // const [chats, setChats] = useState([]);
  
  return (
    <div className="chat-list">
      <h2>Список чатов</h2>
      <ul>
        {/* Пример статичного списка - в реальном приложении данные будут из состояния */}
        <li>Чат 1</li>
        <li>Чат 2</li>
        <li>Чат 3</li>
      </ul>
    </div>
  );
}

export default ChatList;