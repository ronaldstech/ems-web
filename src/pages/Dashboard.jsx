import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Building2, Users, ClipboardList, FileText, CheckCircle, Clock, AlertCircle, Shield } from 'lucide-react';

/* --- Shared Components --- */
const StatCard = ({ title, value, icon: Icon, bgGradient, subtitle }) => (
    <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflow: 'hidden',
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
                padding: '0.75rem',
                borderRadius: '12px',
                background: bgGradient,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <Icon size={20} />
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</h3>
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', letterSpacing: '-0.025em' }}>{value}</p>
            </div>
        </div>
        {subtitle && (
            <div style={{ pt: '0.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                {subtitle}
            </div>
        )}
    </div>
);

const SectionHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '1.5rem', marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{subtitle}</p>}
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
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.025em' }}>Admin Control</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Full scale oversight of all companies and users.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" onClick={() => navigate('/companies')} style={{ padding: '0.6rem 1.25rem', borderRadius: '10px' }}>Companies</button>
                    <button className="btn btn-primary" onClick={() => navigate('/employees')} style={{ padding: '0.6rem 1.25rem', borderRadius: '10px' }}>Employees</button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Global Companies" value={companies.length} icon={Building2} bgGradient="linear-gradient(135deg, #6366f1, #a855f7)" subtitle="Registered business entities" />
                <StatCard title="Active Employees" value={employees.length} icon={Users} bgGradient="linear-gradient(135deg, #3b82f6, #06b6d4)" subtitle="Total workforce across all depts" />
                <StatCard title="System Alerts" value={pendingRequests.length} icon={ClipboardList} bgGradient="linear-gradient(135deg, #f59e0b, #ef4444)" subtitle="Requisitions requiring sync" />
            </div>

            <SectionHeader title="System Activity" subtitle="Latest registrations and updates" />
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {recentActivity.length > 0 ? recentActivity.map((item, index) => (
                    <div key={index} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem', background: index % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            backgroundColor: item.type === 'company' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: item.type === 'company' ? '#6366f1' : '#3b82f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {item.type === 'company' ? <Building2 size={18} /> : <Users size={18} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                                {item.type === 'company' ? `Company: ${item.data.name}` : `Staff: ${item.data.firstName} ${item.data.lastName}`}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                                {item.type === 'company' ? item.data.email : item.data.role}
                            </p>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{item.date.toLocaleDateString()}</div>
                    </div>
                )) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No recent system activity.</div>
                )}
            </div>
        </div>
    );
};

