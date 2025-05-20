// src/components/RoomList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RoomCard from './RoomCard'; // Предполагаем, что создадим этот компонент

const API_BASE_URL = 'http://127.0.0.1:8000';

function RoomList() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true);
            setError(null);
            try {
                // Заголовки авторизации теперь устанавливаются глобально в App.js
                const response = await axios.get(`${API_BASE_URL}/api/v1/rooms/`);
                setRooms(response.data);
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch rooms:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    if (loading) return <p>Loading rooms...</p>;
    if (error) return <p>Error fetching rooms: {error}</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Список Комнат</h1>
                <button style={{
                    backgroundColor: '#28a745', // зеленый
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}>
                    <i className="fas fa-plus" style={{ marginRight: '5px' }}></i> {/* Если используете FontAwesome */}
                    Добавить комнату
                </button>
            </div>

            {/* Стили для сетки карточек */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {rooms.length > 0 ? (
                    rooms.map(room => (
                        <RoomCard key={room.id} room={room} />
                    ))
                ) : (
                    <p>Комнат пока нет. <a href="/add-room">Добавьте первую комнату</a>.</p>
                )}
            </div>
        </div>
    );
}

export default RoomList;