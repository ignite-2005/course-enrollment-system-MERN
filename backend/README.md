# 🛠️ Course Enrollment Backend

This is the Node.js/Express API for the Course Enrollment System. It handles authentication, course management, and enrollment logic using MongoDB.

## ⚙️ Environment Variables

To run this server, you must create a `.env` file in this directory with the following variables:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | The port the server runs on | `5000` |
| `MONGODB_URI` | Your MongoDB connection string | `mongodb://localhost:27017/dbname` |
| `JWT_SECRET` | Secret key for signing tokens | `your_random_secret_string` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `CORS_ORIGIN` | Allowed frontend URL | `http://localhost:5173` |

## 🚀 Available Scripts

- `npm run dev`: Starts the server in development mode using **Nodemon** (auto-restarts on save).
- `npm start`: Starts the server in production mode.
- `npm run seed`: Clears the database and populates it with sample Admin, Staff, and Student accounts.

## 🛣️ API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Create a new account.
- `POST /api/auth/login` - Get a JWT token.
- `GET /api/auth/me` - Get current user profile (Requires Token).

### Courses & Programs
- `GET /api/courses` - Fetch courses with optional filters (semester, program).
- `POST /api/courses` - Create a course (Staff/Admin only).
- `POST /api/admin/courses/bulk` - Bulk upload courses from JSON (Admin only).

### Enrollments
- `GET /api/enrollments/me` - View current student's enrollments.
- `POST /api/enrollments` - Enroll in a course (Student only).
- `POST /api/enrollments/:id/drop` - Drop a course.