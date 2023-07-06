import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import AuthComponent from './AuthComponent';
import RoomsList from './RoomsList';

const App: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = false; // Replace with your authentication logic

    useEffect(() => {
        // Redirect to appropriate page based on authentication status
        if (isAuthenticated) {
            navigate('/rooms');
        } else {
            navigate('/signin');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="App">
            <Routes>
                <Route path="/signin" element={<AuthComponent />} />
                <Route path="/rooms" element={<RoomsList />} />
            </Routes>
        </div>
    );
}

export default App;
