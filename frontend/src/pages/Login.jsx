import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet } from '../api/client.js';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loginRole, setLoginRole] = useState('student'); // student, admin, staff
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', programId: '', semester: '' });
  const [error, setError] = useState('');
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0, totalPrograms: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [allCourses, setAllCourses] = useState([]);
  const [allPrograms, setAllPrograms] = useState([]);
  const [activeView, setActiveView] = useState('login'); // login, dashboard, courses, programs

  useEffect(() => {
    // Load programs for registration
    if (isRegister) {
      apiGet('/programs')
        .then(({ programs: list }) => setPrograms(list))
        .catch(() => {});
    }
    
    // Load statistics for display
    async function loadData() {
      try {
        const statsData = await apiGet('/courses/stats').catch(() => ({ totalStudents: 0, totalCourses: 0, totalPrograms: 0 }));
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadData();
  }, [isRegister]);

  useEffect(() => {
    // Load all courses when viewing courses
    if (activeView === 'courses') {
      apiGet('/courses/public')
        .then((data) => setAllCourses(data.courses || []))
        .catch(() => setAllCourses([]));
    }
  }, [activeView]);

  useEffect(() => {
    // Load all programs when viewing programs
    if (activeView === 'programs') {
      apiGet('/programs')
        .then(({ programs: list }) => setAllPrograms(list || []))
        .catch(() => setAllPrograms([]));
    }
  }, [activeView]);

  useEffect(() => {
    const p = programs.find((x) => x._id === form.programId);
    if (p && p.semesters) {
      const numSemesters = Number(p.semesters) || 8;
      const semesterArray = Array.from({ length: numSemesters }, (_, i) => i + 1);
      setSemesters(semesterArray);
      if (!form.semester) setForm((f) => ({ ...f, semester: 1 }));
    } else {
      setSemesters([]);
      setForm((f) => ({ ...f, semester: '' }));
    }
  }, [form.programId, programs]);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        // client-side validations
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!emailRegex.test(form.email)) return setError('Enter a valid email');
        if (!pwdRegex.test(form.password)) return setError('Password must be 8+ chars with upper, lower, and digit');
        if (form.password !== form.confirmPassword) return setError('Passwords do not match');
        if (!form.programId) return setError('Select a program');
        if (!form.semester) return setError('Select a semester');

        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: form.role, // server will restrict to student
          programId: form.programId,
          semester: Number(form.semester)
        });
      } else {
        await login(form.email, form.password);
      }
    } catch (err) {
      console.error('Login/Register Error:', err);
      setError(err.message || 'Failed');
    }
  }

  // Detect if trying to login as admin
  const isAdminLogin = loginRole === 'admin' || loginRole === 'staff';
  const welcomeText = loginRole === 'admin' ? 'Welcome to Admin Login' : (loginRole === 'staff' ? 'Welcome to Staff Login' : (isRegister ? 'Create your account' : 'Welcome'));

  return (
    <div className="auth-page">
      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        maxWidth: '900px',
        margin: '0 auto 24px'
      }}>
        <button 
          className={activeView === 'login' ? 'btn-primary' : 'btn-ghost'}
          onClick={() => { setActiveView('login'); setIsRegister(false); setError(''); }}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Login / Register
        </button>
        <button 
          className={activeView === 'dashboard' ? 'btn-primary' : 'btn-ghost'}
          onClick={() => setActiveView('dashboard')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Dashboard
        </button>
        <button 
          className={activeView === 'courses' ? 'btn-primary' : 'btn-ghost'}
          onClick={() => setActiveView('courses')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Courses
        </button>
        <button 
          className={activeView === 'programs' ? 'btn-primary' : 'btn-ghost'}
          onClick={() => setActiveView('programs')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          Programs
        </button>
      </div>

      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '24px',
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



      {/* Content Views */}
      {activeView === 'login' && (
        <div className="card auth-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {/* Login Role Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600' }}>
              Login Type:
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setLoginRole('student'); setForm({ ...form, role: 'student' }); setError(''); }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: loginRole === 'student' ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: loginRole === 'student' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: loginRole === 'student' ? 'var(--accent)' : 'inherit'
                }}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => { setLoginRole('admin'); setForm({ ...form, role: 'admin' }); setError(''); }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: loginRole === 'admin' ? '2px solid #22c55e' : '1px solid var(--border)',
                  background: loginRole === 'admin' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: loginRole === 'admin' ? '#22c55e' : 'inherit'
                }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setLoginRole('staff'); setForm({ ...form, role: 'staff' }); setError(''); }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: loginRole === 'staff' ? '2px solid #f59e0b' : '1px solid var(--border)',
                  background: loginRole === 'staff' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: loginRole === 'staff' ? '#f59e0b' : 'inherit'
                }}
              >
                Staff
              </button>
            </div>
          </div>

          <h2>{welcomeText}</h2>
          <p className="muted" style={{ marginBottom: 14 }}>
            {isRegister ? 'Join to enroll in courses' : 'Sign in to continue'}
          </p>
          {error && <div className="error">{error}</div>}
          <form onSubmit={onSubmit}>
            {isRegister && <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />}
            <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {isRegister && (
              <input
                placeholder="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            )}
            {isRegister && loginRole === 'student' && (
              <>
                <select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })} required style={{ minHeight: '44px' }}>
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.code}) {p.degree ? `• ${p.degree}` : ''}
                    </option>
                  ))}
                </select>
                <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required style={{ minHeight: '44px', maxHeight: '300px' }}>
                  <option value="">Select Semester</option>
                  {semesters && semesters.length > 0 ? (
                    semesters.map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))
                  ) : (
                    <option disabled>Select a program first</option>
                  )}
                </select>
              </>
            )}
            <div className="row-center" style={{ justifyContent: 'space-between', marginTop: 6 }}>
              <button type="submit">{isRegister ? 'Create Account' : 'Login'}</button>
              {loginRole === 'student' && (
                <button type="button" className="btn-ghost" onClick={() => { setIsRegister((v) => !v); setError(''); }}>
                  {isRegister ? 'Have an account? Login' : 'No account? Register'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2>Dashboard</h2>
          <p className="muted">Here's an overview of the enrollment system:</p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '20px'
          }}>
            <div style={{
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              textAlign: 'center',
              borderLeft: '4px solid var(--accent)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--accent)' }}>
                {stats.totalStudents}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                Total Students Enrolled
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: 'rgba(34, 211, 238, 0.1)',
              borderRadius: '8px',
              textAlign: 'center',
              borderLeft: '4px solid var(--accent-2)'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--accent-2)' }}>
                {stats.totalCourses}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                Total Courses Available
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '8px',
              textAlign: 'center',
              borderLeft: '4px solid #a855f7'
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#a855f7' }}>
                {stats.totalPrograms}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                Total Programs
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px' }}>
            <h3>Welcome to the Enrollment System</h3>
            <p className="muted">
              Use the navigation tabs above to explore available courses and programs, or log in to manage your enrollment.
            </p>
          </div>
        </div>
      )}

      {/* Courses View */}
      {activeView === 'courses' && (
        <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2>Available Courses</h2>
          {allCourses.length === 0 ? (
            <p className="muted">No courses available at the moment.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginTop: '16px'
            }}>
              {allCourses.map((course) => (
                <div key={course._id} style={{
                  padding: '16px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  borderRadius: '8px',
                  borderLeft: '4px solid var(--accent)',
                  transition: 'all 0.3s ease'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>
                    {course.code}
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontWeight: '500' }}>
                    {course.title}
                  </p>
                  <div className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                    <div><strong>Program:</strong> {course.program?.name || 'N/A'}</div>
                    <div><strong>Semester:</strong> {course.semester}</div>
                    <div><strong>Type:</strong> {course.courseType || 'N/A'}</div>
                    {course.instructor && <div><strong>Instructor:</strong> {course.instructor}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Programs View */}
      {activeView === 'programs' && (
        <div className="card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2>Available Programs</h2>
          {allPrograms.length === 0 ? (
            <p className="muted">No programs available at the moment.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginTop: '16px'
            }}>
              {allPrograms.map((program) => (
                <div key={program._id} style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                  borderRadius: '8px',
                  borderLeft: '4px solid #a855f7'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>
                    {program.name}
                  </h3>
                  <div className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
                    <div><strong>Code:</strong> {program.code}</div>
                    <div><strong>Degree:</strong> {program.degree || 'BTech'}</div>
                    <div><strong>Total Semesters:</strong> {program.semesters}</div>
                    {program.description && <div style={{ marginTop: '8px', fontStyle: 'italic' }}>{program.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


