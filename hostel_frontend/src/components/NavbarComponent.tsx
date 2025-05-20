// src/components/NavbarComponent.tsx
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Путь к вашему AuthContext

const NavbarComponent: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Перенаправляем на страницу логина после выхода
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">Администратор Хостела</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Комнаты</Nav.Link>
            {/* TODO: Добавить ссылку на Календарь, если будет такая страница */}
            {/* <Nav.Link as={Link} to="/calendar">Календарь</Nav.Link> */}
            {/* TODO: Добавить ссылку на Добавить комнату, если будет такая страница */}
            {/* <Nav.Link as={Link} to="/add-room">Добавить комнату</Nav.Link> */}
          </Nav>
          <Nav>
            <Button variant="outline-light" onClick={handleLogout}>Выйти</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;