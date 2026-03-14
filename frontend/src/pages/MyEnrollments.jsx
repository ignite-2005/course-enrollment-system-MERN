import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client.js';

export default function MyEnrollments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { enrollments } = await apiGet('/enrollments/me');
      setItems(enrollments);
    } catch (err) {
      setError(err.message || 'Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function drop(id) {
    try {
      await apiPost(`/enrollments/${id}/drop`);
      await load();
    } catch (err) {
      alert(err.message || 'Failed to drop');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <h2>My Enrollments</h2>
      <div className="grid">
        {items.map((e) => (
          <div key={e._id} className="card">
            <h3>
              {e.course.code} - {e.course.title}
            </h3>
            <p>
              Program: {e.course.program?.name} | Semester: {e.course.semester}
            </p>
            <p>Status: {e.status}</p>
            {e.status === 'enrolled' && <button onClick={() => drop(e._id)}>Drop</button>}
          </div>
        ))}
      </div>
    </div>
  );
}


