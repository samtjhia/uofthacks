import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomIcon extends Document {
  label: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
}

const CustomIconSchema: Schema = new Schema({
  label: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in development HMR
export default mongoose.models.CustomIcon || mongoose.model<ICustomIcon>('CustomIcon', CustomIconSchema);
