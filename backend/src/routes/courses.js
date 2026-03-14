import express from 'express';
import Course from '../models/Course.js';
import Program from '../models/Program.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Statistics endpoint - public for login page display
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments({ active: true });
    const totalPrograms = await Program.countDocuments();
    res.json({ 
      totalStudents, 
      totalCourses, 
      totalPrograms 
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Public courses list endpoint for login page
router.get('/public', async (req, res) => {
  try {
    const courses = await Course.find({ active: true })
      .populate('program', 'name code')
      .select('code title semester courseType program')
      .sort({ semester: 1, code: 1 })
      .limit(100); // Limit to prevent too much data
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const { programId, semester, active } = req.query;
    const query = {};
    if (programId) query.program = programId;
    if (semester) query.semester = Number(semester);
    if (active !== undefined) query.active = active === 'true';
    const courses = await Course.find(query).populate('program').sort({ semester: 1, code: 1 });
    // attach enrolled counts and remaining capacity
    const counts = await Promise.all(
      courses.map((c) => Enrollment.countDocuments({ course: c._id, status: 'enrolled' }))
    );
    const data = courses.map((c, idx) => ({
      ...c.toObject(),
      enrolledCount: counts[idx],
      capacityRemaining: Math.max(0, (c.capacity || 0) - counts[idx])
    }));
    res.json({ courses: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

router.post('/', requireAuth, requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const { code, title, programId, semester, capacity, credits, description, active } = req.body;
    const program = await Program.findById(programId);
    if (!program) return res.status(400).json({ message: 'Invalid program' });
    if (semester < 1 || semester > program.semesters) return res.status(400).json({ message: 'Invalid semester for program' });
    const course = await Course.create({
      code,
      title,
      program: program._id,
      semester,
      capacity,
      credits,
      description,
      active
    });
    res.status(201).json({ course });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create course' });
  }
});

router.put('/:id', requireAuth, requireRole(['staff', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.programId) updates.program = updates.programId;
    delete updates.programId;
    const course = await Course.findByIdAndUpdate(id, updates, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update course' });
  }
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to delete course' });
  }
});

export default router;


