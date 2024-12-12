// src/utils/rateLimit.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const rateLimit = (limit: number, windowMs: number) => {
  const ipMap = new Map<string, { count: number; lastRequest: number }>();

  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    const currentTime = Date.now();
    const record = ipMap.get(ip as string) || { count: 0, lastRequest: currentTime };

    if (currentTime - record.lastRequest > windowMs) {
      record.count = 1;
      record.lastRequest = currentTime;
    } else {
      record.count += 1;
    }

    ipMap.set(ip as string, record);

    if (record.count > limit) {
      res.status(429).json({ message: 'Too many requests, please try again later.' });
    } else {
      next();
    }
  };
};

export default rateLimit;
