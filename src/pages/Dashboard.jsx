import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Building2, Users, ClipboardList, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/* --- Shared Components --- */
const StatCard = ({ title, value, icon: Icon, bgGradient }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', overflow: 'hidden', position: 'relative' }}>
        <div style={{
            padding: '1rem',
            borderRadius: '16px',
            background: bgGradient,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <Icon size={24} />
        </div>
        <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'hsl(var(--secondary-foreground))', fontWeight: 500 }}>{title}</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}>{value}</p>
        </div>
    </div>
);

const SectionHeader = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
    </div>
);

/* --- Admin Dashboard (Original Full Feature) --- */
const AdminDashboard = () => {
    const { companies, employees, requisitions } = useApp();
    const navigate = useNavigate();

    const pendingRequests = (requisitions || []).filter(req => req.status === 'pending');

    const recentActivity = [
        ...companies.map(c => ({ type: 'company', data: c, date: new Date(c.createdAt || 0) })),
        ...employees.map(e => ({ type: 'employee', data: e, date: new Date(e.createdAt || 0) }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);

    return (
        <div>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1e293b', letterSpacing: '-0.025em' }}>Admin Dashboard</h2>
                    <p style={{ color: '#64748b', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>System-wide overview and controls.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate('/companies')} style={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}>Manage Companies</button>
                    <button className="btn btn-primary" onClick={() => navigate('/employees')}>View Employees</button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Total Companies" value={companies.length} icon={Building2} bgGradient="linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" />
                <StatCard title="Total Employees" value={employees.length} icon={Users} bgGradient="linear-gradient(135deg, #FF6B6B, #EE5253)" />
                <StatCard title="Pending Requests" value={pendingRequests.length} icon={ClipboardList} bgGradient="linear-gradient(135deg, #F59E0B, #D97706)" />
            </div>

            <SectionHeader title="Recent Activity" />
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {recentActivity.map((item, index) => (
                    <div key={index} style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            backgroundColor: item.type === 'company' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: item.type === 'company' ? 'hsl(var(--primary))' : '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {item.type === 'company' ? <Building2 size={20} /> : <Users size={20} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>
                                {item.type === 'company' ? `New Company: ${item.data.name}` : `New Employee: ${item.data.firstName} ${item.data.lastName}`}
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                {item.type === 'company' ? item.data.email : item.data.role}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* --- Team Leader Dashboard (Department Scope) --- */
const TeamLeaderDashboard = () => {
    const { employees, requisitions, userData, departments } = useApp();
    const navigate = useNavigate();

    // Find the department(s) this TL manages
    const managedDept = (departments || []).find(d => d.teamLeaderId === userData?.id) ||
        (departments || []).find(d => d.name === userData?.department);
    const currentDeptName = managedDept?.name || userData?.department || '';

    // Filter for team members (same company + same department)
    const myTeam = employees.filter(e => {
        const userDept = currentDeptName.trim();
        const empDept = (e.department || '').trim();
        return (
            e.companyId === userData?.companyId &&
            userDept !== '' &&
            empDept === userDept &&
            e.id !== userData?.id
        );
    });

    // Filter for team requisitions
    const teamRequisitions = requisitions.filter(req =>
        req.companyId === userData?.companyId &&
        req.department === currentDeptName
    );

    const pendingRequests = teamRequisitions.filter(req => req.status === 'pending');

    return (
        <div>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'hsl(var(--primary))', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {userData?.department || 'Team'} Lead
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Team Overview</h2>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>Manage your department's performance and tasks.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Team Size" value={myTeam.length} icon={Users} bgGradient="linear-gradient(135deg, #3B82F6, #2563EB)" />
                <StatCard title="Pending Requests" value={pendingRequests.length} icon={CheckCircle} bgGradient="linear-gradient(135deg, #10B981, #059669)" />
            </div>

            <SectionHeader title="My Team" />
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {myTeam.length > 0 ? (
                    myTeam.map((member, index) => (
                        <div key={member.id} style={{
                            padding: '1.25rem',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex', alignItems: 'center', gap: '1rem'
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', fontWeight: 600, color: '#475569'
                            }}>
                                {member.firstName?.[0]}{member.lastName?.[0]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{member.firstName} {member.lastName}</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{member.role === 'employee' ? 'Team Member' : member.role}</p>
                            </div>
                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>View</button>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No team members assigned yet.</div>
                )}
            </div>
        </div>
    );
};

/* --- Manager Dashboard (Restricted View - Single Company) --- */
const ManagerDashboard = () => {
    const { employees, companies, requisitions, departments, userData } = useApp();
    const navigate = useNavigate();

    // Get Manager's Company
    const myCompany = companies.find(c => c.id === userData?.companyId);

    // Filter for all employees in this company
    const companyStaff = employees.filter(e => e.companyId === userData?.companyId);

    // Filter for departments in this company
    const companyDepts = departments.filter(d => d.companyId === userData?.companyId);

    // Filter for pending requests in this company
    const pendingRequests = requisitions.filter(req => req.companyId === userData?.companyId && req.status === 'pending');

    if (!myCompany) return <div style={{ padding: '2rem' }}>Company data not found. Please contact support.</div>;

    return (
        <div>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Building2 size={20} color="hsl(var(--primary))" />
                    <span style={{ fontWeight: 600, color: 'hsl(var(--primary))', fontSize: '0.9rem' }}>{myCompany.name}</span>
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Manager Console</h2>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>Oversee your company operations and staff.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Total Staff" value={companyStaff.length} icon={Users} bgGradient="linear-gradient(135deg, #3B82F6, #2563EB)" />
                <StatCard title="Departments" value={companyDepts.length} icon={Building2} bgGradient="linear-gradient(135deg, #8B5CF6, #7C3AED)" />
                <StatCard title="Pending Requests" value={pendingRequests.length} icon={ClipboardList} bgGradient="linear-gradient(135deg, #F59E0B, #D97706)" />
            </div>

            <SectionHeader title="Quick Actions" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <button className="card" onClick={() => navigate('/employees')} style={{
                    textAlign: 'left', cursor: 'pointer', border: '1px solid #e2e8f0',
                    transition: 'transform 0.2s', background: 'white'
                }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Users size={24} style={{ marginBottom: '0.75rem', color: '#3b82f6' }} />
                    <h4 style={{ margin: 0, color: '#1e293b' }}>Manage Staff</h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>View and edit employee records.</p>
                </button>
                <button className="card" style={{
                    textAlign: 'left', cursor: 'pointer', border: '1px solid #e2e8f0',
                    transition: 'transform 0.2s', background: 'white'
                }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <ClipboardList size={24} style={{ marginBottom: '0.75rem', color: '#10b981' }} />
                    <h4 style={{ margin: 0, color: '#1e293b' }}>Project Overview</h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Track active company initiatives.</p>
                </button>
            </div>
        </div>
    );
};

/* --- Employee Dashboard (Personal View) --- */
const EmployeeDashboard = ({ userData }) => {
    return (
        <div>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                    Hello, {userData?.firstName || 'There'}! 👋
                </h2>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>Here's what's happening today.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="My Tasks" value="4 Pending" icon={ClipboardList} bgGradient="linear-gradient(135deg, #F59E0B, #D97706)" />
                <StatCard title="Leave Balance" value="12 Days" icon={Clock} bgGradient="linear-gradient(135deg, #8B5CF6, #7C3AED)" />
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Latest Announcements</h3>
                <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fff, #f8fafc)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{
                            minWidth: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>Quarterly Town Hall</h4>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', lineHeight: 1.5 }}>
                                Join us this Friday for company updates and Q&A session.
                                Make sure to submit your questions in advance using the portal.
                            </p>
                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                                Posted 2 hours ago
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* --- Main Dashboard Router --- */
const Dashboard = () => {
    const { userData, loading } = useApp();

    if (loading) return <div style={{ padding: '2rem' }}>Loading workspace...</div>;

    // Default to Employee view if no role found
    const role = userData?.role?.toLowerCase() || 'employee';

    if (role === 'admin') return <AdminDashboard />;
    if (role === 'manager') return <ManagerDashboard />;
    if (role === 'team_leader') return <TeamLeaderDashboard />;

    return <EmployeeDashboard userData={userData} />;
};

export default Dashboard;
