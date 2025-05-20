// src/pages/RoomListPage.tsx
import React, { useEffect, useState } from 'react';
import { fetchRooms } from '../services/apiService'; // Путь к вашему apiService
import { Room } from '../types'; // Путь к вашим типам
import { Alert, Card, Col, Container, Row, Spinner, Button } from 'react-bootstrap';
// import { Link } from 'react-router-dom'; // Для кнопки "Добавить комнату"

const RoomListPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      setIsLoading(true);
      setError(null);
      const response = await fetchRooms();
      if ('error' in response) {
        // @ts-ignore // Временно игнорируем ошибку типа для error.error.detail
        setError(response.error?.detail || response.error?.message || 'Не удалось загрузить комнаты');
        setRooms([]);
      } else {
        setRooms(response);
      }
      setIsLoading(false);
    };

    loadRooms();
  }, []);

  if (isLoading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-3">
        <Alert variant="danger">Ошибка: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Список Комнат</h1>
        {/* TODO: Добавить кнопку для перехода на страницу/модальное окно добавления комнаты */}
        {/* <Button as={Link} to="/add-room" variant="success">Добавить комнату</Button> */}
      </div>
      {rooms.length === 0 ? (
        <p>Комнат пока нет.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {rooms.map((room) => (
            <Col key={room.id}>
              <Card className={`h-100 ${room.is_occupied ? (room.is_paid ? 'border-primary' : 'border-danger') : 'border-success'}`}>
                <Card.Header as="h5" className={`
                  ${room.is_occupied ? (room.is_paid ? 'bg-primary text-white' : 'bg-danger text-white') : 'bg-success text-white'}
                `}>
                  {room.number} ({room.room_type_display})
                  {room.is_occupied && <i className="fas fa-key ms-2"></i>}
                </Card.Header>
                <Card.Body>
                  <Card.Text>Всего кроватей: {room.beds_total}</Card.Text>
                  {room.is_occupied ? (
                    <>
                      <Card.Text>Занято: {room.beds_taken}</Card.Text>
                      <Card.Text>Дата заезда: {room.check_in_date ? new Date(room.check_in_date).toLocaleDateString() : 'N/A'}</Card.Text>
                      <Card.Text>Дней: {room.days_booked}</Card.Text>
                      <Card.Text>Дата выезда: {room.check_out_date_display || 'N/A'}</Card.Text>
                      <Card.Text>Оплачено: {room.is_paid ? 'Да' : 'Нет'}</Card.Text>
                    </>
                  ) : (
                    <Card.Text className="text-muted">Свободна</Card.Text>
                  )}
                </Card.Body>
                <Card.Footer>
                  {/* TODO: Добавить кнопки для редактирования занятости и комнаты */}
                  {/* <Button variant="info" size="sm" className="me-2">Занятость</Button> */}
                  {/* <Button variant="warning" size="sm">Редактировать</Button> */}
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