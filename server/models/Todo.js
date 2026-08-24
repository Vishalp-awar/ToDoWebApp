import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A task title is required.'],
      trim: true,
      maxlength: [120, 'A task title can be at most 120 characters.']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'A description can be at most 500 characters.'],
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'working', 'done'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Todo', todoSchema);
