// src/pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../utils/db';
import User, { IUser } from '../../../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import rateLimit from '../../../utils/rateLimit';

interface Data {
  message: string;
}

const limiter = rateLimit(5, 60000); // 5 запросов в минуту

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  await new Promise<void>((resolve, reject) => {
    limiter(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve();
    });
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nickname, password } = req.body;

  if (!nickname || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    await dbConnect();

    const user: IUser | null = await User.findOne({ nickname });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600,
        sameSite: 'strict',
        path: '/'
      })
    );

    return res.status(200).json({ message: 'Logged in' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export default handler;
