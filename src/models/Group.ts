// src/models/Group.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  members: string[];
}

const GroupSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  members: [{
    type: String
  }]
});

export default mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
