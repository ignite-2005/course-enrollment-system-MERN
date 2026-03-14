import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet } from '../api/client.js';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalPrograms: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await apiGet('/courses/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px',
        padding: '24px 0'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 50%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em',
          textShadow: '0 0 40px rgba(59, 130, 246, 0.3)'
        }}>
          Enrollment System
        </h1>
        <p style={{ 
          color: 'var(--muted)', 
          fontSize: '1.1rem',
          margin: 0
        }}>
          Streamline your course registration and academic journey
        </p>
      </div>

      {!loading && (
        <div className="grid" style={{ marginBottom: '24px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '8px' }}>
              {stats.totalStudents}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              Total Students Enrolled
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-2)', marginBottom: '8px' }}>
              {stats.totalCourses}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              Total Courses Available
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#a855f7', marginBottom: '8px' }}>
              {stats.totalPrograms}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              Total Programs (Subjects)
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Welcome, {user?.name}</h2>
          {user?.role === 'student' && (
            <Link to="/update-profile" style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #3b82f6, #22d3ee)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}>
              Update Details
            </Link>
          )}
        </div>
        <p className="muted">Role: {user?.role}</p>
        {user?.program ? (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <div><strong>Program:</strong> {user.program.name} ({user.program.code})</div>
              <div><strong>Degree:</strong> {user.program.degree || 'BTech'}</div>
              <div><strong>Semester:</strong> {user.semester}</div>
            </div>
            <p className="muted" style={{ marginTop: 8 }}>
              You belong to {user.program.name} {user.program.degree ? `(${user.program.degree})` : ''}, Semester {user.semester}.
              You can only enroll in courses from your program and current semester.
            </p>
          </div>
        ) : (
          <p>Register as student to see program-specific courses.</p>
        )}
      </div>
    </div>
  );
}


