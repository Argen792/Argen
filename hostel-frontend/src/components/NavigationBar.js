import React from 'react';
// Если будете использовать react-router-dom для навигации:
// import { Link } from 'react-router-dom';

const NavigationBar = () => {
    // Пока используем заглушки для ссылок
    const NavLink = ({ to, children }) => <a href={to} style={{ marginRight: '15px', color: 'white', textDecoration: 'none' }}>{children}</a>;

    return (
        <nav style={{
            backgroundColor: '#343a40', // темно-серый, как в Bootstrap dark navbar
            padding: '10px 20px',
            color: 'white',
            marginBottom: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5em' }}>
                    Администратор Хостела
                </a>
                <div>
                    <NavLink to="/rooms">Комнаты</NavLink>
                    <NavLink to="/calendar">Календарь</NavLink>
                    <NavLink to="/add-room">Добавить комнату</NavLink>
                </div>
            </div>
        </nav>
    );
};

export default NavigationBar;