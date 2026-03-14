import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost } from '../api/client.js';

export default function Admin() {
  const [programs, setPrograms] = useState([]);
  const [newProgram, setNewProgram] = useState({ name: '', code: '', semesters: 8 });
  const [status, setStatus] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  async function load() {
    const { programs: p } = await apiGet('/admin/programs');
    setPrograms(p);
  }

  async function loadEnrollments() {
    setLoadingEnrollments(true);
    try {
      const { enrollments: e } = await apiGet('/enrollments/all');
      setEnrollments(e);
    } catch (err) {
      setStatus(err.message || 'Failed to load enrollments');
    } finally {
      setLoadingEnrollments(false);
    }
  }

  useEffect(() => {
    load();
    loadEnrollments();
  }, []);

  async function createProgram(e) {
    e.preventDefault();
    setStatus('');
    try {
      await apiPost('/admin/programs', {
        name: newProgram.name,
        code: newProgram.code,
        semesters: Number(newProgram.semesters)
      });
      setNewProgram({ name: '', code: '', semesters: 8 });
      await load();
      setStatus('Program created');
    } catch (err) {
      setStatus(err.message || 'Failed to create program');
    }
  }

  return (
    <div>
      <h2>Admin</h2>
      <div style={{ marginBottom: 20 }}>
        <Link to="/admin/register" className="btn-ghost" style={{ display: 'inline-block', padding: '8px 16px', textDecoration: 'none' }}>
          Create Staff/Admin Account
        </Link>
      </div>
      <section className="card">
        <h3>Create Program</h3>
        {status && <div>{status}</div>}
        <form onSubmit={createProgram} className="row">
          <input placeholder="Name" value={newProgram.name} onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })} required />
          <input placeholder="Code" value={newProgram.code} onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })} required />
          <input
            placeholder="Semesters"
            type="number"
            min="1"
            max="12"
            value={newProgram.semesters}
            onChange={(e) => setNewProgram({ ...newProgram, semesters: e.target.value })}
            required
          />
          <button type="submit">Create</button>
        </form>
      </section>
      <section>
        <h3>Programs</h3>
        <ul>
          {programs.map((p) => (
            <li key={p._id}>
              {p.name} ({p.code}) - {p.semesters} semesters
            </li>
          ))}
        </ul>
      </section>
      <section className="card" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>All Enrollments</h3>
          <button onClick={loadEnrollments} disabled={loadingEnrollments}>
            {loadingEnrollments ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        {loadingEnrollments ? (
          <div>Loading enrollments...</div>
        ) : enrollments.length === 0 ? (
          <div className="muted">No enrollments found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #1f2937' }}>
                  <th style={{ padding: 8 }}>Student Name</th>
                  <th style={{ padding: 8 }}>Student Email</th>
                  <th style={{ padding: 8 }}>Course Code</th>
                  <th style={{ padding: 8 }}>Course Title</th>
                  <th style={{ padding: 8 }}>Program</th>
                  <th style={{ padding: 8 }}>Semester</th>
                  <th style={{ padding: 8 }}>Status</th>
                  <th style={{ padding: 8 }}>Enrolled Date</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e._id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: 8 }}>{e.student?.name || 'N/A'}</td>
                    <td style={{ padding: 8 }}>{e.student?.email || 'N/A'}</td>
                    <td style={{ padding: 8, fontWeight: 600 }}>{e.course?.code || 'N/A'}</td>
                    <td style={{ padding: 8 }}>{e.course?.title || 'N/A'}</td>
                    <td style={{ padding: 8 }}>{e.course?.program?.name || 'N/A'}</td>
                    <td style={{ padding: 8 }}>{e.course?.semester || 'N/A'}</td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: e.status === 'enrolled' ? '#22c55e22' : '#ef444422',
                          color: e.status === 'enrolled' ? '#22c55e' : '#ef4444',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td style={{ padding: 8, fontSize: 12, color: '#9ca3af' }}>
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


