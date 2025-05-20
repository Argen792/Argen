// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom'; // <--- РАСКОММЕНТИРОВАНО
// import { AuthProvider } from './context/AuthContext.tsx'; // ПОКА ОСТАВИТЬ ЗАКОММЕНТИРОВАННЫМ

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter> {/* <--- РАСКОММЕНТИРОВАНО, ОТКРЫВАЮЩИЙ ТЕГ */}
        {/* <AuthProvider> */}
          <App />
        {/* </AuthProvider> */}
      </BrowserRouter> {/* <--- РАСКОММЕНТИРОВАНО, ЗАКРЫВАЮЩИЙ ТЕГ БЕЗ ЛИШНИХ СИМВОЛОВ */}
    </React.StrictMode>,
  );
} else {
  console.error("ОШИБКА: Корневой элемент 'root' не найден в index.html!");
}