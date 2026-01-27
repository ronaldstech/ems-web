import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Search, User, Calendar, Filter, UserCheck, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AttendanceHistory = () => {
    const { userData, attendance, employees, companies, departments } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState(''); // New Dept Filter
    const [timeRange, setTimeRange] = useState('all'); // today, week, month, all

    const role = userData?.role?.toLowerCase() || 'employee';
    const today = new Date().toISOString().split('T')[0];

    const handleReset = () => {
        setSearchTerm('');
        setDateFilter('');
        setDeptFilter('');
        setTimeRange('all');
    };

    const generatePDF = async () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const company = companies.find(c => c.id === userData?.companyId);
        const department = departments.find(d => d.id === userData?.departmentId);

        // Helper to get base64 image with CORS handling
        const getBase64Image = (url) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.setAttribute('crossOrigin', 'anonymous');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    try {
                        const dataURL = canvas.toDataURL('image/png');
                        resolve(dataURL);
                    } catch (e) {
                        reject(new Error("CORS Tainted Canvas"));
                    }
                };
                img.onerror = () => reject(new Error("Network or CORS error"));
                img.src = url;
            });
        };

        let yPos = 25; // Default yPos

        // Logo integration
        if (company?.logoUrl) {
            try {
                const logoBase64 = await getBase64Image(company.logoUrl);
                doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);
                yPos = 45; // Push content down if logo is present
            } catch (error) {
                console.group('PDF Logo Error');
                console.warn('Could not load company logo in PDF due to CORS policy.');
                console.info('To fix this, the server at unimarket-mw.com must allow CORS requests from your origin.');
                console.info('Suggested fix: Add "Header set Access-Control-Allow-Origin \"*\"" to the server .htaccess or PHP headers.');
                console.groupEnd();
                yPos = 25; // Keep default if logo fails
            }
        }

        // Header Logic
        const showDept = (role === 'manager' && deptFilter) || (role === 'team_leader');
        const activeDept = showDept ? (departments.find(d => d.id === (deptFilter || userData?.departmentId))?.name) : null;

        doc.setFontSize(26);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        // Main Heading: Company Name
        doc.text(company?.name || 'EMS Timesheet', 297 / 2, yPos > 30 ? 25 : 15, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        // Subtitle: Timesheet Attendance (smaller)
        doc.text("Timesheet Attendance", 297 / 2, yPos > 30 ? 32 : 22, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, yPos);
        doc.text(`Period: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`, 14, yPos + 5);

        // Conditionally show Department
        if (showDept && activeDept) {
            doc.text(`Department: ${activeDept}`, 283, yPos > 30 ? 25 : 20, { align: "right" });
        }

        const tableColumn = ["Employee", "Month", "Day", "Date", "Check In", "Check Out", "Total Worked", "Lunch", "Normal", "OT"];
        const tableRows = [];

        filteredAttendance.forEach(record => {
            const dateObj = new Date(record.date);
            const month = dateObj.toLocaleString('default', { month: 'long' });
            const dayName = dateObj.toLocaleString('default', { weekday: 'long' });

            const employee = employees.find(e => e.id === record.employeeId);
            const checkIn = new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---';

            let totalWorkedDec = 0;
            let durationStr = '--';

            if (record.checkOut) {
                const diff = Math.abs(new Date(record.checkOut) - new Date(record.checkIn));
                totalWorkedDec = diff / (1000 * 60 * 60);
                const hours = Math.floor(totalWorkedDec);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                durationStr = `${hours}h ${minutes}m`;
            }

            // Calculations
            const lunch = record.checkOut ? 1 : 0; // Fixed 1h lunch if checked out
            const normalHrs = Math.max(0, totalWorkedDec - lunch);
            const overtime = Math.max(0, normalHrs - 8);

            tableRows.push([
                employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
                month,
                dayName,
                record.date,
                checkIn,
                checkOut,
                durationStr,
                record.checkOut ? "1h 00m" : "---",
                record.checkOut ? `${Math.floor(normalHrs)}h ${Math.round((normalHrs % 1) * 60)}m` : "---",
                record.checkOut ? `${Math.floor(overtime)}h ${Math.round((overtime % 1) * 60)}m` : "---"
            ]);
        });

        autoTable(doc, {
            startY: yPos + 15,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
            styles: { fontSize: 7, cellPadding: 3, halign: 'center' },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 },
                1: { cellWidth: 25 },
                2: { cellWidth: 25 },
                3: { cellWidth: 25 },
                6: { fontStyle: 'bold' }
            },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });

        doc.save(`Timesheet_${company?.name || 'Company'}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Filter attendance records based on role
    const filteredAttendance = attendance.filter(record => {
        // 1. Role-based isolation (Company level is handled by the data source usually, but we check again)
        if (record.companyId !== userData?.companyId) return false;

        let isVisible = false;
        if (role === 'manager') {
            // Managers can filter by department if they choose
            isVisible = deptFilter ? record.departmentId === deptFilter : true;
        } else if (role === 'team_leader') {
            // Leaders are locked to their department
            isVisible = record.departmentId === userData?.departmentId;
        } else if (role === 'employee') {
            isVisible = record.employeeId === userData?.id;
        }

        if (!isVisible) return false;

        // 2. Time Range Filter
        if (timeRange !== 'all') {
            const recordDate = new Date(record.date);
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (timeRange === 'today') {
                if (record.date !== today) return false;
            } else if (timeRange === 'week') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
                if (recordDate < startOfWeek) return false;
            } else if (timeRange === 'month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                if (recordDate < startOfMonth) return false;
            }
        }

        // 3. Search filter (by employee name)
        const employee = employees.find(e => e.id === record.employeeId);
        const fullName = employee ? `${employee.firstName} ${employee.lastName}`.toLowerCase() : '';
        const matchesSearch = searchTerm === '' || fullName.includes(searchTerm.toLowerCase());

        // 4. Date filter
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

                    <div style={{ display: 'flex', gap: '0.75rem', flex: '1', minWidth: '300px', maxWidth: '800px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            style={{
                                padding: '0.5rem', borderRadius: '10px',
                                border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569',
                                background: 'white'
                            }}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>

                        {/* Manager-only Department Filter */}
                        {role === 'manager' && (
                            <select
                                value={deptFilter}
                                onChange={(e) => setDeptFilter(e.target.value)}
                                style={{
                                    padding: '0.5rem', borderRadius: '10px',
                                    border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569',
                                    background: 'white', minWidth: '150px'
                                }}
                            >
                                <option value="">All Departments</option>
                                {departments
                                    .filter(d => d.companyId === userData?.companyId)
                                    .map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))
                                }
                            </select>
                        )}

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
                        <button
                            onClick={generatePDF}
                            disabled={filteredAttendance.length === 0}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '0.5rem 1rem', background: 'hsl(var(--primary))',
                                color: 'white', border: 'none', borderRadius: '10px',
                                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                                transition: 'opacity 0.2s', opacity: filteredAttendance.length === 0 ? 0.5 : 1
                            }}
                        >
                            <Download size={18} />
                            PDF
                        </button>
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