/* --- Team Leader Dashboard (Department Scope) --- */
const TeamLeaderDashboard = () => {
    const { employees, requisitions, userData, attendance, calculateProfileCompletion } = useApp();
    const navigate = useNavigate();

    const currentDeptName = userData?.department || '';
    const today = new Date().toISOString().split('T')[0];

    const myTeam = employees.filter(e => e.companyId === userData?.companyId && e.department === currentDeptName && e.id !== userData?.id);
    const teamRequisitions = requisitions.filter(req => req.companyId === userData?.companyId && req.department === currentDeptName);
    const pendingRequests = teamRequisitions.filter(req => req.status === 'pending');

    // Attendance Stats
    const checkedInToday = attendance.filter(a => a.date === today && a.departmentId === userData?.departmentId && !a.checkOut).length;

    // Profile Completion
    const incompleteProfiles = myTeam.filter(e => calculateProfileCompletion(e).percentage < 100).length;

    return (
        <div>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {userData?.department || 'Team'} Department
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.025em' }}>Department Metrics</h2>
                <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Daily overview of your team's status and tasks.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Team Size" value={myTeam.length} icon={Users} bgGradient="linear-gradient(135deg, #3b82f6, #2563eb)" subtitle="Assigned employees" />
                <StatCard title="Checked In" value={checkedInToday} icon={Clock} bgGradient="linear-gradient(135deg, #10b981, #059669)" subtitle="Currently working" />
                <StatCard title="Pending Review" value={pendingRequests.length} icon={CheckCircle} bgGradient="linear-gradient(135deg, #f59e0b, #d97706)" subtitle="Approval requests" />
                <StatCard title="Profile Alerts" value={incompleteProfiles} icon={AlertCircle} bgGradient="linear-gradient(135deg, #ef4444, #b91c1c)" subtitle="Incomplete profiles" />
            </div>

            <SectionHeader title="Team Members" subtitle="Real-time status of your direct reports" />
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {myTeam.length > 0 ? myTeam.map((member) => {
                    const isWorking = attendance.some(a => a.employeeId === member.id && a.date === today && !a.checkOut);
                    const { percentage } = calculateProfileCompletion(member);

                    return (
                        <div key={member.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#475569', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    {member.firstName?.[0]}{member.lastName?.[0]}
                                </div>
                                {isWorking && <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid white' }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{member.firstName} {member.lastName}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{member.role === 'employee' ? 'Team Member' : member.role}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '40px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${percentage}%`, height: '100%', background: percentage === 100 ? '#22c55e' : '#3b82f6' }} />
                                        </div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: percentage === 100 ? '#22c55e' : '#64748b' }}>{percentage}%</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }} onClick={() => navigate('/employees')}>Details</button>
                        </div>
                    );
                }) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No team members assigned yet.</div>
                )}
            </div>
        </div>
    );
};

/* --- Manager Dashboard (Restricted View - Single Company) --- */
const ManagerDashboard = () => {
    const { employees, companies, requisitions, departments, userData, attendance, calculateProfileCompletion } = useApp();
    const navigate = useNavigate();

    const myCompany = companies.find(c => c.id === userData?.companyId);
    const companyStaff = employees.filter(e => e.companyId === userData?.companyId);
    const companyDepts = departments.filter(d => d.companyId === userData?.companyId);
    const pendingRequests = requisitions.filter(req => req.companyId === userData?.companyId && req.status === 'pending');

    // Complex Analytics
    const today = new Date().toISOString().split('T')[0];
    const whoIsIn = attendance.filter(a => a.date === today && a.companyId === userData?.companyId && !a.checkOut).length;

    // Company Profile Completion Average
    const profileStats = companyStaff.map(e => calculateProfileCompletion(e).percentage);
    const avgCompletion = profileStats.length > 0 ? Math.round(profileStats.reduce((a, b) => a + b, 0) / profileStats.length) : 0;

    if (!myCompany) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading company workspace...</div>;

    return (
        <div>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <Building2 size={18} color="#6366f1" />
                        <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{myCompany.name}</span>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.025em' }}>Executive Overview</h2>
                    <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Manage operations, staff growth, and departmental sync.</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/attendance/history')} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
                    Attendance Reports
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                <StatCard title="Active Staff" value={companyStaff.length} icon={Users} bgGradient="linear-gradient(135deg, #3b82f6, #2563eb)" subtitle={`${companyDepts.length} active departments`} />
                <StatCard title="Who's In Today" value={whoIsIn} icon={Clock} bgGradient="linear-gradient(135deg, #10b981, #059669)" subtitle="Currently active on-site" />
                <StatCard title="Profile Health" value={`${avgCompletion}%`} icon={CheckCircle} bgGradient="linear-gradient(135deg, #8b5cf6, #6366f1)" subtitle="Avg profile completion" />
                <StatCard title="Open Requests" value={pendingRequests.length} icon={ClipboardList} bgGradient="linear-gradient(135deg, #f59e0b, #d97706)" subtitle="Approvals required" />
            </div>

            <SectionHeader title="Action Center" subtitle="Essential tasks and management tools" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div onClick={() => navigate('/employees')} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #f1f5f9', position: 'relative', background: 'white' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Users size={20} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Staff Management</h4>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Audit employee profiles, manage roles, and review team growth.</p>
                </div>

                <div onClick={() => navigate('/requisitions')} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #f1f5f9', background: 'white' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <ClipboardList size={20} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Review Requisitions</h4>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{pendingRequests.length} pending items require your attention for project continuity.</p>
                </div>

                <div onClick={() => navigate('/settings')} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #f1f5f9', background: 'white' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Building2 size={20} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Company Settings</h4>
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>Update logo, manage departments, and configure system presets.</p>
                </div>
            </div>
        </div>
    );
};

/* --- Employee Dashboard (Personal View) --- */
const EmployeeDashboard = () => {
    const { userData, attendance, calculateProfileCompletion } = useApp();
    const navigate = useNavigate();

    const { percentage } = calculateProfileCompletion(userData);
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.find(a => a.employeeId === userData?.id && a.date === today);

    return (
        <div>
            <header style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.025em' }}>
                    Hello, {userData?.firstName || 'There'}! 👋
                </h2>
                <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>It's great to see you today. Here's your workspace overview.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                    title="Work Status"
                    value={todayAttendance ? (todayAttendance.checkOut ? 'Checked Out' : 'Checked In') : 'Not Checked In'}
                    icon={Clock}
                    bgGradient={todayAttendance && !todayAttendance.checkOut ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #64748b, #475569)"}
                    subtitle={todayAttendance ? `Activity started at ${new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Start your day in the Attendance tab"}
                />
                <StatCard
                    title="Profile Sync"
                    value={`${percentage}%`}
                    icon={Shield}
                    bgGradient={percentage === 100 ? "linear-gradient(135deg, #8b5cf6, #6366f1)" : "linear-gradient(135deg, #f59e0b, #d97706)"}
                    subtitle={percentage === 100 ? "All verification docs on file" : "Information missing - Action required"}
                />
            </div>

            {/* Profile Completion Prompt */}
            {percentage < 100 && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #fefce8, #fef9c3)',
                    borderRadius: '16px',
                    border: '1px solid #fde047',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }} className="profile-cta">
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#eab308', color: 'white' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#854d0e' }}>Complete Your Profile</h4>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#a16207', fontWeight: 500 }}>
                            You're at {percentage}% completion! Adding your ID scans and contact details ensures seamless operations and verified payroll.
                        </p>
                    </div>
                    <button onClick={() => navigate('/profile')} className="btn btn-primary" style={{ background: '#ca8a04', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '10px', boxShadow: '0 2px 4px rgba(202, 138, 4, 0.2)' }}>
                        Finish Setup
                    </button>
                </div>
            )}

            <div style={{ marginTop: '3rem' }}>
                <SectionHeader title="Latest Announcements" subtitle="Important updates from the organization" />
                <div className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '4px', height: '100%', background: 'hsl(var(--primary))' }} />
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                        <div style={{
                            minWidth: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 }}>Quarterly Town Hall</h4>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Join us this Friday for company updates and Q&A session.
                                Make sure to submit your questions in advance via the requisitions module.
                            </p>
                            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                                <span>Human Resources</span>
                                <span>•</span>
                                <span>2 hours ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-cta { transition: transform 0.2s ease; }
                .profile-cta:hover { transform: translateY(-2px); }
            `}</style>
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
