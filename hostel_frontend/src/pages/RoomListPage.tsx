// src/pages/RoomListPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchRooms } from '../services/apiService';
import { Room, ApiError } from '../types';
import { Alert, Card, Col, Row, Spinner, Button, Container } from 'react-bootstrap';
// import { Link } from 'react-router-dom';

const RoomListPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      setIsLoading(true);
      setError(null);
      const response = await fetchRooms();
      if (Array.isArray(response)) { // Success case
        setRooms(response);
      } else { // Error case
        const apiError = response as ApiError;
        let errorMessage = 'Не удалось загрузить комнаты.';
        if (apiError.error && typeof apiError.error === 'object' && apiError.error.detail) {
          errorMessage = apiError.error.detail;
        } else if (typeof apiError.error === 'string') {
          errorMessage = apiError.error;
        }
        setError(errorMessage);
        setRooms([]);
      }
      setIsLoading(false);
    };
    loadRooms();
  }, []);

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return <Container className="mt-3"><Alert variant="danger">Ошибка: {error}</Alert></Container>;
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Список Комнат</h1>
        {/* <Button as={Link} to="/add-room" variant="success"><i className="fas fa-plus"></i> Добавить</Button> */}
      </div>
      {rooms.length === 0 ? (
        <p>Комнат пока нет.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {rooms.map((room) => (
            <Col key={room.id}>
              <Card className={`h-100 shadow-sm ${room.is_occupied ? (room.is_paid ? 'border-primary' : 'border-danger') : 'border-success'}`}>
                <Card.Header as="h5" className={`
                  ${room.is_occupied ? (room.is_paid ? 'bg-primary text-white' : 'bg-danger text-white') : 'bg-success text-white'}
                `}>
                  {room.number} ({room.room_type_display})
                  {room.is_occupied && <i className="fas fa-key ms-2" title="Занята"></i>}
                </Card.Header>
                <Card.Body>
                  <Card.Text><strong>Всего кроватей:</strong> {room.beds_total}</Card.Text>
                  {room.is_occupied ? (
                    <>
                      <Card.Text><strong>Занято:</strong> {room.beds_taken}</Card.Text>
                      <Card.Text><strong>Заезд:</strong> {room.check_in_date ? new Date(room.check_in_date + 'T00:00:00').toLocaleDateString() : 'N/A'}</Card.Text>
                      <Card.Text><strong>Дней:</strong> {room.days_booked}</Card.Text>
                      <Card.Text><strong>Выезд:</strong> {room.check_out_date_display || 'N/A'}</Card.Text>
                      <Card.Text><strong>Оплачено:</strong> {room.is_paid ? <span className="text-success">Да</span> : <span className="text-danger">Нет</span>}</Card.Text>
                    </>
                  ) : (
                    <Card.Text className="text-muted">Свободна</Card.Text>
                  )}
                </Card.Body>
                <Card.Footer className="text-center">
                  {/* <Button variant="info" size="sm" className="me-2">Занятость</Button>
                  <Button variant="warning" size="sm">Редакт.</Button> */}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};
export default RoomListPage;