import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/system';
import { TypeAnimation } from 'react-type-animation';

const WelcomeContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
`;

const Title = styled(Typography)`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Description = styled(Typography)`
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: bold;
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

const WelcomeScreen = () => {
    return (
        <WelcomeContainer>
            <Title variant="h1">Welcome to WarRoom</Title>
            <div>
                <TypeAnimation
                    sequence={[
                        'Join the battle to beat the ass of your colleague...',
                        1000,
                        'Join the battle to beat the ass of your coworker...',
                        1000,
                        'Join the battle to beat the ass of your manager...',
                        1000,
                    ]}
                    speed={50}
                    repeat={Infinity}
                    style={{ fontSize: '2em', fontWeight: 'bold' }}
                />
            </div>
            <ButtonContainer>
                <Link to="/signin">
                    <WelcomeButton variant="contained" color="primary">
                        Sign In
                    </WelcomeButton>
                </Link>
                <Link to="/rooms">
                    <WelcomeButton variant="contained" color="primary">
                        WarRooms
                    </WelcomeButton>
                </Link>
            </ButtonContainer>
        </WelcomeContainer>
    );
};

export default WelcomeScreen;
