import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Login from './pages/Login';
import Attendance from './pages/Attendance'; // New
import MyTeam from './pages/MyTeam'; // New
import Requisitions from './pages/Requisitions'; // New
import { Toaster } from 'react-hot-toast';
import { useApp } from './context/AppContext';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userData, loading } = useApp();
  const location = useLocation();

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has permission
  if (allowedRoles && userData) {
    const userRole = userData.role?.toLowerCase() || 'employee';
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />; // Unauthorized redirect to dashboard
    }
  }

  return children;
};

import { useState } from 'react'; // Add useState
import { Menu } from 'lucide-react'; // Add Menu icon

// ... imports ...

function App() {
  const { user } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Mobile Sidebar Overlay */}
      {user && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {user && (
        <Sidebar
          className={isSidebarOpen ? 'open' : ''}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <main className={user ? "main-content" : "login-content"}>
        {/* Mobile Header */}
        {user && (
          <div className="mobile-header" style={{
            display: 'none',
            marginBottom: '1.5rem',
            alignItems: 'center',
            gap: '1rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1rem'
          }}>
            <button
              onClick={() => setIsSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b', padding: 0 }}
            >
              <Menu size={24} />
            </button>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>EMS Space</div>
          </div>
        )}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/companies" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Companies />
            </ProtectedRoute>
          } />
          <Route path="/departments" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'team_leader']}>
              <Departments />
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Employees />
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/my-team" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MyTeam />
            </ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'employee']}>
              <div className='card'><h2>Invoices</h2><p>Coming Soon</p></div>
            </ProtectedRoute>
          } />
          <Route path="/requisitions" element={
            <ProtectedRoute>
              <Requisitions />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main >
    </div >
  );
}

export default App;
