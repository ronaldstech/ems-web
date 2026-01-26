import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Building2, Users, FileText, ClipboardList, LogOut, Clock, UserCheck } from 'lucide-react'; // Added icons

import clsx from 'clsx';
import { useApp } from '../context/AppContext';

const Sidebar = ({ className, onClose }) => {
  const { logout, user, userData, requisitions } = useApp();
  const navigate = useNavigate();
  const role = userData?.role?.toLowerCase() || 'employee';

  // Calculate pending requisitions badge count
  const getPendingRequisitionsCount = () => {
    if (!requisitions || !userData) return 0;

    if (role === 'manager') {
      return requisitions.filter(req =>
        req.companyId === userData.companyId &&
        req.status === 'pending_manager'
      ).length;
    }

    if (role === 'team_leader') {
      return requisitions.filter(req =>
        req.companyId === userData.companyId &&
        req.departmentId === userData.departmentId &&
        req.status === 'pending_leader'
      ).length;
    }

    return 0;
  };

  const pendingCount = getPendingRequisitionsCount();

  const allNavItems = [
    { to: '/', icon: Home, label: 'Dashboard', roles: ['admin', 'manager', 'team_leader', 'employee', 'contractor'] },
    { to: '/requisitions', icon: ClipboardList, label: 'Requisitions', roles: ['admin', 'manager', 'team_leader', 'employee'], badge: pendingCount },
    { to: '/attendance', icon: Clock, label: 'Check In/Out', roles: ['employee'] }, // New
    { to: '/my-team', icon: UserCheck, label: 'Team', roles: ['employee'] }, // New
    { to: '/invoices', icon: FileText, label: 'Invoices', roles: ['admin', 'manager', 'employee'] }, // Added employee
    { to: '/companies', icon: Building2, label: 'Companies', roles: ['admin'] },
    { to: '/employees', icon: Users, label: 'Employees', roles: ['admin', 'manager'] },
    { to: '/departments', icon: ClipboardList, label: 'Departments', roles: ['admin', 'manager', 'team_leader'] },
  ];

  const navItems = allNavItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  // Helper to handle link click
  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <aside className={`sidebar ${className || ''}`}>
      <div>
        <div style={{ marginBottom: '3rem', padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.2rem',
            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
          }}>ES</div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.025em' }}>EMS Space</h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Management System</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                clsx('nav-link', isActive && 'active')
              }
              style={({ isActive }) => ({
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'white' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease',
                background: isActive ? 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                position: 'relative'
              })}
            >
              <item.icon size={20} style={{ opacity: 0.9 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '999px',
                  minWidth: '18px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div style={{
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        paddingTop: '1.5rem',
        marginTop: 'auto'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '1rem', padding: '0.5rem',
          borderRadius: '12px', background: 'rgba(255,255,255,0.5)'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#e2e8f0', color: '#64748b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 700
          }}>
            {user?.email ? getInitials(user.email) : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
