import express from 'express';
import User from '../models/User.js';
import Program from '../models/Program.js';
import Enrollment from '../models/Enrollment.js';
import { signJwt } from '../utils/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, programId, semester } = req.body;
    console.log('[REGISTER] Received:', { name, email, role, programId, semester });
    
    if (!name || typeof name !== 'string') return res.status(400).json({ message: 'Name is required' });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) return res.status(400).json({ message: 'Valid email is required' });
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password || !pwdRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be 8+ chars with upper, lower, and digit' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (role && role !== 'student') {
      return res.status(403).json({ message: 'Only student self-signup allowed' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const program = programId ? await Program.findById(programId) : null;
    if (programId && !program) return res.status(400).json({ message: 'Invalid program' });
    let sem = undefined;
    if (program) {
      const s = Number(semester);
      if (!Number.isInteger(s) || s < 1 || s > program.semesters) {
        return res.status(400).json({ message: `Semester must be between 1 and ${program.semesters}` });
      }
      sem = s;
    }
    const passwordHash = await User.hashPassword(password);
    console.log('[REGISTER] Creating user:', { name, email, hasProgram: !!program, semester: sem });
    const user = await User.create({
      name,
      email,
      passwordHash,
      program: program ? program._id : undefined,
      semester: sem
    });
    console.log('[REGISTER] User created:', { id: user._id, email: user.email });
    // Populate program for response
    await user.populate('program');
    const token = signJwt({ sub: user._id.toString(), role: user.role });
    console.log('[REGISTER] Registration successful for:', email);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, program: user.program, semester: user.semester }
    });
  } catch (err) {
    console.error('[REGISTER] Error:', err.message, err);
    res.status(400).json({ message: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('program');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signJwt({ sub: user._id.toString(), role: user.role });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, program: user.program, semester: user.semester }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const u = await User.findById(req.user._id).populate('program');
  res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role, program: u.program, semester: u.semester } });
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const { programId, semester } = req.body;
    const u = await User.findById(req.user._id);
    
    if (programId) {
      const program = await Program.findById(programId);
      if (!program) return res.status(400).json({ message: 'Invalid program' });
      
      // Validate semester for the program
      const sem = Number(semester);
      if (!Number.isInteger(sem) || sem < 1 || sem > program.semesters) {
        return res.status(400).json({ message: `Semester must be between 1 and ${program.semesters}` });
      }
      
      // Check if program or semester is changing
      const programChanged = String(u.program) !== String(program._id);
      const semesterChanged = u.semester !== sem;
      
      // If either program or semester changed, delete all enrollments
      if (programChanged || semesterChanged) {
        const deletedEnrollments = await Enrollment.deleteMany({ user: u._id });
        console.log(`Deleted ${deletedEnrollments.deletedCount} enrollments for user ${u._id}`);
      }
      
      u.program = program._id;
      u.semester = sem;
    }
    
    await u.save();
    await u.populate('program');
    
    res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role, program: u.program, semester: u.semester } });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update profile' });
  }
});

export default router;


