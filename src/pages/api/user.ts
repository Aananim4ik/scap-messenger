// src/pages/api/user.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import dbConnect from '../../utils/db';
import User, { IUser } from '../../models/User';

interface Data {
  nickname: string;
  role: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | { message: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: string };

    await dbConnect();

    const user: IUser | null = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json({ nickname: user.nickname, role: user.role });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
