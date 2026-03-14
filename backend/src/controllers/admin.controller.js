import Program from '../models/Program.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

export async function createProgram(req, res) {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		
		const { name, code } = req.body || {};
		if (!name || typeof name !== 'string' || !code || typeof code !== 'string') {
			return res.status(400).json({ message: 'Invalid input: name and code are required strings' });
		}

		const normalizedCode = code.trim().toUpperCase();
		const exists = await Program.findOne({ code: normalizedCode });
		
		if (exists) return res.status(409).json({ message: 'Program code already exists' });
		const program = await Program.create({ name: name.trim(), code: normalizedCode });
		return res.status(201).json({ program });
	} 
	catch (err) {
		return res.status(400).json({ message: err.message || 'Failed to create program' });
	}
}

export async function createCourse(req, res) {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		const {
			code,
			title,
			description = '',
			program: programInput,
			semester,
			credits = 3,
			capacity = 60,
			timeslots,
			prerequisites,
			courseType
		} = req.body || {};

		if (!code || typeof code !== 'string') return res.status(400).json({ message: 'Invalid input: code is required (string)' });
		if (!title || typeof title !== 'string') return res.status(400).json({ message: 'Invalid input: title is required (string)' });
		if (!programInput || typeof programInput !== 'string') return res.status(400).json({ message: 'Invalid input: program is required (string id or code)' });
		if (semester === undefined || semester === null || Number.isNaN(Number(semester))) {
			return res.status(400).json({ message: 'Invalid input: semester is required (number)' });
		}
		if (!courseType || !['FC','CC','EC','LAB','UC'].includes(String(courseType).toUpperCase())) {
			return res.status(400).json({ message: 'Invalid input: courseType must be one of FC, CC, EC, LAB, UC' });
		}
		if (timeslots && !Array.isArray(timeslots)) return res.status(400).json({ message: 'timeslots must be an array of strings' });
		if (prerequisites && !Array.isArray(prerequisites)) return res.status(400).json({ message: 'prerequisites must be an array' });

		const codeUpper = code.trim().toUpperCase();
		const existingCourse = await Course.findOne({ code: codeUpper });
		if (existingCourse) return res.status(409).json({ message: 'Course code already exists' });

		let programDoc = null;
		if (/^[0-9a-fA-F]{24}$/.test(programInput)) {
			programDoc = await Program.findById(programInput);
		}
		if (!programDoc) {
			programDoc = await Program.findOne({ code: programInput.trim().toUpperCase() });
		}
		if (!programDoc) return res.status(400).json({ message: 'Invalid program (not found by id or code)' });

		if (programDoc.semesters && (Number(semester) < 1 || Number(semester) > Number(programDoc.semesters))) {
			return res.status(400).json({ message: 'Semester is out of range for the selected program' });
		}

		const course = await Course.create({
			code: codeUpper,
			title: title.trim(),
			description: typeof description === 'string' ? description.trim() : '',
			program: programDoc._id,
			semester: Number(semester),
			credits: Number(credits),
			capacity: Number(capacity),
			timeslots,
			prerequisites,
			courseType: String(courseType).toUpperCase(),
			isElective: String(courseType).toUpperCase() === 'EC',
			active: true
		});
		return res.status(201).json({ course });
	} catch (err) {
		return res.status(400).json({ message: err.message || 'Failed to create course' });
	}
}

export async function createUser(req, res) {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		const { name, email, password, confirmPassword, role, programId, semester } = req.body || {};
		
		if (!name || typeof name !== 'string') return res.status(400).json({ message: 'Name is required' });
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailRegex.test(email)) return res.status(400).json({ message: 'Valid email is required' });
		if (!role || !['staff', 'admin'].includes(role)) {
			return res.status(400).json({ message: 'Role must be staff or admin' });
		}
		const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
		if (!password || !pwdRegex.test(password)) {
			return res.status(400).json({ message: 'Password must be 8+ chars with upper, lower, and digit' });
		}
		if (confirmPassword !== undefined && password !== confirmPassword) {
			return res.status(400).json({ message: 'Passwords do not match' });
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
		const user = await User.create({
			name: name.trim(),
			email: email.toLowerCase().trim(),
			passwordHash,
			role,
			program: program ? program._id : undefined,
			semester: sem
		});
		
		return res.status(201).json({
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				program: user.program,
				semester: user.semester
			}
		});
	} catch (err) {
		return res.status(400).json({ message: err.message || 'Failed to create user' });
	}
}


