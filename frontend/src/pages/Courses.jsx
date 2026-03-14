import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      
      // Debug logging
      console.log('User data:', user);
      console.log('Program:', user?.program);
      console.log('Program ID:', user?.program?._id);
      console.log('Semester:', user?.semester);
      
      if (user?.program?._id) {
        const programId = typeof user.program._id === 'string' ? user.program._id : user.program._id.toString();
        params.set('programId', programId);
        console.log('Setting programId:', programId);
      }
      if (user?.semester) {
        params.set('semester', String(user.semester));
        console.log('Setting semester:', user.semester);
      }
      params.set('active', 'true');
      
      console.log('Query params:', params.toString());
      
      const [{ courses: list }, { enrollments }] = await Promise.all([
        apiGet(`/courses?${params.toString()}`),
        apiGet('/enrollments/me')
      ]);
      console.log('Courses loaded:', list);
      setCourses(list.sort((a, b) => (a.semester - b.semester) || a.code.localeCompare(b.code)));
      setEnrolledIds(new Set(enrollments.filter((e) => e.status === 'enrolled').map((e) => e.course._id)));
    } catch (err) {
      console.error('Error loading courses:', err);
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.program?._id, user?.semester]);

  async function enroll(courseId) {
    try {
      await apiPost('/enrollments', { courseId });
      await load();
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const typeColor = (t) => {
    if (t === 'FC') return '#0ea5e9';
    if (t === 'CC') return '#22c55e';
    if (t === 'EC') return '#eab308';
    if (t === 'LAB') return '#f43f5e';
    return '#a78bfa'; // UC/others
  };

  return (
    <div>
      <h2>Available Courses</h2>
      {!user?.program && (
        <div className="card" style={{ marginBottom: 12, background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
          <strong>No program registered</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            Please register with a program to view available courses.
          </div>
        </div>
      )}
      {user?.program && (
        <div className="card" style={{ marginBottom: 12 }}>
          <strong>Program:</strong> {user.program.name} ({user.program.code}) {user.program.degree ? `• ${user.program.degree}` : ''} &nbsp; | &nbsp;
          <strong>Semester:</strong> {user.semester}
          <div className="muted" style={{ marginTop: 6 }}>
            You can only enroll in courses from your program and current semester.
          </div>
        </div>
      )}
      {user?.program && courses.length === 0 && !loading && (
        <div className="card" style={{ background: 'rgba(251, 146, 60, 0.1)', borderLeft: '4px solid #fb923c' }}>
          <strong>No courses available</strong>
          <div className="muted" style={{ marginTop: 6 }}>
            There are currently no courses available for {user.program.name}, Semester {user.semester}.
          </div>
        </div>
      )}
      {courses.length > 0 && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #1f2937' }}>
                <th style={{ padding: 8 }}>Course Code</th>
                <th style={{ padding: 8 }}>Course Title</th>
                <th style={{ padding: 8 }}>Course Type</th>
                <th style={{ padding: 8 }}>Credits</th>
                <th style={{ padding: 8 }}>Status</th>
                <th style={{ padding: 8 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => {
                const isEnrolled = enrolledIds.has(c._id);
                const label = c.hasLab ? ' (LAB)' : '';
                const slots = typeof c.enrolledCount === 'number' ? `${Math.max(0, (c.capacity || 0) - c.enrolledCount)}/${c.capacity}` : '';
                const courseType = c.courseType || c.type; // fallback for older data
                const bg = `linear-gradient(90deg, ${typeColor(courseType)}22, transparent)`;
                const typeBadgeStyle = {
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: typeColor(courseType),
                  color: '#001018',
                  fontWeight: 700,
                  fontSize: 12
                };
                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid #1f2937', background: bg }}>
                    <td style={{ padding: 8, fontWeight: 600 }}>{c.code}</td>
                    <td style={{ padding: 8 }}>
                      {c.title}{label}
                      <div className="muted" style={{ fontSize: 12 }}>{c.description}</div>
                    </td>
                    <td style={{ padding: 8 }}>
                      <span style={typeBadgeStyle}>{courseType}</span>
                      {c.isElective && <span className="muted" style={{ marginLeft: 8 }}>(Elective)</span>}
                    </td>
                    <td style={{ padding: 8 }}>{c.credits}</td>
                    <td style={{ padding: 8 }}>
                      {courseType === 'EC' ? `Available Slots: ${slots}` : c.status || 'Available'}
                    </td>
                    <td style={{ padding: 8 }}>
                      {user?.role === 'student' && (
                        <button
                          disabled={
                            isEnrolled ||
                            (typeof c.capacityRemaining === 'number' && c.capacityRemaining <= 0) ||
                            (user?.program?._id && c.program?._id && String(user.program._id) !== String(c.program._id)) ||
                            (user?.semester && c.semester && Number(user.semester) !== Number(c.semester))
                          }
                          onClick={() => enroll(c._id)}
                        >
                          {isEnrolled ? 'Enrolled' : 'Enroll'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


