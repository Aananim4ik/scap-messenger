// src/pages/api/user/addPrefix.ts
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

  const { prefix } = req.body;

  if (!prefix || prefix.length > 5) {
    return res.status(400).json({ message: 'Invalid prefix' });
  }

  const { userId, role } = (req as any).user;

  if (role !== 'dev') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await dbConnect();

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.nickname = `${prefix}${user.nickname}`;
    await user.save();

    return res.status(200).json({ message: 'Prefix added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default authenticate(handler);
