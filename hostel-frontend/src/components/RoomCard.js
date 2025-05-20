import React from 'react';

// Вспомогательная функция для форматирования даты и времени
const formatDate = (dateString, timeString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    let formatted = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    if (timeString) {
        // timeString приходит в формате "HH:MM:SS", нам нужно "HH:MM"
        formatted += ` ${timeString.substring(0, 5)}`;
    }
    return formatted;
};


const RoomCard = ({ room }) => {
    const isOccupied = room.is_occupied; // Используем свойство is_occupied из сериализатора
    const isPaid = room.is_paid;

    // Стили для карточки в зависимости от статуса
    // См. base.html: .room-card.status-paid, .room-card.status-unpaid
    let cardStyle = {
        border: '1px solid #dee2e6',
        borderRadius: '.25rem',
        marginBottom: '15px',
        backgroundColor: '#fff',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%' // для одинаковой высоты карточек в сетке
    };

    if (isOccupied) {
        if (isPaid) {
            cardStyle.backgroundColor = '#cfe2ff'; // Синий фон
            cardStyle.borderLeft = '5px solid #0d6efd';
        } else {
            cardStyle.backgroundColor = '#f8d7da'; // Красный фон
            cardStyle.borderLeft = '5px solid #dc3545';
        }
    }

    // Форматирование даты выезда (если есть)
    const checkOutDateDisplay = room.check_out_date_display
                                ? room.check_out_date_display // Уже отформатировано в сериализаторе
                                : (room.check_out_date ? formatDate(room.check_out_date) : 'N/A');


    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h5 style={{ margin: 0 }}>
                    {room.number} ({room.room_type_display})
                </h5>
                {isOccupied && <i className="fas fa-key" title="Комната занята"></i>}
            </div>

            <p style={{ marginBottom: '5px' }}>Всего кроватей: {room.beds_total}</p>

            {isOccupied ? (
                <>
                    <p style={{ marginBottom: '5px' }}>Занято кроватей: {room.beds_taken}</p>
                    <p style={{ marginBottom: '5px' }}>
                        Дата заезда: {formatDate(room.check_in_date, room.check_in_time)}
                    </p>
                    <p style={{ marginBottom: '5px' }}>Дней проживания: {room.days_booked}</p>
                    <p style={{ marginBottom: '5px' }}>
                        Дата выезда: {checkOutDateDisplay}
                    </p>
                    <p>
                        Оплачено: {isPaid ?
                            <>Да <i className="fas fa-check-circle" style={{ color: 'green' }}></i></> :
                            <>Нет <i className="fas fa-times-circle" style={{ color: 'red' }}></i></>
                        }
                    </p>
                </>
            ) : (
                <p style={{ color: '#6c757d' }}>Комната свободна</p>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '10px' }}> {/* Кнопки внизу карточки */}
                <hr style={{ margin: '10px 0' }} />
                <button style={{ marginRight: '5px', fontSize: '0.875em' }}>Изменить занятость</button>
                <button style={{ marginRight: '5px', fontSize: '0.875em', backgroundColor: '#6c757d', color: 'white' }}>Редакт. комнату</button>
                <button style={{ fontSize: '0.875em', backgroundColor: '#dc3545', color: 'white' }}>
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

export default RoomCard;