import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });
const createToken = (user) => jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (request, response, next) => {
  try {
    const { name, email, password } = request.body;
    if (!name?.trim() || !emailPattern.test(email || '') || !password || password.length < 6) return response.status(400).json({ message: 'Enter a name, valid email, and a password of at least 6 characters.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return response.status(409).json({ message: 'An account with that email already exists. Please log in.' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) });
    return response.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { return next(error); }
});

router.post('/login', async (request, response, next) => {
  try {
    const email = request.body.email?.trim().toLowerCase();
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(request.body.password || '', user.passwordHash))) return response.status(401).json({ message: 'No matching user was found. Check your email and password.' });
    return response.json({ token: createToken(user), user: publicUser(user) });
  } catch (error) { return next(error); }
});

router.get('/me', requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.user.id);
    if (!user) return response.status(401).json({ message: 'User account no longer exists.' });
    return response.json(publicUser(user));
  } catch (error) { return next(error); }
});

export default router;
