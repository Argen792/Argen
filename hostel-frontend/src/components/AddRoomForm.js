import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Типы комнат, как в вашей модели Room
const ROOM_TYPES = [
    { value: 'simple', label: 'Простая' },
    { value: 'lux', label: 'Люкс' },
];

function AddRoomForm({ onRoomAdded }) {
    const [number, setNumber] = useState('');
    const [roomType, setRoomType] = useState(ROOM_TYPES[0].value); // По умолчанию 'simple'
    const [bedsTotal, setBedsTotal] = useState(1);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        if (parseInt(bedsTotal) <= 0) {
            setError("Количество кроватей должно быть больше нуля.");
            setLoading(false);
            return;
        }

        const roomData = {
            number: number,
            room_type: roomType,
            beds_total: parseInt(bedsTotal),
            // Поля занятости по умолчанию будут установлены на сервере или останутся дефолтными
        };

        try {
            // Токен уже должен быть установлен глобально в axios.defaults.headers.common['Authorization']
            // из App.js после логина
            const response = await axios.post(`${API_BASE_URL}/api/v1/rooms/`, roomData);
            console.log('Room added successfully:', response.data);
            if (onRoomAdded) {
                onRoomAdded(); // Вызываем колбэк для обновления списка и скрытия формы
            }
            // Очистка формы
            setNumber('');
            setRoomType(ROOM_TYPES[0].value);
            setBedsTotal(1);

        } catch (err) {
            if (err.response && err.response.data) {
                // Пытаемся отобразить ошибки валидации от DRF
                let errorMessages = [];
                for (const key in err.response.data) {
                    errorMessages.push(`${key}: ${err.response.data[key].join ? err.response.data[key].join(', ') : err.response.data[key]}`);
                }
                setError(errorMessages.join('; ') || 'Failed to add room. Please check the data.');
                console.error('Add room error data:', err.response.data);
            } else if (err.request) {
                setError('No response from server.');
                console.error('No response received:', err.request);
            } else {
                setError('An error occurred.');
                console.error('Error message:', err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{
            marginBottom: '20px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3>Добавить новую комнату</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="roomNumber" style={{ marginRight: '10px', display: 'block' }}>Номер комнаты:</label>
                <input
                    type="text"
                    id="roomNumber"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                    disabled={loading}
                    style={{ padding: '8px', width: 'calc(100% - 18px)' }}
                />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="roomType" style={{ marginRight: '10px', display: 'block' }}>Тип комнаты:</label>
                <select
                    id="roomType"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    disabled={loading}
                    style={{ padding: '8px', width: '100%' }}
                >
                    {ROOM_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="bedsTotal" style={{ marginRight: '10px', display: 'block' }}>Всего кроватей:</label>
                <input
                    type="number"
                    id="bedsTotal"
                    value={bedsTotal}
                    onChange={(e) => setBedsTotal(e.target.value)}
                    min="1"
                    required
                    disabled={loading}
                    style={{ padding: '8px', width: 'calc(100% - 18px)' }}
                />
            </div>
            <button type="submit" disabled={loading} style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 15px',
                border: 'none',
                borderRadius: '5px'
            }}>
                {loading ? 'Добавление...' : 'Добавить комнату'}
            </button>
        </form>
    );
}

export default AddRoomForm;