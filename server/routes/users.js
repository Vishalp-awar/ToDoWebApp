import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', requireAuth, async (_request, response, next) => {
  try { response.json(await User.find().select('name email').sort({ name: 1 })); }
  catch (error) { next(error); }
});
export default router;
