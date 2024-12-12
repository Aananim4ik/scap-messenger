// src/pages/register.tsx
import { useState } from 'react';
import Terminal from '../components/Terminal';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { useRouter } from 'next/router';

const Container = styled.div`
  height: 100vh;
  background: #121212;
  color: #0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  position: relative;
  overflow: hidden;
`;

const Input = styled.input`
  margin-top: 10px;
  padding: 10px;
  background: #000;
  color: #0f0;
  border: 1px solid #0f0;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  width: 300px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #00ff00;
  }
`;

const ProgressBarContainer = styled.div`
  width: 300px;
  background: #333;
  border: 1px solid #0f0;
  border-radius: 4px;
  margin-top: 10px;
  overflow: hidden;
`;

const fill = keyframes`
  from { width: 0%; }
  to { width: 100%; }
`;

const ProgressBar = styled.div`
  height: 20px;
  background: #0f0;
  animation: ${fill} 2s forwards;
`;

const SuccessMessage = styled.div`
  margin-top: 20px;
  color: #0f0;
  font-size: 18px;
  animation: fadeIn 1s ease-in-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ErrorMessage = styled.div`
  margin-top: 10px;
  color: red;
  font-size: 14px;
`;

const Register: React.FC = () => {
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNickname = () => {
    if (nickname.length === 0 || nickname.length > 16) {
      setError('Nickname must be between 1 and 16 characters.');
      return;
    }
    setError('');
    setStage(1);
  };

  const handlePassword = () => {
    if (password.length < 8 || password.length > 24) {
      setError('Password must be between 8 and 24 characters.');
      return;
    }
    setError('');
    setStage(2);
  };

  const handleConfirmPassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/register', { nickname, password });
      if (response.status === 201) {
        setStage(3);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {stage === 0 && (
        <>
          <Terminal text="Enter your nickname:" onComplete={() => {}} />
          <Input
            type="text"
            maxLength={16}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onBlur={handleNickname}
            placeholder="Nickname"
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
      )}
      {stage === 1 && (
        <>
          <Terminal text="Enter your password:" onComplete={() => {}} />
          <Input
            type="password"
            minLength={8}
            maxLength={24}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handlePassword}
            placeholder="Password"
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
      )}
      {stage === 2 && (
        <>
          <Terminal text="Confirm your password:" onComplete={() => {}} />
          <Input
            type="password"
            minLength={8}
            maxLength={24}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={handleConfirmPassword}
            placeholder="Confirm Password"
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {loading && (
            <ProgressBarContainer>
              <ProgressBar />
            </ProgressBarContainer>
          )}
        </>
      )}
      {stage === 3 && (
        <SuccessMessage>Registration successful! Redirecting...</SuccessMessage>
      )}
    </Container>
  );
};

export default Register;
