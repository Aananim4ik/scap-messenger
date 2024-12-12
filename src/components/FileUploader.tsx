// src/components/FileUploader.tsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';
import { FaUpload, FaPaperclip } from 'react-icons/fa';
import { Socket } from 'socket.io-client';

const slideDown = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const UploaderContainer = styled.div`
  padding: 10px 20px;
  background: #111;
  display: flex;
  align-items: center;
  position: relative;
  animation: ${slideDown} 0.5s forwards;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.label`
  padding: 10px 20px;
  background: #0f0;
  color: #000;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  transition: background 0.3s;

  &:hover {
    background: #00ff00;
  }

  svg {
    margin-right: 5px;
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
  display: flex;
  align-items: center;
  transition: background 0.3s;

  &:hover {
    background: #00ff00;
  }

  svg {
    margin-right: 5px;
  }
`;

const FileName = styled.span`
  margin-left: 10px;
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

const Message = styled.p`
  color: #f00;
  font-size: 14px;
  margin-top: 5px;
`;

interface FileUploaderProps {
  currentGroup: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ currentGroup }) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !currentGroup) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        setMessage('File uploaded successfully!');
        // Отправка ссылки на файл в чат
        // Здесь предполагается, что `socket` доступен глобально или передан через пропсы
        // Для простоты можно использовать event emitter или контекст
        // В этом примере пропущено
        // socket.emit('file', { fileName: file.name, fileUrl: `/uploads/${response.data.filePath}`, group: currentGroup });
        setFile(null);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setMessage('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <UploaderContainer>
      <FileInput type="file" id="file" onChange={handleFileChange} />
      <UploadButton htmlFor="file">
        <FaUpload /> Upload File
      </UploadButton>
      {file && <FileName>{file.name}</FileName>}
      {file && !uploading && (
        <SendButton onClick={handleUpload}>
          <FaPaperclip /> Send
        </SendButton>
      )}
      {uploading && (
        <ProgressBarContainer>
          <ProgressBar />
        </ProgressBarContainer>
      )}
      {message && <Message>{message}</Message>}
    </UploaderContainer>
  );
};

export default FileUploader;
