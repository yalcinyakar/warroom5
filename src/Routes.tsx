import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthComponent from './AuthComponent';
import RoomsList from './RoomsList';
import HomeComponent from "./HomeComponent";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/" element={<AuthComponent />} />
            <Route path="/rooms" element={<RoomsList />} />
        </Routes>
    );
};

export default AppRoutes;
