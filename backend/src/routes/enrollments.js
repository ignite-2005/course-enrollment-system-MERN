import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id, status: 'enrolled' })
    .populate({ path: 'student', select: 'name email' })
    .populate({ path: 'course', populate: { path: 'program' } })
    .sort({ createdAt: -1 });
  res.json({ enrollments });
});

// Admin/Staff endpoint to view all enrollments with populated data (Using this i returned all enrollments for admin and staff access)
router.get('/all', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { status, courseId, studentId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (courseId) query.course = courseId;
    if (studentId) query.student = studentId;
    
    const enrollments = await Enrollment.find(query)
      .populate({ path: 'student', select: 'name email role program semester' })
      .populate({ path: 'course', populate: { path: 'program' } })
      .sort({ createdAt: -1 });
    res.json({ enrollments });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch enrollments' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId).populate('program');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.active) return res.status(400).json({ message: 'Course not active' });

    const userProgramId = req.user?.program ? (req.user.program._id?.toString?.() || req.user.program.toString()) : null;
    const courseProgramId = course?.program ? (course.program._id?.toString?.() || course.program.toString()) : null;
    if (userProgramId && courseProgramId && userProgramId !== courseProgramId) {
      return res.status(400).json({ message: 'Course not in your program' });
    }
    if (req.user.semester && course.semester && Number(req.user.semester) !== Number(course.semester)) {
      return res.status(400).json({ message: 'Course not in your semester' });
    }

    //  elective per semester
    const EC_LIMIT = Number(process.env.EC_LIMIT_PER_SEM || 2);
    if (String(course.courseType).toUpperCase() === 'EC' && EC_LIMIT > 0) {
      const myEnrollments = await Enrollment.find({ student: req.user._id, status: 'enrolled' })
        .populate('course');
      const ecInSem = myEnrollments.filter((e) => e.course && e.course.semester === course.semester && String(e.course.courseType).toUpperCase() === 'EC').length;
      if (ecInSem >= EC_LIMIT) {
        return res.status(409).json({ message: `Elective limit reached for semester ${course.semester}. Max ${EC_LIMIT}.` });
      }
    }
    const count = await Enrollment.countDocuments({ course: course._id, status: 'enrolled' });
    if (count >= course.capacity) return res.status(400).json({ message: 'Course is full' });
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user._id, course: course._id },
      { status: 'enrolled' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .populate({ path: 'student', select: 'name email' })
      .populate({ path: 'course', populate: { path: 'program' } });
    res.status(201).json({ enrollment });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Enrollment failed' });
  }
});

router.post('/:id/drop', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: id, student: req.user._id },
      { status: 'dropped' },
      { new: true }
    )
      .populate({ path: 'student', select: 'name email' })
      .populate({ path: 'course', populate: { path: 'program' } });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    res.json({ enrollment });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Drop failed' });
  }
});

export default router;


