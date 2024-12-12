// src/pages/api/socket.ts
import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../utils/db';
import Message, { IMessage } from '../../models/Message';
import Group, { IGroup } from '../../models/Group';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const config = {
  api: {
    bodyParser: false
  }
};

interface ExtendedNextApiRequest extends NextApiRequest {
  socket: any;
}

const SocketHandler = async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  await dbConnect();

  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*', // Настройте по необходимости
      methods: ['GET', 'POST']
    }
  });
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log('New client connected');

    // Обработка авторизации пользователя
    socket.on('authenticate', async (token: string) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: string };
        socket.data.userId = decoded.userId;
        socket.data.role = decoded.role;
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('unauthorized', 'Invalid token');
        socket.disconnect();
      }
    });

    // Получение списка групп
    socket.on('getGroups', async () => {
      const groups: IGroup[] = await Group.find({});
      const groupNames = groups.map((group) => group.name);
      socket.emit('groups', groupNames);
    });

    // Создание новой группы
    socket.on('createGroup', async (groupName: string) => {
      const existingGroup = await Group.findOne({ name: groupName });
      if (!existingGroup) {
        const group = await Group.create({ name: groupName, members: [] });
        io.emit('groups', [groupName]);
      }
    });

    // Присоединение к группе
    socket.on('joinGroup', async (groupName: string) => {
      if (!socket.data.userId) {
        socket.emit('unauthorized', 'Please authenticate first');
        return;
      }

      const group = await Group.findOne({ name: groupName });
      if (group) {
        socket.join(groupName);
        if (!group.members.includes(socket.data.userId)) {
          group.members.push(socket.data.userId);
          await group.save();
        }

        // Отправка прошлых сообщений
        const messages: IMessage[] = await Message.find({ group: groupName }).sort({ timestamp: 1 });
        socket.emit('previousMessages', messages);
      }
    });

    // Обработка сообщений
    socket.on('message', async (msg: { user: string; text: string; group: string }) => {
      if (!socket.data.userId) {
        socket.emit('unauthorized', 'Please authenticate first');
        return;
      }

      const dbUser = await User.findById(socket.data.userId);

      if (dbUser?.isMuted) {
        if (dbUser.mutedUntil && dbUser.mutedUntil > new Date()) {
          socket.emit('muted', 'You are muted and cannot send messages.');
          return;
        } else {
          dbUser.isMuted = false;
          dbUser.mutedUntil = undefined;
          await dbUser.save();
        }
      }

      const message: IMessage = await Message.create({
        user: msg.user,
        text: msg.text,
        group: msg.group
      });

      io.to(msg.group).emit('message', {
        user: message.user,
        text: message.text,
        timestamp: message.timestamp
      });

      // Обновление счётчика сообщений пользователя
      const updatedUser = await User.findByIdAndUpdate(
        socket.data.userId,
        { $inc: { messagesCount: 1 } },
        { new: true }
      );

      // Проверка и повышение роли
      if (updatedUser && updatedUser.messagesCount >= 100000 && updatedUser.role === 'user') {
        updatedUser.role = 'on';
        await updatedUser.save();
        io.emit('roleUpdated', { user: updatedUser.nickname, newRole: 'on' });
        // Отправка уведомления пользователю
        io.to(socket.id).emit('notification', 'Congratulations! You have been promoted to "on" role.');
      }
    });

    // Обработка событий файлов
    socket.on('file', async (msg: { fileName: string; fileUrl: string; group: string }) => {
      if (!socket.data.userId) {
        socket.emit('unauthorized', 'Please authenticate first');
        return;
      }

      io.to(msg.group).emit('file', {
        user: socket.data.userId,
        fileName: msg.fileName,
        fileUrl: msg.fileUrl,
        timestamp: new Date().toISOString()
      });
    });

    // Обработка отключения клиента
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  res.end();
};

export default SocketHandler;
