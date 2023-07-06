import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { firestore } from './firebaseConfig';
import { Link } from 'react-router-dom';

const RoomsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 300px;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #222;
  color: #fff;
  border-radius: 4px;
`;

const RoomName = styled.span`
  flex: 1;
  font-size: 14px;
`;

const JoinButton = styled.button`
  padding: 8px 16px;
  background-color: #800000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5b0000;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
  }
`;

interface Room {
    id: string;
    name: string;
}

const RoomsList: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const roomsCollection = firestore.collection('gameRooms');
                const roomsSnapshot = await roomsCollection.get();
                const roomsData = roomsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name,
                }));
                setRooms(roomsData);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        fetchRooms();
    }, []);

    const handleJoinRoom = (roomId: string) => {
        // Handle joining the room with the provided roomId
        console.log('Joining room:', roomId);
    };

    return (
        <RoomsContainer>
            <h3>Available Rooms:</h3>
            {rooms.map((room) => (
                <RoomItem key={room.id}>
                    <RoomName>{room.name}</RoomName>
                    <Link to={`/rooms/${room.id}`}>
                        <JoinButton onClick={() => handleJoinRoom(room.id)}>Join Room</JoinButton>
                    </Link>
                </RoomItem>
            ))}
        </RoomsContainer>
    );
};

export default RoomsList;
