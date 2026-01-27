import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Search, User, Calendar, Filter, UserCheck } from 'lucide-react';

const AttendanceHistory = () => {
    const { userData, attendance, employees } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const role = userData?.role?.toLowerCase() || 'employee';
    const today = new Date().toISOString().split('T')[0];

    const handleReset = () => {
        setSearchTerm('');
        setDateFilter('');
    };

    // Filter attendance records based on role
    const filteredAttendance = attendance.filter(record => {
        // 1. Role-based isolation (Company level is handled by the data source usually, but we check again)
        if (record.companyId !== userData?.companyId) return false;

        let isVisible = false;
        if (role === 'manager') {
            isVisible = true; // See all records in company
        } else if (role === 'team_leader') {
            // OPTIMIZED: Use record.departmentId directly
            isVisible = record.departmentId === userData?.departmentId;
        } else if (role === 'employee') {
            isVisible = record.employeeId === userData?.id;
        }

        if (!isVisible) return false;

        // 2. Search filter (by employee name)
        const employee = employees.find(e => e.id === record.employeeId);
        const fullName = employee ? `${employee.firstName} ${employee.lastName}`.toLowerCase() : '';
        const matchesSearch = searchTerm === '' || fullName.includes(searchTerm.toLowerCase());

        // 3. Date filter
        const matchesDate = dateFilter === '' || record.date === dateFilter;

        return matchesSearch && matchesDate;
    });

    return (
        <div className="page-container">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 className="page-title">Attendance History</h2>
                    <p className="page-subtitle">View and filter historical attendance records</p>
                </div>
                {(searchTerm || dateFilter) && (
                    <button
                        onClick={handleReset}
                        style={{
                            padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600,
                            color: '#64748b', background: '#f1f5f9', border: 'none',
                            borderRadius: '8px', cursor: 'pointer'
                        }}
                    >
                        Reset Filters
                    </button>
                )}
            </header>

            {/* Team Insights Section (for Leaders and Managers) */}
            {role !== 'employee' && (
                <div style={{
                    marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1.5rem', width: '100%'
                }}>
                    <div className="card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Active Members</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 900, color: '#15803d', letterSpacing: '-0.05em' }}>
                                {attendance.filter(a => a.date === today && a.companyId === userData?.companyId && (role === 'manager' || a.departmentId === userData?.departmentId) && !a.checkOut).length}
                            </p>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserCheck size={24} />
                        </div>
                    </div>
                    <div className="card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Total Today</p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.05em' }}>
                                {attendance.filter(a => a.date === today && a.companyId === userData?.companyId && (role === 'manager' || a.departmentId === userData?.departmentId)).length}
                            </p>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={24} />
                        </div>
                    </div>
                </div>
            )}

            <div className="card" style={{ marginTop: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Records Log</h3>

                    <div style={{ display: 'flex', gap: '0.75rem', flex: '1', minWidth: '300px', maxWidth: '600px', justifyContent: 'flex-end' }}>
                        <div style={{ position: 'relative', flex: '1' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search employee..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.5rem', borderRadius: '10px',
                                    border: '1px solid #e2e8f0', fontSize: '0.9rem'
                                }}
                            />
                        </div>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            style={{
                                padding: '0.5rem', borderRadius: '10px',
                                border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569'
                            }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Employee</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Check In</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Check Out</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendance.length > 0 ? filteredAttendance.map((record) => {
                                const employee = employees.find(e => e.id === record.employeeId);
                                const checkInTime = new Date(record.checkIn);
                                const checkOutTime = record.checkOut ? new Date(record.checkOut) : null;

                                let durationStr = '--';
                                if (checkOutTime) {
                                    const diff = Math.abs(checkOutTime - checkInTime);
                                    const hours = Math.floor(diff / (1000 * 60 * 60));
                                    const minutes = Math.floor((diff / (1000 * 60)) % 60);
                                    durationStr = `${hours}h ${minutes}m`;
                                }

                                return (
                                    <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: 'hsl(var(--primary))0a', color: 'hsl(var(--primary))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem'
                                                }}>
                                                    {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                                                        {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                                                    </p>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{employee?.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>
                                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>
                                                {checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: record.checkOut ? '#334155' : '#94a3b8' }}>
                                                {checkOutTime ? checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Working'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: record.checkOut ? '#10b981' : '#f59e0b' }}></div>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{durationStr}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                                        <Calendar size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                                        <p style={{ margin: 0, fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>No historical records found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceHistory;
