import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectToDatabase } from './setup/db.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import enrollmentRoutes from './routes/enrollments.js';
import adminRoutes from './routes/admin.js';
import programsRoutes from './routes/programs.js';

dotenv.config();

const app = express(); // for creating web server instance  
const port = process.env.PORT || 5000;  // if not specified then default 5000 

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/programs', programsRoutes);

app.use((err, req, res, next) => {  // i am using it for global error handling (centrailzed error-handling middleware)
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });


