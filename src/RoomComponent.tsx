import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/system';
import {firestore, functions} from './firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import firebase from 'firebase/app';

const RoomContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;

const RoomTitle = styled(Typography)`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const PlayerList = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const PlayerItem = styled(Typography)`
  font-size: 16px;
  margin-bottom: 5px;
`;

const ReadyButton = styled(Button)`
  padding: 10px 20px;
  background-color: #ff6f00;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff8f00;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
  }
`;

const Popup = styled(Box)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 10px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 999;
  animation: fadeOut 3s ease forwards;

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }
`;

interface Player {
    id: string;
    name: string;
    ready: boolean;
}

interface Room {
    id: string;
    name: string;
    players: Player[];
}

interface RoomProps {
    roomId: string;
}

const RoomComponent: React.FC<RoomProps> = ({ roomId }) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [joinMessage, setJoinMessage] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const roomDoc = await firestore.collection('gameRooms').doc(roomId).get();
                if (roomDoc.exists) {
                    const roomData = roomDoc.data();
                    const playerIds = roomData?.players || [];
                    const playersPromises = playerIds.map(async (playerId: string) => {
                        const playerDoc = await firestore.collection('users').doc(playerId).get();
                        const playerData = playerDoc.data();
                        return {
                            id: playerId,
                            name: playerData?.nickname || '',
                            ready: playerData?.ready || false,
                        };
                    });
                    const players = await Promise.all(playersPromises);
                    setRoom({
                        id: roomDoc.id,
                        name: roomData?.name || '',
                        players: players,
                    });
                }
            } catch (error) {
                console.error('Error fetching room:', error);
            }
        };

        fetchRoom();
    }, [roomId]);

    useEffect(() => {
        if (room && room.players.length > 0) {
            const joinedPlayer = room.players[room.players.length - 1];
            const joinMessage = `${joinedPlayer.name} joined the room`;
            setJoinMessage(joinMessage);
            console.log(joinMessage);
            const timer = setTimeout(() => {
                setJoinMessage('');
            }, 3000);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [room]);

    const handleReadyClick = () => {
        // Implement your logic here to update the player's readiness status in the Firestore database
    };

    const handleLeaveRoom = async () => {
        try {
            const roomRef = firestore.collection('gameRooms').doc(roomId);
            const roomDoc = await roomRef.get();
            if (roomDoc.exists) {
                const roomId = roomDoc.id;
                const joinGameRoomCallable = functions.httpsCallable('joinGameRoom');
                const response = await joinGameRoomCallable({ roomId: roomId, leaveRoom: true }); // Set leaveRoom flag to true when leaving the room
                const success = response.data.success;
                if (success) {
                    console.log('Left room:', roomId);
                    navigate('/rooms');
                    // Add your logic here to handle leaving the room
                } else {
                    console.error('Failed to leave room:', roomId);
                }
            } else {
                console.error('Room not found:', roomId);
            }
        } catch (error: any) {
            console.error('Error leaving room:', error);
        }
    };


    if (!room) {
        return <div>Loading room...</div>;
    }

    return (
        <RoomContainer>
            <RoomTitle>{room.name}</RoomTitle>
            <PlayerList>
                <Typography variant="h5">Players:</Typography>
                {room.players.map((player) => (
                    <PlayerItem key={player.id}>{`${player.name} - ${player.ready ? 'Ready' : 'Not Ready'}`}</PlayerItem>
                ))}
            </PlayerList>
            <ReadyButton onClick={handleReadyClick}>
                {room.players.some((player) => !player.ready) ? 'Ready' : 'Start Game'}
            </ReadyButton>
            {joinMessage && <Popup>{joinMessage}</Popup>}
            <Button onClick={handleLeaveRoom}>Leave Room</Button>
        </RoomContainer>
    );
};

export default RoomComponent;
