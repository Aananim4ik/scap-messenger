// src/components/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaBell, FaUserSlash, FaBan } from 'react-icons/fa';

const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 350px;
  height: 100vh;
  background: #111;
  color: #0f0;
  padding: 20px;
  animation: ${slideIn} 0.5s forwards;
  overflow-y: auto;
  box-shadow: -5px 0 15px rgba(0, 255, 0, 0.5);
  z-index: 1000;
`;

const UserList = styled.div`
  margin-top: 20px;
`;

const UserItem = styled.div`
  padding: 10px;
  background: #222;
  margin-bottom: 10px;
  border-radius: 4px;
  position: relative;
  animation: ${fadeIn} 0.3s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

const BanButton = styled.button`
  padding: 5px 10px;
  background: red;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  right: 10px;
  transition: background 0.3s;

  &:hover {
    background: darkred;
  }
`;

const MuteButton = styled.button`
  padding: 5px 10px;
  background: orange;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  position: absolute;
  top: 10px;
  right: 80px;
  transition: background 0.3s;

  &:hover {
    background: darkorange;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: #0f0;
  color: #000;
  padding: 15px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  animation: fadeInOut 4s forwards;
  box-shadow: 0 0 10px #0f0;

  @keyframes fadeInOut {
    from { opacity: 0; transform: translateY(-20px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-20px); }
  }
`;

interface User {
  _id: string;
  nickname: string;
  role: string;
  messagesCount: number;
  isMuted: boolean;
  mutedUntil?: string;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [notification, setNotification] = useState<string>('');
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/admin/users');
        setUsers(res.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (user.role === 'moderator' || user.role === 'creator') {
      fetchUsers();
    }
  }, [user.role]);

  const banUser = async (userId: string) => {
    try {
      await axios.post('/api/admin/ban', { userId });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setNotification('User banned successfully!');
      // Воспроизведение анимации и звука
      const audio = new Audio('/sounds/ban-sound.mp3');
      audio.play();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const muteUser = async (userId: string, duration: number) => {
    try {
      await axios.post('/api/moderator/mute', { targetUserId: userId, duration });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isMuted: true, mutedUntil: new Date(Date.now() + duration * 60000).toISOString() } : u
        )
      );
      setNotification('User muted successfully!');
      const audio = new Audio('/sounds/mute-sound.mp3');
      audio.play();
    } catch (error) {
      console.error('Error muting user:', error);
    }
  };

  if (user.role !== 'moderator' && user.role !== 'creator') {
    return null;
  }

  return (
    <>
      {notification && <Notification><FaBell style={{ marginRight: '10px' }} />{notification}</Notification>}
      <Panel>
        <h2>Admin Panel</h2>
        <UserList>
          {users.map((u) => (
            <UserItem key={u._id}>
              <strong>{u.nickname}</strong> - {u.role}
              {u.role !== 'creator' && (
                <>
                  <MuteButton onClick={() => muteUser(u._id, 10)} title="Mute for 10 minutes">
                    <FaUserSlash />
                  </MuteButton>
                  <BanButton onClick={() => banUser(u._id)} title="Ban User">
                    <FaBan />
                  </BanButton>
                </>
              )}
              {u.isMuted && u.mutedUntil && (
                <small>Muted until: {new Date(u.mutedUntil).toLocaleTimeString()}</small>
              )}
            </UserItem>
          ))}
        </UserList>
      </Panel>
    </>
  );
};

export default AdminPanel;
