import { Router } from 'express';
import mongoose from 'mongoose';
import Todo from '../models/Todo.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const validStatuses = ['pending', 'working', 'done'];

router.use(requireAuth);

router.get('/', async (_request, response, next) => {
  try {
    const todos = await Todo.find().populate('createdBy assignedTo', 'name email').sort({ createdAt: -1 });
    response.json(todos);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const assignedTo = request.body.assignedTo || request.user.id;
    if (!mongoose.isValidObjectId(assignedTo) || !await User.exists({ _id: assignedTo })) return response.status(400).json({ message: 'Select a registered user to assign this task.' });
    const todo = await Todo.create({
      title: request.body.title,
      description: request.body.description,
      createdBy: request.user.id,
      assignedTo
    });
    await todo.populate('createdBy assignedTo', 'name email');
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

    const todo = await Todo.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).populate('createdBy assignedTo', 'name email');
    if (!todo) {
      return response.status(404).json({ message: 'Task not found.' });
    }
    return response.json(todo);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/assignee', async (request, response, next) => {
  try {
    const { id } = request.params;
    const { assignedTo } = request.body;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(assignedTo)) return response.status(400).json({ message: 'Invalid task or user id.' });
    if (!await User.exists({ _id: assignedTo })) return response.status(400).json({ message: 'That user is not registered.' });
    const todo = await Todo.findByIdAndUpdate(id, { assignedTo }, { new: true, runValidators: true }).populate('createdBy assignedTo', 'name email');
    if (!todo) return response.status(404).json({ message: 'Task not found.' });
    return response.json(todo);
  } catch (error) { return next(error); }
});

export default router;
