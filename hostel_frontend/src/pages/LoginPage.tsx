// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Form, Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear error when component unmounts or username/password changes
    return () => {
      clearError();
    };
  }, [clearError]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError(); // Clear previous errors
    const success = await login(username, password);
    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Card>
          <Card.Body>
            <Card.Title className="text-center mb-4 h3">Вход Администратора</Card.Title>
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger" onClose={clearError} dismissible>{error}</Alert>}
              <Form.Group className="mb-3" controlId="loginFormUsername">
                <Form.Label>Имя пользователя</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Введите имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="loginFormPassword">
                <Form.Label>Пароль</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={isLoading} className="w-100">
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Вход...
                  </>
                ) : ('Войти')}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};
export default LoginPage;