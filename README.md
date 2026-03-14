Course Enrollment MERN App
==========================

A full-stack MERN application to streamline course registration for students and staff.

Prerequisites
-------------
- Node.js 18+
- MongoDB running locally or a MongoDB URI

Backend Setup
-------------
1. cd backend
2. npm install
3. Create a `.env` file:
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/mern_course_enrollment
   JWT_SECRET=please_change_me
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:5173
4. Seed sample data:
   npm run seed
5. Start the server:
   npm run dev

Frontend Setup
--------------
1. cd frontend
2. npm install
3. Create a `.env` file if needed to override API base:
   VITE_API_BASE=http://localhost:5000/api
4. Start the app:
   npm run dev

Login credentials (after seeding)
---------------------------------
- Admin: admin@example.com / admin123
- Staff: staff@example.com / staff123
- Student: alice@example.com / student123

Key API Endpoints
-----------------
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/courses?programId=&semester=&active=
- POST /api/courses                 (staff/admin)
- PUT /api/courses/:id              (staff/admin)
- DELETE /api/courses/:id           (admin)
- GET /api/enrollments/me
- POST /api/enrollments             body: { courseId }
- POST /api/enrollments/:id/drop
- GET /api/admin/programs           (staff/admin)
- POST /api/admin/programs          (staff/admin)
- POST /api/admin/courses/bulk      (staff/admin)


