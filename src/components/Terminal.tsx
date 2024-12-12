// src/components/Terminal.tsx
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

interface TerminalProps {
  text: string;
  onComplete?: () => void;
}

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

const TerminalContainer = styled.pre`
  background: #000;
  color: #0f0;
  padding: 20px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 24px;
  border-radius: 8px;
  position: relative;
  width: 80%;
  max-width: 800px;
  min-height: 200px;
  overflow: hidden;
  box-shadow: 0 0 10px #0f0;
`;

const Cursor = styled.span`
  display: inline-block;
  width: 10px;
  background-color: #0f0;
  animation: ${blink} 1s step-start infinite;
  position: absolute;
  bottom: 20px;
  right: 20px;
`;

const Terminal: React.FC<TerminalProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, text, onComplete]);

  return (
    <TerminalContainer>
      {displayedText}
      {currentIndex < text.length && <Cursor />}
    </TerminalContainer>
  );
};

export default Terminal;
