// src/components/UserProfile.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { FaUserCircle } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const ProfileContainer = styled.div`
  padding: 20px;
  background: #111;
  border-radius: 8px;
  display: flex;
  align-items: center;
  animation: fadeIn 0.5s forwards;
  box-shadow: 0 0 10px #0f0;
  margin-top: 20px;
`;

const Avatar = styled.div`
  font-size: 50px;
  margin-right: 20px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const Nickname = styled.span<{ color?: string }>`
  font-size: 24px;
  color: ${(props) => props.color || '#0f0'};
`;

const Role = styled.span`
  font-size: 16px;
  color: #888;
`;

const UserProfile: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);

  return (
    <ProfileContainer>
      <Avatar><FaUserCircle /></Avatar>
      <Info>
        <Nickname color={user.nicknameColor}>{user.nickname}</Nickname>
        <Role>Role: {user.role.toUpperCase()}</Role>
      </Info>
    </ProfileContainer>
  );
};

export default UserProfile;
