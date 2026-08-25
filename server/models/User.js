import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Your name is required.'], trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
