// src/pages/chat.tsx
import React from 'react';
import Chat from '../components/Chat';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Container = styled.div`
  padding: 20px;
  background: #121212;
  height: 100vh;
`;

const ChatPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user.nickname) {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <Container>
      <Chat />
    </Container>
  );
};

export default ChatPage;
