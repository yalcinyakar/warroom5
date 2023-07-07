import React from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import './App.css';
import AuthComponent from './AuthComponent';
import RoomsList from './RoomsList';
import WelcomeScreen from './WelcomeScreen';
import RoomComponent from './RoomComponent';

const App: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = false; // Replace with your authentication logic

    /*
    useEffect(() => {
      // Redirect to appropriate page based on authentication status
      if (isAuthenticated) {
        navigate('/rooms');
      } else {
        navigate('/signin');
      }
    }, [isAuthenticated, navigate]);
    */

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/signin" element={<AuthComponent />} />
                <Route path="/rooms" element={<RoomsList />} />
                <Route path="/rooms/:roomId" element={<RoomComponentWrapper />} />
            </Routes>
        </div>
    );
};

const RoomComponentWrapper = () => {
    const { roomId = '' } = useParams();
    return <RoomComponent roomId={roomId} />;
};

export default App;
