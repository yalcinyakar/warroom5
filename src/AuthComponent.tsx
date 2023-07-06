import React, { useState, ChangeEvent, useEffect } from 'react';
import { Typography, Box, Button, InputLabel, Input } from '@mui/material';
import { styled } from '@mui/system';
import { auth, database, firestore } from './firebaseConfig';
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
                // Fetch the user's nickname from the database
                database.ref(`users/${user.uid}/nickname`).once('value', (snapshot) => {
                    const fetchedNickname = snapshot.val();
                    setNickname(fetchedNickname);
                });
            } else {
                setUserSignedIn(false);
                setUserId('');
                setNickname('');
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
        setErrorMessage('Form bilgilerini gelişigüzel doldurunuz.');
    };

    const handleSignUp = async () => {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential?.user; // Add optional chaining here
            console.log('User signed up:', user);
            setErrorMessage('Aramıza hoşgeldin');
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

            if (user) {
                console.log('User signed in:', user);
                setErrorMessage('Sign in başarılı');

                // Fetch the user's nickname from Firestore
                const userDocRef = firestore.collection('users').doc(user.uid);
                const userDoc = await userDocRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const userNickname = userData?.nickname || '';

                    // Update the nickname state and set the user as signed in
                    setErrorMessage('');
                    setUserSignedIn(true);
                    setUserId(user.uid);
                    setNickname(userNickname);
                }
            }
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
            const roomName = prompt('Enter the room name');
            if (!roomName) return;

            // Call the createGameRoom Firebase Cloud Function
            const createGameRoomCallable = functions.httpsCallable('createGameRoom');
            const response = await createGameRoomCallable({ roomName });
            const roomId = response.data;

            console.log('Room created with ID:', roomId);
            // Add your logic here to handle the room creation
        } catch (error: any) {
            console.error('Error creating room:', error);
        }
    };




    const handleJoinRoom = async () => {
        try {
            const roomId = prompt('Enter the room ID');
            if (!roomId) return;

            const joinGameRoomCallable = functions.httpsCallable('joinGameRoom');
            const response = await joinGameRoomCallable({ roomId: roomId, leaveRoom: false }); // Set leaveRoom flag to false when joining the room
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

    const handleLeaveRoom = async () => {
        try {
            const roomId = prompt('Enter the room ID');
            if (!roomId) return;

            const joinGameRoomCallable = functions.httpsCallable('joinGameRoom');
            const response = await joinGameRoomCallable({ roomId: roomId, leaveRoom: true }); // Set leaveRoom flag to true when leaving the room
            const success = response.data.success;
            if (success) {
                console.log('Left room:', roomId);
                // Add your logic here to handle leaving the room
            } else {
                console.error('Failed to leave room:', roomId);
            }
        } catch (error: any) {
            console.error('Error leaving room:', error);
        }
    };


    const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value);
    };

    return (
        <Container>
            <Title>Hi there, {userSignedIn && nickname}</Title> {/* Display the nickname if user is signed in */}
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
                                <Button onClick={handleLeaveRoom}>Leave Room</Button> {/* Add the Leave Room button */}
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






const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #111;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
`;

const Title = styled(Typography)`
  font-size: 24px;
  margin-bottom: 20px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: bold;
`;

const FieldsContainer = styled(Box)`
  margin-top: 10px;
`;

const InputGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const StyledInputLabel = styled(InputLabel)`
  font-size: 14px;
  margin-bottom: 5px;
  color: #fff;
  font-weight: bold;
`;

const StyledInput = styled(Input)`
  padding: 8px;
  border: none;
  background-color: #222;
  color: #fff;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

const ButtonGroup = styled(Box)`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const StyledButton = styled(Button)`
  padding: 10px 20px;
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

const ErrorMessage = styled(Typography)`
  color: #ff0000;
  margin-bottom: 10px;
`;

const UserInfo = styled(Box)`
  margin-top: 20px;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
`;

export default AuthComponent;
