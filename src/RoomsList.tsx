import React, { useState, useEffect } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/system';
import { firestore } from './firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import { functions } from './firebaseConfig'; // Import the functions from firebaseConfig

const RoomsContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;

const RoomItem = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 400px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #202020;
  color: #fff;
  border-radius: 8px;
`;

const RoomName = styled(Typography)`
  flex: 1;
  font-size: 16px;
  font-weight: bold;
`;

const PlayerCount = styled(Typography)`
  font-size: 14px;
  margin-right: 10px;
`;

const JoinButton = styled(Button)`
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

interface Room {
    id: string;
    name: string;
    players?: string[];
}

const RoomsList: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const roomsCollection = firestore.collection('gameRooms');
                const roomsSnapshot = await roomsCollection.get();
                const roomsData = roomsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                    players: doc.data().players || [],
                }));
                setRooms(roomsData);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        fetchRooms();
    }, []);

    const handleJoinRoom = async (roomId: string) => {
        try {
            console.log('Joining room:', roomId);
            // Call the joinGameRoom Firebase Cloud Function
            const joinGameRoomCallable = functions.httpsCallable('joinGameRoom');
            const response = await joinGameRoomCallable({ roomId: roomId, leaveRoom: false });
            const success = response.data.success;
            if (success) {
                console.log('Joined room:', roomId);
                // Add your logic here to handle joining the room, such as redirecting the user to the room
                navigate(`/rooms/${roomId}`);
            } else {
                console.error('Failed to join room:', roomId);
            }
        } catch (error) {
            console.error('Error joining room:', error);
        }
    };

    return (
        <RoomsContainer>
            <Typography variant="h3" style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                Available WarRooms:
            </Typography>
            {rooms.map((room) => (
                <RoomItem key={room.id}>
                    <Box>
                        <RoomName>{room.name}</RoomName>
                        <PlayerCount>{`${room.players?.length || 0} players`}</PlayerCount>
                    </Box>
                    <JoinButton onClick={() => handleJoinRoom(room.id)}>Join WarRoom</JoinButton>
                </RoomItem>
            ))}
        </RoomsContainer>
    );
};

export default RoomsList;
