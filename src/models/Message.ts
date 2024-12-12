// src/models/Message.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  user: string;
  text: string;
  group: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
}

const MessageSchema: Schema = new Schema({
  user: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  group: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  }
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
