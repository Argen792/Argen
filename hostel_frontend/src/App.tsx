import { useState, useEffect } from 'react'; // Добавили useEffect
import './App.css'; // Твои стили App.css

// Определим интерфейс для объекта комнаты, чтобы TypeScript знал его структуру
// Основываясь на твоем RoomSerializer
interface Room {
  id: number;
  number: string;
  room_type_display: string;
  beds_total: number;
  beds_taken: number;
  is_paid: boolean;
  check_in_date: string | null; // Может быть null
  check_in_time: string | null; // Может быть null
  days_booked: number;
  is_occupied: boolean;
  check_out_date_display: string | null; // Может быть null
}

function App() {
  const [rooms, setRooms] = useState<Room[]>([]); // Состояние для хранения списка комнат
  const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
  const [error, setError] = useState<string | null>(null); // Состояние для ошибок

  useEffect(() => {
    // Функция для загрузки данных
    const fetchRooms = async () => {
      try {
        // Адрес твоего API. Убедись, что Django сервер запущен на 8000 порту.
        const response = await fetch('http://127.0.0.1:8000/api/v1/rooms/');
        if (!response.ok) {
          // Если ответ не успешный (например, 404 или 500)
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Room[] = await response.json();
        setRooms(data); // Сохраняем полученные данные в состояние
      } catch (e: any) {
        setError(e.message); // Сохраняем ошибку
        console.error("Ошибка при загрузке комнат:", e);
      } finally {
        setLoading(false); // Устанавливаем загрузку в false в любом случае
      }
    };

    fetchRooms(); // Вызываем функцию загрузки при монтировании компонента
  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз при монтировании

  if (loading) {
    return <p>Загрузка комнат...</p>;
  }

  if (error) {
    return <p>Ошибка при загрузке данных: {error}</p>;
  }

  return (
    <>
      {/* Твой существующий JSX с логотипами Vite и React можно оставить или убрать */}
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src="./assets/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Администратор Хостела (React Frontend)</h1>
      <div className="card">
        {/* Здесь будем отображать список комнат */}
        <h2>Список Комнат</h2>
        {rooms.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {rooms.map((room) => (
              <div key={room.id} className={`room-card ${room.is_occupied ? (room.is_paid ? 'status-paid' : 'status-unpaid') : ''}`} style={{ border: '1px solid #ccc', padding: '15px', width: '300px', backgroundColor: room.is_occupied ? (room.is_paid ? '#cfe2ff' : '#f8d7da') : '#fff' }}>
                <h5>{room.number} ({room.room_type_display})</h5>
                <p>Всего кроватей: {room.beds_total}</p>
                {room.is_occupied ? (
                  <>
                    <p>Занято кроватей: {room.beds_taken}</p>
                    <p>Дата заезда: {room.check_in_date ? new Date(room.check_in_date).toLocaleDateString() : 'N/A'} {room.check_in_time || ''}</p>
                    <p>Дней проживания: {room.days_booked}</p>
                    <p>Дата выезда: {room.check_out_date_display || 'N/A'}</p>
                    <p>Оплачено: {room.is_paid ? 'Да' : 'Нет'}</p>
                  </>
                ) : (
                  <p>Комната свободна</p>
                )}
                {/* Сюда можно добавить кнопки для действий, как в твоих Django шаблонах */}
              </div>
            ))}
          </div>
        ) : (
          <p>Комнат пока нет.</p>
        )}
      </div>
      <p className="read-the-docs">
        Кликни на логотипы Vite и React, чтобы узнать больше.
      </p>
    </>
  );
}

export default App;