// src/pages/index.tsx
import { useRouter } from 'next/router';
import Terminal from '../components/Terminal';
import styled, { keyframes } from 'styled-components';
import { useEffect } from 'react';

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #121212;
  position: relative;
  overflow: hidden;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const AnimatedBackground = styled.div`
  position: absolute;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, #0f0, #00f, #f0f);
  animation: ${fadeIn} 3s ease-in-out infinite alternate;
  top: -50%;
  left: -50%;
`;

const Home: React.FC = () => {
  const router = useRouter();

  const handleComplete = () => {
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  return (
    <Container>
      <AnimatedBackground />
      <Terminal text="SCAP" onComplete={handleComplete} />
    </Container>
  );
};

export default Home;
