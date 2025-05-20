// src/services/apiService.ts
// src/services/apiService.ts
import axios from 'axios'; // Импортируем axios как экспорт по умолчанию
import type { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'; // Импортируем типы отдельно с ключевым словом 'type'
// ... остальной ваш код apiService.ts ...
// ... другие импорты (AuthToken, Room и т.д.)

// Получаем базовый URL API из переменных окружения .env
const API_DOMAIN = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'; // Значение по умолчанию на случай, если VITE_API_BASE_URL не определена

// Клиент для эндпоинтов, которые находятся под /api/v1/
const apiClientV1: AxiosInstance = axios.create({
  baseURL: `${API_DOMAIN}/api/v1`, // Например, http://127.0.0.1:8000/api/v1
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена (если нужно)
apiClientV1.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Функция для логина (использует API_DOMAIN напрямую)
export const loginUser = async (username_param: string, password_param: string) => {
  try {
    const formData = new FormData();
    formData.append('username', username_param);
    formData.append('password', password_param);
    const response = await axios.post<AuthToken>(`${API_DOMAIN}/api/get-token/`, formData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  } catch (error: any) {
    // ... обработка ошибок ...
    return { error: error.response?.data || 'Login failed' };
  }
};

// Функции для работы с комнатами (используют apiClientV1)
export const fetchRooms = async () => {
  try {
    const response = await apiClientV1.get<Room[]>('/rooms/'); // Путь относительно baseURL apiClientV1
    return response.data;
  } catch (error: any) {
    // ... обработка ошибок ...
    return { error: error.response?.data || 'Failed to fetch rooms' };
  }
};
// ... остальные функции API ...