// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Путь к вашему AuthContext
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Card, Alert } from 'react-bootstrap'; // Используем React Bootstrap

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login(username, password);
    // AuthContext сам обработает сохранение токена и обновление isAuthenticated.
    // Если в App.tsx настроен редирект для isAuthenticated, он сработает.
    // Можно добавить явный navigate('/') если login был успешен, но лучше, чтобы это управлялось isAuthenticated.
    // Проверка на успешный логин (отсутствие ошибки и наличие токена) может быть добавлена в AuthContext.login
    // или здесь, если login возвращает какой-то признак успеха.
    // Сейчас App.tsx автоматически перенаправит, если isAuthenticated изменится.
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card style={{ width: '30rem' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Вход для Администратора</Card.Title>
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3" controlId="formBasicUsername">
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={isLoading} className="w-100">
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginPage;