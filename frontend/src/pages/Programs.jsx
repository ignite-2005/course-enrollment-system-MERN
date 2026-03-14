import { useEffect, useState } from 'react';
import { apiGet } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Programs() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { programs: list } = await apiGet('/programs');
        
        // If user is logged in and is a student, show only their program
        if (user?.role === 'student' && user?.program?._id) {
          const studentProgram = list.find(p => p._id === user.program._id);
          setPrograms(studentProgram ? [studentProgram] : []);
        } else {
          // For non-students or public view, show all programs
          setPrograms(list);
        }
      } catch (err) {
        setError(err.message || 'Failed to load programs');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.role, user?.program?._id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  // If user is a student, show their enrollment details
  if (user?.role === 'student' && user?.program) {
    return (
      <div>
        <h2>Your Program</h2>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>{user.program.name}</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Program Code</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '4px' }}>
                {user.program.code}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(34, 211, 238, 0.1)',
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Degree</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '4px' }}>
                {user.program.degree || 'BTech'}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Current Semester</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '4px' }}>
                Semester {user.semester} of {user.program.semesters}
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.1)',
              borderRadius: '6px'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Total Semesters</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '4px' }}>
                {user.program.semesters}
              </div>
            </div>
          </div>
          <p className="muted" style={{ marginTop: '16px', lineHeight: '1.6' }}>
            You are enrolled in <strong>{user.program.name}</strong> ({user.program.degree}). 
            You are currently in <strong>Semester {user.semester}</strong> out of <strong>{user.program.semesters}</strong> semesters.
            You can only enroll in courses from your current semester.
          </p>
        </div>
      </div>
    );
  }

  // For non-students or unauthenticated users, show all programs
  return (
    <div>
      <h2>Available Programs</h2>
      <div className="grid">
        {programs.map((p) => (
          <div key={p._id} className="card">
            <h3>{p.name}</h3>
            <p className="muted">
              <strong>Code:</strong> {p.code} | <strong>Degree:</strong> {p.degree || 'BTech'} | <strong>Semesters:</strong> {p.semesters}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

