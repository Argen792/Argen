// src/App.js
import React, { useState, useEffect } from 'react'; // <--- Убедитесь, что useState и useEffect импортированы
import axios from 'axios';
import RoomList from './components/RoomList';     // <--- Импорт RoomList
import LoginForm from './components/LoginForm';   // <--- Импорт LoginForm
import NavigationBar from './components/NavigationBar';
import './App.css';

function App() {
    // VVV ВЕРНИТЕ ЭТИ СТРОКИ VVV
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            setIsAuthenticated(true);
        }
        setIsLoadingAuth(false);
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
        console.log('Logged out.');
    };

    if (isLoadingAuth) {
        return <p>Loading application...</p>;
    }
    // ^^^ ВЕРНИТЕ ЭТИ СТРОКИ ^^^

    return (
        <div className="App">
            <NavigationBar />
            <div style={{ padding: '0 20px' }}>
                <header className="App-header">
                    {/* Заголовок "Hostel Management" можно убрать или изменить, т.к. он теперь в Navbar */}
                    {isAuthenticated && ( // <--- Теперь isAuthenticated будет определена
                        <button onClick={handleLogout} style={{ float: 'right', marginBottom: '10px' }}>Logout</button> // <--- Теперь handleLogout будет определена
                    )}
                </header>
                <main>
                    {!isAuthenticated ? ( // <--- Теперь isAuthenticated будет определена
                        <LoginForm onLoginSuccess={handleLoginSuccess} /> // <--- Теперь LoginForm и handleLoginSuccess будут определены
                    ) : (
                        <RoomList /> // <--- Теперь RoomList будет определен
                    )}
                </main>
            </div>
        </div>
    );
}

export default App;