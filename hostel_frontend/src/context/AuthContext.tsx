// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthToken, ApiError } from '../types';
import { loginUser as apiLogin, logoutUser as apiLogout } from '../services/apiService';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authIsLoading: boolean;
  error: string | null;
  login: (username_param: string, password_param: string) => Promise<boolean>; // Returns true on success
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authIsLoading, setAuthIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setAuthIsLoading(false);
  }, []);

  const login = async (username_param: string, password_param: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    const response = await apiLogin(username_param, password_param);
    if ('token' in response && response.token) {
      setToken(response.token);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } else {
      const apiError = response as ApiError;
      let errorMessage = 'Login failed. Please check your credentials.';
      if (apiError.error && typeof apiError.error === 'object' && apiError.error.non_field_errors) {
        errorMessage = apiError.error.non_field_errors[0];
      } else if (typeof apiError.error === 'string') {
        errorMessage = apiError.error;
      }
      setError(errorMessage);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    apiLogout();
    setToken(null);
    setIsAuthenticated(false);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, isLoading, authIsLoading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};