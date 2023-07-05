import React, { useState, ChangeEvent, useEffect } from 'react';
import { auth, database } from './firebaseConfig';
import styled from 'styled-components';
import 'firebase/compat/functions';
import { functions } from './firebaseConfig';

const AuthComponent: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userSignedIn, setUserSignedIn] = useState(false);
    const [showFields, setShowFields] = useState(false);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserSignedIn(true);
                setUserId(user.uid);
            } else {
                setUserSignedIn(false);
                setUserId('');
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleSignUpClick = () => {
        setShowFields(true);
        setErrorMessage('');
    };

    const handleSignInClick = () => {
        setShowFields(true);
        setErrorMessage('');
    };

    const handleSignUp = async () => {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential?.user; // Add optional chaining here
            console.log('User signed up:', user);
            setErrorMessage('');
            setIsSignedUp(true);
            setUserId(user?.uid || '');
            // Call the cloud function to associate the user's nickname with the UID
            const addNicknameCallable = functions.httpsCallable('addNickname');
            const response = await addNicknameCallable({ userId: user?.uid, nickname: nickname });
            console.log('Nickname added:', response.data);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('Email is already registered');
            } else {
                setErrorMessage(error.message);
            }
        }
    };


    const handleSignIn = async () => {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log('User signed in:', user);
            setErrorMessage('');
            setUserSignedIn(true);
            setUserId(user?.uid || '');
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            console.log('User signed out');
            setErrorMessage('');
            setUserSignedIn(false);
            setUserId('');
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleCreateRoom = async () => {
        try {
            const createGameRoomCallable = functions.httpsCallable('createGameRoom');
            const response = await createGameRoomCallable();
            const gameId = response.data;
            console.log('Room created with ID:', gameId);
            // Add your logic here to handle the room creation, such as redirecting the user to the room
        } catch (error: any) {
            console.error('Error creating room:', error);
        }
    };

    const handleJoinRoom = async () => {
        try {
            const roomId = prompt('Enter the room ID');
            if (!roomId) return;

            const joinGameRoomCallable = functions.httpsCallable('joinGameRoom');
            const response = await joinGameRoomCallable({ roomId: roomId });
            const success = response.data.success;
            if (success) {
                console.log('Joined room:', roomId);
                // Add your logic here to handle joining the room, such as redirecting the user to the room
            } else {
                console.error('Failed to join room:', roomId);
            }
        } catch (error: any) {
            console.error('Error joining room:', error);
        }
    };


    const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value);
    };

    return (
        <Container>
            <Title>Hi there,</Title>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {!showFields && !userSignedIn && (
                <ButtonGroup>
                    {!isSignedUp && <Button onClick={handleSignUpClick}>Sign Up</Button>}
                    <Button onClick={handleSignInClick}>Sign In</Button>
                </ButtonGroup>
            )}
            {showFields && (
                <FieldsContainer>
                    <InputGroup>
                        <InputLabel htmlFor="email">Email</InputLabel>
                        <Input
                            type="email"
                            id="email"
                            autoComplete="email"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </InputGroup>
                    <InputGroup>
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <Input
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </InputGroup>
                    {!userSignedIn && (
                        <InputGroup>
                            <InputLabel htmlFor="nickname">Nickname</InputLabel>
                            <Input
                                type="text"
                                id="nickname"
                                autoComplete="nickname"
                                value={nickname}
                                onChange={handleNicknameChange}
                            />
                        </InputGroup>
                    )}
                    <ButtonGroup>
                        {userSignedIn ? (
                            <>
                                <Button onClick={handleCreateRoom}>Create Room</Button>
                                <Button onClick={handleJoinRoom}>Join Room</Button>
                                <Button onClick={handleSignOut}>Sign Out</Button>
                            </>
                        ) : (
                            <>
                                {!isSignedUp && <Button onClick={handleSignUp}>Sign Up</Button>}
                                <Button onClick={handleSignIn}>Sign In</Button>
                            </>
                        )}
                    </ButtonGroup>
                </FieldsContainer>
            )}
            <UserInfo>{userSignedIn && <p>Signed in as: {userId}</p>}</UserInfo>
        </Container>
    );
};

// Styled Components

// ... (the same as in the previous code)




const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #333;
  border-radius: 8px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
  color: #fff;
`;

const FieldsContainer = styled.div`
  margin-top: 10px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  margin-bottom: 5px;
  color: #fff;
`;

const Input = styled.input`
  padding: 8px;
  border: none;
  background-color: #555;
  color: #fff;
  border-radius: 4px;
`;

const ButtonGroup = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #800000; /* Dark and matte red color */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5b0000; /* Darker red color on hover */
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4d4d;
  margin-top: 10px;
  font-size: 14px;
`;

const UserInfo = styled.div`
  margin-top: 10px;
  color: #fff;
`;

export default AuthComponent;
