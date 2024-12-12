// src/pages/api/moderator/mute.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User, { IUser } from '../../../models/User';
import { authenticate } from '../../../utils/middleware';

interface Data {
  message: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data | { message: string }> ) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { targetUserId, duration } = req.body; // duration in minutes

  if (!targetUserId || !duration) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const { role } = (req as any).user;

  if (role !== 'moderator' && role !== 'creator') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await dbConnect();

    const user: IUser | null = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Реализация мута: добавление временного флага
    user.isMuted = true;
    user.mutedUntil = new Date(Date.now() + duration * 60000); // текущие время + duration минут
    await user.save();

    return res.status(200).json({ message: 'User muted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default authenticate(handler);
