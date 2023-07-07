import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/system';
import { TypeAnimation } from 'react-type-animation';
import { auth, firestore } from './firebaseConfig';

const WelcomeContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
`;

const Title = styled(Typography)`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Description = styled(Typography)`
  font-size: 16px;
  margin-bottom: 20px;
`;

const ButtonContainer = styled(Box)`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

const WelcomeButton = styled(Button)`
  padding: 12px 24px;
  background-color: #ff6f00;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0 10px;

  &:hover {
    background-color: #ff8f00;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
  }
`;

const NicknameText = styled(Typography)`
  margin-top: 20px;
`;

const WelcomeScreen = () => {
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserSignedIn(true);
                fetchNickname(user.uid);
            } else {
                setUserSignedIn(false);
                setNickname('');
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const fetchNickname = async (userId: string) => {
        try {
            const userDocRef = firestore.collection('users').doc(userId);
            const userDoc = await userDocRef.get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData) {
                    setNickname(userData.nickname);
                }
            }
        } catch (error) {
            console.error('Error fetching nickname:', error);
        }
    };

    const handleButtonClick = () => {
        if (userSignedIn) {
            navigate('/rooms');
        } else {
            navigate('/signin');
        }
    };

    return (
        <WelcomeContainer>
            <Title variant="h1">WarRoom</Title>
            <div>
                <TypeAnimation
                    sequence={[
                        'Join the battle to kick the ass of your colleague...',
                        1000,
                        'Join the battle to kick the ass of your coworker...',
                        1000,
                        'Join the battle to kick the ass of your manager...',
                        1000,
                    ]}
                    speed={50}
                    repeat={Infinity}
                    style={{ fontSize: '2em' }}
                />
            </div>
            <ButtonContainer>
                <WelcomeButton variant="contained" color="primary" onClick={handleButtonClick}>
                    {userSignedIn ? 'Get in WarRooms' : 'Sign In/Sign Up'}
                </WelcomeButton>
            </ButtonContainer>
            {userSignedIn && <NicknameText variant="body1">Welcome, {nickname}</NicknameText>}
        </WelcomeContainer>
    );
};

export default WelcomeScreen;
