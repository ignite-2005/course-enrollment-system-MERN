import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiGet, apiPut } from '../api/client.js';
import { useNavigate } from 'react-router-dom';

export default function UpdateProfile() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(user?.program?._id || '');
  const [selectedSemester, setSelectedSemester] = useState(user?.semester || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const { programs: list } = await apiGet('/programs');
        setPrograms(list);
        
        // Set initial semester options based on current program
        if (selectedProgram) {
          const program = list.find(p => p._id === selectedProgram);
          if (program) {
            const numSemesters = Number(program.semesters) || 8;
            const semesterArray = Array.from({ length: numSemesters }, (_, i) => i + 1);
            setSemesters(semesterArray);
          }
        }
      } catch (err) {
        setError('Failed to load programs');
      }
    }
    loadPrograms();
  }, []);

  // Update semesters when program changes
  useEffect(() => {
    if (selectedProgram) {
      const program = programs.find(p => p._id === selectedProgram);
      if (program) {
        const numSemesters = Number(program.semesters) || 8;
        const semesterArray = Array.from({ length: numSemesters }, (_, i) => i + 1);
        setSemesters(semesterArray);
        setSelectedSemester(''); // Reset semester when program changes
      }
    } else {
      setSemesters([]);
      setSelectedSemester('');
    }
  }, [selectedProgram, programs]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Check if program or semester is actually changing
    const programChanged = String(selectedProgram) !== String(user?.program?._id);
    const semesterChanged = Number(selectedSemester) !== user?.semester;
    
    if (programChanged || semesterChanged) {
      // Show confirmation dialog if anything is changing
      setShowConfirmation(true);
      return;
    }
    
    setError('No changes detected');
  }

  async function confirmUpdate() {
    setError('');
    setSuccess('');
    setShowConfirmation(false);
    setLoading(true);

    try {
      if (!selectedProgram || !selectedSemester) {
        setError('Please select both program and semester');
        setLoading(false);
        return;
      }

      const response = await apiPut('/auth/me', {
        programId: selectedProgram,
        semester: Number(selectedSemester)
      });

      if (response.user) {
        updateUser(response.user);
        setSuccess('Profile updated successfully! All your previous course enrollments have been cleared. Your courses and program details now reflect your new selections.');
        setTimeout(() => {
          navigate('/');
        }, 2500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <div>Loading...</div>;

  if (!user || user.role !== 'student') {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
        <h2>Access Denied</h2>
        <p className="muted">Only students can update their profile details.</p>
      </div>
    );
  }

  const currentProgram = programs.find(p => p._id === selectedProgram);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 50%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          Update Your Details
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', margin: 0 }}>
          Change your program or semester to update your available courses
        </p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Current Information</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '16px'
        }}>
          <div style={{
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '4px' }}>Current Program</div>
            <div style={{ fontWeight: '600' }}>{user.program?.name || 'Not selected'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
              ({user.program?.code || 'N/A'})
            </div>
          </div>
          <div style={{
            padding: '12px',
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '4px' }}>Current Semester</div>
            <div style={{ fontWeight: '600' }}>Semester {user.semester || 'N/A'}</div>
            {user.program && (
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
                of {user.program.semesters} semesters
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          {error && <div className="error" style={{ marginBottom: '12px' }}>{error}</div>}
          {success && <div style={{ color: '#22c55e', marginBottom: '12px', fontWeight: '500' }}>{success}</div>}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text)' }}>
              Select Program
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Choose a program...</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.code}) - {p.degree} - {p.semesters} semesters
                </option>
              ))}
            </select>
          </div>

          {selectedProgram && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text)' }}>
                Select Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Choose a semester...</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    Semester {s} {s === user.semester && '(Current)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentProgram && selectedSemester && (
            <div style={{
              padding: '12px',
              background: 'rgba(34, 211, 238, 0.1)',
              borderRadius: '6px',
              marginBottom: '16px',
              borderLeft: '4px solid var(--accent-2)'
            }}>
              <strong>{currentProgram.name}</strong>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)', marginTop: '4px' }}>
                You will be enrolled in Semester {selectedSemester} of {currentProgram.semesters}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={loading || !selectedProgram || !selectedSemester}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #22d3ee)',
                color: 'white',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading || !selectedProgram || !selectedSemester ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <h2 style={{ marginTop: 0, color: '#fbbf24' }}>⚠️ Important Notice</h2>
            <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
              You are changing your program or semester. This action will:
            </p>
            <ul style={{ marginBottom: '20px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>Delete all your current course enrollments</strong></li>
              <li>Clear all courses you were enrolled in previously</li>
              <li>Update your program to <strong>{currentProgram?.name}</strong></li>
              <li>Update your semester to <strong>Semester {selectedSemester}</strong></li>
            </ul>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              You will need to re-enroll in courses for your new program and semester.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={confirmUpdate}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Updating...' : 'Yes, Update My Profile'}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
