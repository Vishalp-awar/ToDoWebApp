import { Router } from 'express';
import mongoose from 'mongoose';
import Todo from '../models/todo.js';

const router = Router();
const validStatuses = ['pending', 'working', 'done'];

router.get('/', async (_request, response, next) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    response.json(todos);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const todo = await Todo.create({
      title: request.body.title,
      description: request.body.description
    });
    response.status(201).json(todo);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (request, response, next) => {
  try {
    const { id } = request.params;
    const { status } = request.body;

    if (!mongoose.isValidObjectId(id)) {
      return response.status(400).json({ message: 'Invalid task id.' });
    }
    if (!validStatuses.includes(status)) {
      return response.status(400).json({ message: 'Status must be pending, working, or done.' });
    }

    const todo = await Todo.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!todo) {
      return response.status(404).json({ message: 'Task not found.' });
    }
    return response.json(todo);
  } catch (error) {
    return next(error);
  }
});

export default router;
