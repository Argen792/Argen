// src/services/apiService.ts
import { AuthToken, Room, ApiError as CustomApiErrorType } from '../types'; // Убедитесь, что ApiError импортирован из ваших типов

const API_BASE_URL = 'http://127.0.0.1:8000'; // Или import.meta.env.VITE_API_BASE_URL

// Вспомогательная функция для выполнения запросов с токеном
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('authToken');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.append('Authorization', `Token ${token}`);
  }
  headers.append('Content-Type', 'application/json'); // Обычно нужен для POST/PUT

  return fetch(url, {
    ...options,
    headers,
  });
}

// Функция для входа пользователя
export async function loginUser(username_param: string, password_param: string): Promise<AuthToken | CustomApiErrorType> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/get-token/`, { // URL для получения токена
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username_param, password: password_param }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Django REST framework's authtoken.views.obtain_auth_token возвращает non_field_errors
      // или detail при ошибках.
      const errorDetail = data.non_field_errors ? { non_field_errors: data.non_field_errors } : (data.detail ? { detail: data.detail } : data);
      return { error: errorDetail, status: response.status };
    }
    return data as AuthToken; // Ожидаем { token: "your_token_string" }
  } catch (error: any) {
    console.error('Login API error:', error);
    return { error: error.message || 'Network error during login', status: null };
  }
}

// Функция для выхода (в основном, это очистка токена на клиенте)
export function logoutUser(): void {
  localStorage.removeItem('authToken');
  // Дополнительно: можно было бы сделать запрос к API для инвалидации токена на сервере,
  // но стандартный djangorestframework.authtoken этого не предоставляет "из коробки".
}

// Функция для получения списка комнат
export async function fetchRooms(): Promise<Room[] | CustomApiErrorType> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/v1/rooms/`); // Защищенный эндпоинт

    const data = await response.json();

    if (!response.ok) {
      // Django REST framework часто возвращает 'detail' для ошибок авторизации/доступа
      const errorDetail = data.detail ? { detail: data.detail } : data;
      return { error: errorDetail, status: response.status };
    }
    return data as Room[];
  } catch (error: any) {
    console.error('Fetch rooms API error:', error);
    return { error: error.message || 'Network error while fetching rooms', status: null };
  }
}

// Можно добавить и другие функции API здесь, например:
// export async function fetchRoomById(id: number): Promise<Room | CustomApiErrorType> { ... }
// export async function createRoom(data: NewRoomData): Promise<Room | CustomApiErrorType> { ... }
// export async function updateRoomOccupancy(id: number, data: OccupancyData): Promise<Room | CustomApiErrorType> { ... }