import dotenv from 'dotenv';
import { connectToDatabase } from '../setup/db.js';
import Program from '../models/Program.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

dotenv.config();

async function main() {
  await connectToDatabase();
  console.log('Clearing existing data...');
  await Promise.all([
    Enrollment.deleteMany({}),
    Program.deleteMany({}),
    Course.deleteMany({}),
    User.deleteMany({})
  ]);
  console.log('Existing data cleared.');

  // Programs: 14 degrees 
  const programsSeed = [
    { name: 'Mechanical Engineering', code: 'ME', semesters: 8, degree: 'BTech' },
    { name: 'Computer Science & Engineering', code: 'CSE', semesters: 8, degree: 'BTech' },
    { name: 'Electrical & Electronics Engineering', code: 'EEE', semesters: 8, degree: 'BTech' },
    { name: 'Electronics & Communication Engineering', code: 'ECE', semesters: 8, degree: 'BTech' },
    { name: 'Civil Engineering', code: 'CE', semesters: 8, degree: 'BTech' },
    { name: 'Chemical Engineering', code: 'CHE', semesters: 8, degree: 'BTech' },
    { name: 'Biotechnology', code: 'BT', semesters: 8, degree: 'BTech' },
    { name: 'Artificial Intelligence', code: 'AI', semesters: 8, degree: 'BTech' },
    { name: 'Data Science', code: 'DS', semesters: 8, degree: 'BTech' },
    { name: 'M.Tech in AI & ML', code: 'MTAI', semesters: 4, degree: 'MTech' },
    { name: 'M.Tech in Cybersecurity', code: 'MTCS', semesters: 4, degree: 'MTech' },
    { name: 'B.Sc Mathematics', code: 'BSCM', semesters: 6, degree: 'BTech' },
    { name: 'B.Sc Physics', code: 'BSCP', semesters: 6, degree: 'BTech' },
    { name: 'MS Computer Science', code: 'MSCS', semesters: 4, degree: 'MS' }
  ];
  const createdPrograms = await Program.insertMany(programsSeed);
  const programByCode = Object.fromEntries(createdPrograms.map((p) => [p.code, p]));
  const me = programByCode.ME;
  const cse = programByCode.CSE;
  const ece = programByCode.ECE;

  // Helper to make course
  const mk = (p, { code, title, courseType, sem, credits, cap, desc, hasLab = false, isElective = false }) => ({
    code,
    title,
    courseType,
    description: desc || '',
    program: p._id,
    semester: sem,
    credits,
    capacity: cap,
    hasLab,
    isElective,
    status: 'Available',
    active: true
  });

  const data = [
    // CSE semester 1
    mk(cse, { code: 'UE25CS111A', title: 'Programming Fundamentals (Python)', courseType: 'FC', sem: 1, credits: 4, cap: 80, hasLab: true }),
    mk(cse, { code: 'UE25CS1L1', title: 'Programming Lab I', courseType: 'LAB', sem: 1, credits: 1, cap: 80 }),
    mk(cse, { code: 'UE25CS121', title: 'Engineering Physics', courseType: 'FC', sem: 1, credits: 3, cap: 120 }),
    mk(cse, { code: 'UE25MA101', title: 'Mathematics I', courseType: 'FC', sem: 1, credits: 4, cap: 120 }),

    // CSE semester 2
    mk(cse, { code: 'UE25CS112B', title: 'C Programming and Problem Solving', courseType: 'FC', sem: 2, credits: 4, cap: 90, hasLab: true }),
    mk(cse, { code: 'UE25CS2L1', title: 'C Programming Lab', courseType: 'LAB', sem: 2, credits: 1, cap: 90 }),
    mk(cse, { code: 'UE25CH101', title: 'Engineering Chemistry', courseType: 'FC', sem: 2, credits: 3, cap: 120 }),
    mk(cse, { code: 'UE25EC101', title: 'Basics of Electronics', courseType: 'FC', sem: 2, credits: 3, cap: 120 }),
    mk(cse, { code: 'UE25HU102', title: 'Professional Ethics and Constitution', courseType: 'UC', sem: 2, credits: 2, cap: 200 }),
    mk(cse, { code: 'UE25MA102', title: 'Mathematics II', courseType: 'FC', sem: 2, credits: 4, cap: 120 }),

    // CSE semester 3 (with electives)
    mk(cse, { code: 'UE25CS231', title: 'Data Structures and Applications', courseType: 'CC', sem: 3, credits: 4, cap: 90, hasLab: true }),
    mk(cse, { code: 'UE25CS232', title: 'Digital Logic and Computer Design', courseType: 'CC', sem: 3, credits: 4, cap: 90 }),
    mk(cse, { code: 'UE25CS233', title: 'Automata Theory', courseType: 'CC', sem: 3, credits: 3, cap: 90 }),
    mk(cse, { code: 'UE25CS234', title: 'Web Technologies', courseType: 'CC', sem: 3, credits: 3, cap: 90, hasLab: true }),
    // Electives
    mk(cse, { code: 'UE25CS2E1', title: 'Introduction to Machine Learning', courseType: 'EC', sem: 3, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS2E2', title: 'Mobile App Development', courseType: 'EC', sem: 3, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS2E3', title: 'Data Visualization', courseType: 'EC', sem: 3, credits: 3, cap: 40, isElective: true }),

    // CSE semester 4 (with electives)
    mk(cse, { code: 'UE25CS241', title: 'Database Management Systems', courseType: 'CC', sem: 4, credits: 4, cap: 90, hasLab: true }),
    mk(cse, { code: 'UE25CS242', title: 'Computer Networks', courseType: 'CC', sem: 4, credits: 4, cap: 90, hasLab: true }),
    mk(cse, { code: 'UE25CS243', title: 'Operating Systems', courseType: 'CC', sem: 4, credits: 4, cap: 90, hasLab: true }),
    mk(cse, { code: 'UE25CS244', title: 'Design and Analysis of Algorithms', courseType: 'CC', sem: 4, credits: 4, cap: 90 }),
    mk(cse, { code: 'UE25CS4L1', title: 'Database Lab', courseType: 'LAB', sem: 4, credits: 1, cap: 90 }),
    mk(cse, { code: 'UE25CS4L2', title: 'Networks Lab', courseType: 'LAB', sem: 4, credits: 1, cap: 90 }),
    // Electives
    mk(cse, { code: 'UE25CS4E1', title: 'Cloud Computing Fundamentals', courseType: 'EC', sem: 4, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS4E2', title: 'Software Testing and Quality Assurance', courseType: 'EC', sem: 4, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS4E3', title: 'Computer Graphics', courseType: 'EC', sem: 4, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS4E4', title: 'Cryptography and Network Security', courseType: 'EC', sem: 4, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS4E5', title: 'Game Development', courseType: 'EC', sem: 4, credits: 3, cap: 40, isElective: true }),

    // CSE semester 5 (with electives)
    mk(cse, { code: 'UE25CS251', title: 'Software Engineering', courseType: 'CC', sem: 5, credits: 4, cap: 85, hasLab: true }),
    mk(cse, { code: 'UE25CS252', title: 'Compiler Design', courseType: 'CC', sem: 5, credits: 4, cap: 85 }),
    mk(cse, { code: 'UE25CS253', title: 'Computer Organization and Architecture', courseType: 'CC', sem: 5, credits: 4, cap: 85 }),
    mk(cse, { code: 'UE25CS254', title: 'Machine Learning', courseType: 'CC', sem: 5, credits: 4, cap: 85, hasLab: true }),
    mk(cse, { code: 'UE25CS5L1', title: 'Software Engineering Lab', courseType: 'LAB', sem: 5, credits: 1, cap: 85 }),
    mk(cse, { code: 'UE25CS5L2', title: 'Machine Learning Lab', courseType: 'LAB', sem: 5, credits: 1, cap: 85 }),
    // Electives
    mk(cse, { code: 'UE25CS5E1', title: 'Deep Learning', courseType: 'EC', sem: 5, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS5E2', title: 'Distributed Systems', courseType: 'EC', sem: 5, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS5E3', title: 'Natural Language Processing', courseType: 'EC', sem: 5, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS5E4', title: 'Blockchain Technology', courseType: 'EC', sem: 5, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS5E5', title: 'Big Data Analytics', courseType: 'EC', sem: 5, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS5E6', title: 'Internet of Things (IoT)', courseType: 'EC', sem: 5, credits: 3, cap: 40, isElective: true }),

    // CSE semester 6 (with electives)
    mk(cse, { code: 'UE25CS261', title: 'Artificial Intelligence', courseType: 'CC', sem: 6, credits: 4, cap: 80, hasLab: true }),
    mk(cse, { code: 'UE25CS262', title: 'Information Security', courseType: 'CC', sem: 6, credits: 3, cap: 80 }),
    mk(cse, { code: 'UE25CS263', title: 'Data Mining and Warehousing', courseType: 'CC', sem: 6, credits: 4, cap: 80, hasLab: true }),
    mk(cse, { code: 'UE25CS264', title: 'Web Services and Cloud Computing', courseType: 'CC', sem: 6, credits: 3, cap: 80, hasLab: true }),
    mk(cse, { code: 'UE25CS6L1', title: 'AI Lab', courseType: 'LAB', sem: 6, credits: 1, cap: 80 }),
    mk(cse, { code: 'UE25CS6L2', title: 'Data Mining Lab', courseType: 'LAB', sem: 6, credits: 1, cap: 80 }),
    // Electives
    mk(cse, { code: 'UE25CS6E1', title: 'Computer Vision', courseType: 'EC', sem: 6, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS6E2', title: 'Advanced Algorithms', courseType: 'EC', sem: 6, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS6E3', title: 'Parallel and Distributed Computing', courseType: 'EC', sem: 6, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS6E4', title: 'Reinforcement Learning', courseType: 'EC', sem: 6, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS6E5', title: 'Cybersecurity and Ethical Hacking', courseType: 'EC', sem: 6, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS6E6', title: 'Advanced Database Systems', courseType: 'EC', sem: 6, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS6E7', title: 'Mobile Computing', courseType: 'EC', sem: 6, credits: 3, cap: 40, isElective: true }),

    // CSE semester 7 (with electives)
    mk(cse, { code: 'UE25CS271', title: 'Advanced Computer Networks', courseType: 'CC', sem: 7, credits: 3, cap: 75 }),
    mk(cse, { code: 'UE25CS272', title: 'Software Project Management', courseType: 'CC', sem: 7, credits: 3, cap: 75 }),
    mk(cse, { code: 'UE25CS273', title: 'Advanced Machine Learning', courseType: 'CC', sem: 7, credits: 4, cap: 75, hasLab: true }),
    mk(cse, { code: 'UE25CS274', title: 'Capstone Project I', courseType: 'CC', sem: 7, credits: 3, cap: 75 }),
    mk(cse, { code: 'UE25CS7L1', title: 'Advanced ML Lab', courseType: 'LAB', sem: 7, credits: 1, cap: 75 }),
    // Electives
    mk(cse, { code: 'UE25CS7E1', title: 'Advanced Deep Learning', courseType: 'EC', sem: 7, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS7E2', title: 'Quantum Computing', courseType: 'EC', sem: 7, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS7E3', title: 'Edge Computing', courseType: 'EC', sem: 7, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS7E4', title: 'Advanced Web Development', courseType: 'EC', sem: 7, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS7E5', title: 'Robotics and Automation', courseType: 'EC', sem: 7, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS7E6', title: 'Advanced Cryptography', courseType: 'EC', sem: 7, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS7E7', title: 'DevOps and CI/CD', courseType: 'EC', sem: 7, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS7E8', title: 'Advanced Data Structures', courseType: 'EC', sem: 7, credits: 3, cap: 40, isElective: true }),

    // CSE semester 8 (with electives)
    mk(cse, { code: 'UE25CS281', title: 'Capstone Project II', courseType: 'CC', sem: 8, credits: 6, cap: 70 }),
    mk(cse, { code: 'UE25CS282', title: 'Industry Internship', courseType: 'CC', sem: 8, credits: 4, cap: 70 }),
    mk(cse, { code: 'UE25CS283', title: 'Professional Practice and Ethics', courseType: 'UC', sem: 8, credits: 2, cap: 200 }),
    // Electives
    mk(cse, { code: 'UE25CS8E1', title: 'Advanced AI and Neural Networks', courseType: 'EC', sem: 8, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS8E2', title: 'Cloud Architecture and Design', courseType: 'EC', sem: 8, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS8E3', title: 'Advanced Software Architecture', courseType: 'EC', sem: 8, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS8E4', title: 'Bioinformatics', courseType: 'EC', sem: 8, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS8E5', title: 'Advanced Cybersecurity', courseType: 'EC', sem: 8, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS8E6', title: 'Human-Computer Interaction', courseType: 'EC', sem: 8, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS8E7', title: 'Advanced Distributed Systems', courseType: 'EC', sem: 8, credits: 3, cap: 40, isElective: true }),
    mk(cse, { code: 'UE25CS8E8', title: 'Research Methodology', courseType: 'EC', sem: 8, credits: 3, cap: 40, isElective: true }),

    // ECE samples replacing IT
    mk(ece, { code: 'UE25EC111', title: 'Basic Electronics', courseType: 'FC', sem: 1, credits: 3, cap: 120 }),
    mk(ece, { code: 'UE25EC1L1', title: 'Electronics Lab I', courseType: 'LAB', sem: 1, credits: 1, cap: 120 }),
    mk(ece, { code: 'UE25EC121', title: 'Circuit Theory', courseType: 'FC', sem: 1, credits: 4, cap: 120 }),

    mk(ece, { code: 'UE25EC221', title: 'Digital Electronics', courseType: 'CC', sem: 2, credits: 4, cap: 100 }),
    mk(ece, { code: 'UE25EC2L1', title: 'Digital Electronics Lab', courseType: 'LAB', sem: 2, credits: 1, cap: 100 }),

    mk(ece, { code: 'UE25EC231', title: 'Signals & Systems', courseType: 'CC', sem: 3, credits: 3, cap: 90 }),
    mk(ece, { code: 'UE25EC2E1', title: 'IoT Fundamentals', courseType: 'EC', sem: 3, credits: 3, cap: 40, isElective: true }),
    mk(ece, { code: 'UE25EC2E2', title: 'Embedded Systems', courseType: 'EC', sem: 3, credits: 3, cap: 40, isElective: true }),

    // Mechanical Engineering program
    mk(me, { code: 'UE25ME111', title: 'Engineering Mechanics', courseType: 'FC', sem: 1, credits: 4, cap: 120 }),
  ];

  await Course.insertMany(data);

  // Required seed items: CSE with CS201 and CS202
  await Course.create([
    {
      code: 'CS201',
      title: 'Data Structures',
      description: 'Core data structures and complexity analysis.',
      program: cse._id,
      semester: 3,
      credits: 4,
      capacity: 100,
      courseType: 'CC',
      timeslots: ['Mon 10:00-11:30', 'Wed 10:00-11:30'],
      prerequisites: ['CS101'],
      active: true
    },
    {
      code: 'CS202',
      title: 'Algorithms',
      description: 'Algorithm design techniques and analysis.',
      program: cse._id,
      semester: 4,
      credits: 4,
      capacity: 100,
      courseType: 'CC',
      timeslots: ['Tue 09:00-10:30', 'Thu 09:00-10:30'],
      prerequisites: ['CS201'],
      active: true
    }
  ]);

  // Programmatic course generation for other programs (generate per-program, per-semester courses)
  const generatedCourses = [];
  for (const p of createdPrograms) {
    // Skiping CSE because i already detailed the handcrafted courses
    if (p.code === 'CSE') continue;
    const maxSem = Number(p.semesters) || 8;
    for (let sem = 1; sem <= maxSem; sem++) {
      
      // Creating 3 core courses per semester (where electives are not added)
      for (let i = 1; i <= 3; i++) {
        const code = `${p.code}${String(sem).padStart(2, '0')}0${i}`;
        const title = `${p.code} Core ${sem}.${i}`;
        const courseType = sem <= 2 ? 'FC' : 'CC';
        generatedCourses.push(mk(p, { code, title, courseType, sem, credits: 3 + (i % 2), cap: 80 }));
      }
      // Added 1 lab for odd semesters
      if (sem % 2 === 1) {
        const lcode = `${p.code}${String(sem).padStart(2, '0')}L1`;
        generatedCourses.push(mk(p, { code: lcode, title: `${p.code} Lab ${sem}`, courseType: 'LAB', sem, credits: 1, cap: 60, hasLab: true }));
      }
      // Added electives for semesters 3 and above as in first year no electives are present
      if (sem >= 3) {
        const e1 = `${p.code}${String(sem).padStart(2, '0')}E1`;
        const e2 = `${p.code}${String(sem).padStart(2, '0')}E2`;
        generatedCourses.push(mk(p, { code: e1, title: `${p.code} Elective A ${sem}`, courseType: 'EC', sem, credits: 3, cap: 40, isElective: true }));
        generatedCourses.push(mk(p, { code: e2, title: `${p.code} Elective B ${sem}`, courseType: 'EC', sem, credits: 3, cap: 40, isElective: true }));
      }
    }
  }

  if (generatedCourses.length > 0) {
    await Course.insertMany(generatedCourses);
    console.log(`Generated ${generatedCourses.length} program-specific courses.`);
  }

  const adminPassword = await User.hashPassword('admin123');
  const staffPassword = await User.hashPassword('staff123');
  const studentPassword = await User.hashPassword('student123');

  console.log('Creating users...');
  const users = await User.create([
    { name: 'Admin User', email: 'admin@example.com', passwordHash: adminPassword, role: 'admin' },
    { name: 'Staff User', email: 'staff@example.com', passwordHash: staffPassword, role: 'staff' },
    { name: 'Alice Student', email: 'alice@example.com', passwordHash: studentPassword, role: 'student', program: cse._id, semester: 1 },
    { name: 'Bob Student', email: 'bob@example.com', passwordHash: studentPassword, role: 'student', program: cse._id, semester: 4 },
    { name: 'Charlie Student', email: 'charlie@example.com', passwordHash: studentPassword, role: 'student', program: cse._id, semester: 5 }
  ]);
  console.log(`Created ${users.length} users.`);

  const alice = users.find(u => u.email === 'alice@example.com');
  const bob = users.find(u => u.email === 'bob@example.com');
  const charlie = users.find(u => u.email === 'charlie@example.com');

  // Ensured that Admin and Staff accounts exist 
  console.log('Ensuring Admin and Staff accounts exist (upsert)...');
  const adminPasswordHash = await User.hashPassword('Admin@123');
  const staffPasswordHash = await User.hashPassword('Staff@123');

  await User.findOneAndUpdate(
    { email: 'admin@example.com' },
    { $set: { name: 'System Administrator', passwordHash: adminPasswordHash, role: 'admin' } },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: 'staff@example.com' },
    { $set: { name: 'Course Staff', passwordHash: staffPasswordHash, role: 'staff' } },
    { upsert: true, new: true }
  );

  console.log('Admin and Staff accounts ensured.');

  // Get some courses for sample enrollments
  const allCourses = await Course.find({ program: cse._id }).sort({ semester: 1, code: 1 });
  const semester1Courses = allCourses.filter(c => c.semester === 1).slice(0, 2);
  const semester4Courses = allCourses.filter(c => c.semester === 4 && c.courseType === 'CC').slice(0, 3);
  const semester5Courses = allCourses.filter(c => c.semester === 5 && c.courseType === 'CC').slice(0, 2);

  console.log('Creating sample enrollments...');
  const enrollments = [];
  
  // Alice (semester 1) enrollments
  if (alice && semester1Courses.length > 0) {
    for (const course of semester1Courses) {
      enrollments.push({
        student: alice._id,
        course: course._id,
        status: 'enrolled'
      });
    }
  }

  // Bob (semester 4) enrollments
  if (bob && semester4Courses.length > 0) {
    for (const course of semester4Courses) {
      enrollments.push({
        student: bob._id,
        course: course._id,
        status: 'enrolled'
      });
    }
  }

  // Charlie (semester 5) enrollments
  if (charlie && semester5Courses.length > 0) {
    for (const course of semester5Courses) {
      enrollments.push({
        student: charlie._id,
        course: course._id,
        status: 'enrolled'
      });
    }
  }

  if (enrollments.length > 0) {
    await Enrollment.insertMany(enrollments);
    console.log(`Created ${enrollments.length} sample enrollments.`);
  }

  // Summary obtained 
  const programCount = await Program.countDocuments();
  const courseCount = await Course.countDocuments();
  const userCount = await User.countDocuments();
  const enrollmentCount = await Enrollment.countDocuments();

  // this is the summary code to get the idea of what is the output of the specific elements in the code
  console.log('\n=== Seed Summary ===');
  console.log(`Programs: ${programCount}`);
  console.log(`Courses: ${courseCount}`);
  console.log(`Users: ${userCount}`);
  console.log(`Enrollments: ${enrollmentCount}`);
  console.log('\n=== Default Login Credentials ===');
  console.log('Admin Account:');
  console.log('  Email: admin@example.com');
  console.log('  Password: Admin@123');
  console.log('\nStaff Account:');
  console.log('  Email: staff@example.com');
  console.log('  Password: Staff@123');
  console.log('\nStudent Accounts:');
  console.log('  Alice: alice@example.com / Alice@123456');
  console.log('  Bob: bob@example.com / Bob@123456');
  console.log('  Charlie: charlie@example.com / Charlie@123456');
  console.log('\nSeed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


