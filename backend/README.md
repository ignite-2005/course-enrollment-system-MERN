Backend (Node.js/Express/MongoDB)
=================================

Env variables (create `.env` in backend/):

- PORT=5000
- MONGODB_URI=mongodb://127.0.0.1:27017/mern_course_enrollment
- JWT_SECRET=please_change_me
- JWT_EXPIRES_IN=7d
- CORS_ORIGIN=http://localhost:5173

Scripts:

- npm run dev        # start with nodemon
- npm start          # start server
- npm run seed       # seed database with sample data

API Overview:

- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/courses?programId=&semester=&active=
- POST /api/courses           (staff/admin)
- PUT /api/courses/:id        (staff/admin)
- DELETE /api/courses/:id     (admin)
- GET /api/enrollments/me
- POST /api/enrollments       body: { courseId }
- POST /api/enrollments/:id/drop
- GET /api/admin/programs     (staff/admin)
- POST /api/admin/programs    (staff/admin)
- POST /api/admin/courses/bulk (staff/admin)


