// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthToken } from '../types'; // Убедитесь, что путь и имя импорта AuthToken верны
import { loginUser as apiLogin, logoutUser as apiLogout } from '../services/apiService'; // Убедитесь, что путь к apiService верный

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Для индикации процесса логина
  authIsLoading: boolean; // Для индикации начальной проверки токена
  error: string | null;
  login: (username_param: string, password_param: string) => Promise<void>;
  logout: () => void;
  setError: (message: string | null) => void; // Для возможности сброса ошибки извне, если нужно
}

// Создаем контекст с undefined начальным значением, хук useAuth будет это проверять
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Для процесса логина
  const [authIsLoading, setAuthIsLoading] = useState<boolean>(true); // Для начальной проверки токена
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем токен при первой загрузке приложения
    console.log("AuthContext: useEffect - Checking for stored token");
    try {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        console.log("AuthContext: useEffect - Found stored token:", storedToken);
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        console.log("AuthContext: useEffect - No stored token found");
      }
    } catch (e) {
        console.error("AuthContext: useEffect - Error reading from localStorage", e);
    }
    setAuthIsLoading(false); // Завершили начальную проверку, независимо от результата
    console.log("AuthContext: useEffect - authIsLoading set to false");
  }, []); // Пустой массив зависимостей - выполнится один раз при монтировании

  const login = async (username_param: string, password_param: string) => {
    setIsLoading(true);
    setError(null); // Сбрасываем предыдущую ошибку
    console.log("AuthContext: login - Attempting login for user:", username_param);
    const response = await apiLogin(username_param, password_param);

    // Проверяем, что response не undefined и является объектом, перед тем как проверять 'token' in response
    if (response && typeof response === 'object' && 'token' in response && response.token) {
      console.log("AuthContext: login - Success, token received:", response.token);
      setToken(response.token);
      localStorage.setItem('authToken', response.token);
      setIsAuthenticated(true);
      // setError(null); // Уже было сброшено
    } else {
      // @ts-ignore // Временно для обхода ошибки типа, если response.error не всегда объект
      const errorMessage = response?.error?.detail || response?.error?.non_field_errors?.[0] || 'Неверные учетные данные или ошибка сервера.';
      console.error("AuthContext: login - Failed. Error:", errorMessage, "Full response:", response);
      setError(errorMessage);
      setToken(null);
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const logout = () => {
    console.log("AuthContext: logout - Logging out");
    apiLogout(); // Удаляет токен из localStorage
    setToken(null);
    setIsAuthenticated(false);
    // Перенаправление на /login будет обработано в App.tsx из-за изменения isAuthenticated
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, isLoading, authIsLoading, error, login, logout, setError }}>
      {/* Показываем заглушку, пока идет начальная проверка токена, только если контент еще не был показан */}
      {authIsLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            Проверка аутентификации... {/* Или ваш Spinner компонент */}
        </div>
      ) : children }
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider. Make sure your component is wrapped in AuthProvider.');
  }
  return context;
};