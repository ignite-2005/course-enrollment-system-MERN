import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Courses from './pages/Courses.jsx';
import MyEnrollments from './pages/MyEnrollments.jsx';
import Admin from './pages/Admin.jsx';
import AdminStaffRegister from './pages/AdminStaffRegister.jsx';
import Programs from './pages/Programs.jsx';
import UpdateProfile from './pages/UpdateProfile.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  const { user, logout } = useAuth();
  return (
    <div className="app">
      <nav className="nav">
        {user && (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/programs">Programs</Link>
            <Link to="/courses">Courses</Link>
            {/* Show enrollments to non-admins (students and staff) but hide for admin users */}
            {user?.role !== 'admin' && <Link to="/enrollments">My Enrollments</Link>}
            {user?.role === 'student' && <Link to="/update-profile">Update Details</Link>}
            {/* Only show Admin link to actual admins; staff shouldn't see admin panel here */}
            {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          </>
        )}
        <div className="spacer" />
        {user && (
          <button onClick={logout}>Logout</button>
        )}
      </nav>
      <main className="main">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          {/* Enrollments accessible to students and staff only (hide from admin) */}
          <Route
            path="/enrollments"
            element={
              <ProtectedRoute roles={["student", "staff"]}>
                <MyEnrollments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/programs"
            element={
              <ProtectedRoute>
                <Programs />
              </ProtectedRoute>
            }
          />
          {/* Admin panel restricted to admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/register"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminStaffRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-profile"
            element={
              <ProtectedRoute roles={["student"]}>
                <UpdateProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
