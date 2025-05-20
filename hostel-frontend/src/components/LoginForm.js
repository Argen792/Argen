import React, { useState } from 'react';
import axios from 'axios';

// Предполагаем, что API_BASE_URL уже определен где-то глобально
// или вы можете определить его здесь снова.
const API_BASE_URL = 'http://127.0.0.1:8000'; // Убедитесь, что порт совпадает с вашим Django-сервером

function LoginForm({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/get-token/`, {
                username: username,
                password: password,
            });

            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                // Устанавливаем токен по умолчанию для всех последующих запросов axios
                axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
                console.log('Login successful, token stored!');
                if (onLoginSuccess) {
                    onLoginSuccess(); // Вызываем колбэк при успешном входе
                }
            } else {
                setError('Failed to get token. Please try again.');
            }
        } catch (err) {
            if (err.response) {
                // Ошибка от сервера (например, неверные учетные данные)
                setError(err.response.data.non_field_errors || 'Login failed. Check credentials.');
                console.error('Login error data:', err.response.data);
            } else if (err.request) {
                // Запрос был сделан, но ответ не получен
                setError('No response from server. Please check your network.');
                console.error('No response received:', err.request);
            } else {
                // Что-то пошло не так при настройке запроса
                setError('An error occurred. Please try again.');
                console.error('Error message:', err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <div>
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}

export default LoginForm;