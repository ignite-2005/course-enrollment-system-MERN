import express from 'express';
import Program from '../models/Program.js';
import { requireAuth } from '../middleware/auth.js';
import { createProgram, createCourse, createUser } from '../controllers/admin.controller.js';

const router = express.Router();

router.use(requireAuth, (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
});

router.get('/programs', async (req, res) => {
  const programs = await Program.find().sort({ name: 1 });
  res.json({ programs });
});

router.post('/programs', createProgram);

router.post('/courses', createCourse);

router.post('/users', createUser);

export default router;


