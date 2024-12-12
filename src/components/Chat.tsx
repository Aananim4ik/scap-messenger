// src/components/Chat.tsx
import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import styled, { keyframes } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setUser } from '../store/userSlice';
import UserProfile from './UserProfile';
import FileUploader from './FileUploader';
import AdminPanel from './AdminPanel';

let socket: Socket;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ChatContainer = styled.div`
  display: flex;
  height: 80vh;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace;
  box-shadow: 0 0 20px #0f0;
  animation: fadeIn 1s ease-in-out;
`;

const Sidebar = styled.div`
  width: 250px;
  background: #111;
  color: #0f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const MainChat = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #000;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: scroll;
  border-bottom: 1px solid #0f0;
`;

const Message = styled.div<{ isOwn: boolean }>`
  margin-bottom: 10px;
  text-align: ${(props) => (props.isOwn ? 'right' : 'left')};
  animation: fadeIn 0.5s ease-in-out;

  strong {
    color: ${(props) => (props.isOwn ? '#0ff' : '#0f0')};
  }

  small {
    color: #888;
  }
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px 20px;
  background: #111;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  background: #000;
  color: #0f0;
  border: 1px solid #0f0;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #00ff00;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background: #0f0;
  color: #000;
  border: none;
  cursor: pointer;
  margin-left: 10px;
  border-radius: 4px;
  font-size: 16px;
  transition: background 0.3s;

  &:hover {
    background: #00ff00;
  }
`;

const ActiveGroups = styled.div`
  margin-top: 20px;
  flex: 1;
  overflow-y: auto;
`;

const Group = styled.div`
  padding: 10px;
  background: #222;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #333;
  }
`;

interface MessageType {
  user: string;
  text: string;
  timestamp: string;
  group: string;
  fileUrl?: string;
  fileName?: string;
}

const Chat: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [groups, setGroups] = useState<string[]>([]);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    // Инициализация сокета
    socket = io();

    // Аутентификация сокета
    socket.emit('authenticate', getCookie('token'));

    // Обработка входящих сообщений
    socket.on('message', (msg: MessageType) => {
      if (currentGroup === msg.group) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Обработка файлов
    socket.on('file', (msg: MessageType) => {
      if (currentGroup === msg.group) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Обработка групп
    socket.on('groups', (grp: string[]) => {
      setGroups(grp);
    });

    // Обработка прошлых сообщений
    socket.on('previousMessages', (msgs: MessageType[]) => {
      setMessages(msgs);
    });

    // Обработка обновления роли
    socket.on('roleUpdated', ({ user: updatedUser, newRole }: { user: string; newRole: string }) => {
      if (updatedUser === user.nickname) {
        dispatch(setUser({ nickname: user.nickname, role: newRole }));
        setNotification(`Your role has been updated to "${newRole}"`);
      }
    });

    // Обработка уведомлений
    socket.on('notification', (msg: string) => {
      setNotification(msg);
      // Можно заменить на более изящный компонент уведомлений
    });

    // Запрос текущих групп
    socket.emit('getGroups');

    // Очистка при размонтировании
    return () => {
      socket.disconnect();
    };
  }, [currentGroup, dispatch, user.nickname]);

  const sendMessage = () => {
    if (input.trim() && currentGroup) {
      const msg: MessageType = {
        user: user.nickname,
        text: input,
        timestamp: new Date().toISOString(),
        group: currentGroup
      };
      socket.emit('message', msg);
      setInput('');
    }
  };

  const createGroup = () => {
    const groupName = prompt('Enter new group name:');
    if (groupName && groupName.trim()) {
      socket.emit('createGroup', groupName.trim());
    }
  };

  const joinGroup = (group: string) => {
    setCurrentGroup(group);
    setMessages([]);
    socket.emit('joinGroup', group);
  };

  const getCookie = (name: string) => {
    if (typeof window === 'undefined') return '';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  };

  return (
    <ChatContainer>
      <Sidebar>
        <UserProfile />
        <ActiveGroups>
          <h3>Groups</h3>
          {groups.map((group, idx) => (
            <Group key={idx} onClick={() => joinGroup(group)}>
              {group}
            </Group>
          ))}
        </ActiveGroups>
        <button onClick={createGroup} style={{ marginTop: '10px', padding: '10px', background: '#0f0', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Create Group
        </button>
        {user.role === 'moderator' || user.role === 'creator' ? <AdminPanel /> : null}
      </Sidebar>
      <MainChat>
        <MessagesContainer>
          {messages.map((msg, idx) => (
            <Message key={idx} isOwn={msg.user === user.nickname}>
              <strong>{msg.user}</strong>: {msg.text}
              {msg.fileUrl && (
                <div>
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                    📎 {msg.fileName}
                  </a>
                </div>
              )}
              <br />
              <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
            </Message>
          ))}
        </MessagesContainer>
        <FileUploader currentGroup={currentGroup} />
        <InputContainer>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            disabled={!currentGroup}
          />
          <SendButton onClick={sendMessage} disabled={!currentGroup}>
            Send
          </SendButton>
        </InputContainer>
      </MainChat>
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#0f0',
          color: '#000',
          padding: '15px 20px',
          borderRadius: '4px',
          boxShadow: '0 0 10px #0f0',
          animation: `${fadeIn} 0.5s ease-in-out`
        }}>
          {notification}
        </div>
      )}
    </ChatContainer>
  );
};

export default Chat;
