// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  nickname: string;
  password: string;
  role: 'user' | 'on' | 'dev' | 'moderator' | 'creator' | 'banned';
  messagesCount: number;
  nicknameColor?: string;
  isMuted?: boolean;
  mutedUntil?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  nickname: {
    type: String,
    required: true,
    unique: true,
    maxlength: 16
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 24
  },
  role: {
    type: String,
    enum: ['user', 'on', 'dev', 'moderator', 'creator', 'banned'],
    default: 'user'
  },
  messagesCount: {
    type: Number,
    default: 0
  },
  nicknameColor: {
    type: String,
    default: '#0f0'
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  mutedUntil: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
