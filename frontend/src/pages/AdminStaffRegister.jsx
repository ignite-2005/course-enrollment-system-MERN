import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminStaffRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    programId: '',
    semester: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin');
      return;
    }
    apiGet('/admin/programs')
      .then(({ programs: list }) => setPrograms(list))
      .catch(() => {});
  }, [user, navigate]);


  // used it to update the semester options when porgram changes
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
    setSuccess('');
    setLoading(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!emailRegex.test(form.email)) {
        setError('Enter a valid email');
        setLoading(false);
        return;
      }
      if (!pwdRegex.test(form.password)) {
        setError('Password must be 8+ chars with upper, lower, and digit');
        setLoading(false);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (form.programId && !form.semester) {
        setError('Select a semester if program is selected');
        setLoading(false);
        return;
      }

      await apiPost('/admin/users', {
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
        programId: form.programId || undefined,
        semester: form.programId ? Number(form.semester) : undefined
      });

      setSuccess(`${form.role === 'admin' ? 'Admin' : 'Staff'} account created successfully!`);
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff',
        programId: '',
        semester: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2>Create Staff/Admin Account</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Register new staff or admin users. Program and semester are optional.
      </p>
      {error && <div className="error">{error}</div>}
      {success && <div style={{ padding: 12, background: '#22c55e22', color: '#22c55e', borderRadius: 8, marginBottom: 16 }}>{success}</div>}
      <form onSubmit={onSubmit} className="card" style={{ padding: 24 }}>
        <input
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password (8+ chars, upper, lower, digit)"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          placeholder="Confirm password"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          required
        />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <select value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })}>
          <option value="">Select Program (Optional)</option>
          {programs.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.code}) {p.degree ? `• ${p.degree}` : ''}
            </option>
          ))}
        </select>
        {form.programId && (
          <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} required>
            <option value="">Select Semester</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        )}
        <div className="row-center" style={{ justifyContent: 'space-between', marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/admin')}>
            Back to Admin
          </button>
        </div>
      </form>
    </div>
  );
}

