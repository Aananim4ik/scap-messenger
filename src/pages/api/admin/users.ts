// src/pages/api/admin/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User, { IUser } from '../../../models/User';
import { authenticate } from '../../../utils/middleware';

interface Data {
  users: IUser[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Data | { message: string }> ) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { role } = (req as any).user;

  if (role !== 'moderator' && role !== 'creator') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await dbConnect();

    const users: IUser[] = await User.find({ role: { $ne: 'creator' } }).select('-password');
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default authenticate(handler);
