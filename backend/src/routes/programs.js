import express from 'express';
import Program from '../models/Program.js';

const router = express.Router();

// Public list of programs for registration dropdowns
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find({}, { name: 1, code: 1, semesters: 1, degree: 1 }).sort({ name: 1 });
    res.json({ programs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch programs' });
  }
});

export default router;


