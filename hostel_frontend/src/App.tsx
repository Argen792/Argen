// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom'; // Добавим Link для теста

// Временно создадим заглушки прямо здесь для теста роутинга
const SimpleLoginPage = () => <h2>Страница Логина (Тест Роутинга)</h2>;
const SimpleRoomListPage = () => <h2>Список Комнат (Тест Роутинга)</h2>;

function App() {
  return (
    <div>
      <nav>
        <Link to="/login" style={{ marginRight: '10px' }}>Тест Логин</Link>
        <Link to="/">Тест Комнаты</Link>
      </nav>
      <hr />
      <h1>Привет, React с Роутингом!</h1>
      <Routes>
        <Route path="/login" element={<SimpleLoginPage />} />
        <Route path="/" element={<SimpleRoomListPage />} />
        <Route path="*" element={<h2>Страница не найдена (Тест Роутинга)</h2>} />
      </Routes>
    </div>
  );
}

export default App;