// src/pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import Terminal from '../components/Terminal';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

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

const Skull = styled.div`
  font-size: 50px;
  animation: skullAnimation 2s forwards;
  opacity: 0;

  @keyframes skullAnimation {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); }
  }
`;

const ButtonsContainer = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 20px;
  opacity: 0;
  animation: buttonsFadeIn 1s 2s forwards;

  @keyframes buttonsFadeIn {
    to { opacity: 1; }
  }
`;

const AuthButton = styled.button<{ color: string }>`
  background: ${(props) => props.color};
  color: #fff;
  border: none;
  padding: 15px 30px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 18px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
  }
`;

const Login: React.FC = () => {
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuthorization = async () => {
    try {
      const res = await axios.post('/api/login', { nickname, password });
      if (res.status === 200) {
        router.push('/chat');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authorization failed.');
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <Container>
      <Terminal
        text={`\n\n     ☠️☠️☠️\n     ☠️☠️☠️\n     ☠️☠️☠️\n\n  authorization   register`}
        onComplete={() => setShowButtons(true)}
      />
      {showButtons && (
        <ButtonsContainer>
          <AuthButton color="green" onClick={handleAuthorization}>
            Authorization
          </AuthButton>
          <AuthButton color="red" onClick={handleRegister}>
            Register
          </AuthButton>
        </ButtonsContainer>
      )}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </Container>
  );
};

export default Login;
