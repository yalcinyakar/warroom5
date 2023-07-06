import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeComponent: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect after 5 seconds
        const timeout = setTimeout(() => {
            navigate('/rooms');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div>
            {/* Add your futuristic game welcome screen components here */}
        </div>
    );
};

export default HomeComponent;
