import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Search, User, Briefcase, Mail, Phone, AlertTriangle, Building2 } from 'lucide-react';

const RoleBadge = ({ role }) => {
    const roles = {
        'admin': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
        'manager': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
        'employee': { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
        'contractor': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' }
    };
    const style = roles[role?.toLowerCase()] || roles['employee'];

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            letterSpacing: '0.05em'
        }}>
            {role || 'Employee'}
        </span>
    );
};

const Avatar = ({ firstName, lastName, color }) => {
    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    // Generate a consistent pastel color based on the name if no color provided
    const stringToColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 80%)`;
    };

    const bgColor = color || stringToColor(initials + firstName);
    const textColor = 'hsl(var(--foreground))'; // Dark text on pastel usually works, or calculate contrast

    return (
        <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#1e293b',
            border: '2px solid white',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.05)'
        }}>
            {initials}
        </div>
    );
};

const Employees = () => {
    const { employees, companies, departments, addEmployee, updateEmployee, deleteEmployee, userData } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null); // For detail modal
    const { calculateProfileCompletion } = useApp();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Employee',
        companyId: '', // Changed from department
        phone: '',
        department: '' // Re-added department for Team Leader logic
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        // If manager/TL is adding, enforce their company ID
        let dataToSave = { ...formData };
        if (userData?.role === 'manager' || userData?.role === 'team_leader') {
            dataToSave.companyId = userData.companyId;
        }

        // Validation: Enforce Single Manager per Company
        if (dataToSave.role === 'manager') {
            const existingManager = employees.find(emp =>
                emp.companyId === dataToSave.companyId &&
                emp.role === 'manager' &&
                emp.id !== editingId // Ignore self if editing
            );

            if (existingManager) {
                toast.error(`Action Blocked: This company already has a manager (${existingManager.firstName} ${existingManager.lastName}). Please assign a different role or remove the existing manager first.`);
                return;
            }
        }

        try {
            if (editingId) {
                await updateEmployee(editingId, dataToSave);
                toast.success('Employee updated successfully!');
            } else {
                await addEmployee(dataToSave);
                toast.success('New employee added successfully!');
            }
            resetForm();
        } catch (error) {
            console.error("Error saving employee:", error);
            toast.error(error.message || 'Error saving employee');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteEmployee(id);
            toast.success('Employee deleted successfully');
            setDeletingId(null);
        } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error('Error deleting employee');
        }
    };

    const handleEdit = (employee) => {
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role || 'Employee',
            companyId: employee.companyId || '',
            phone: employee.phone || '',
            department: employee.department || ''
        });
        setEditingId(employee.id);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', email: '', role: 'Employee', companyId: '', phone: '', department: '' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const getCompanyName = (id) => {
        const company = companies.find(c => c.id === id);
        return company ? company.name : '-';
    };

    // --- Role-Based Filter ---
    const userRole = userData?.role?.toLowerCase() || 'employee';
    const userCompanyId = userData?.companyId;
    const userDepartment = userData?.department;

    const visibleEmployees = employees.filter(e => {
        if (userRole === 'admin') return true; // Sees everyone
        if (userRole === 'manager') return e.companyId === userCompanyId; // Sees whole company
        if (userRole === 'team_leader') return e.companyId === userCompanyId && e.department === userDepartment; // Sees only their team
        return false;
    });

    const filteredEmployees = visibleEmployees.filter(e =>
        (e.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '2.5rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '1.5rem'
            }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Employees</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.95rem' }}>Team directory and access management.</p>
                </div>
                {(userRole === 'admin' || userRole === 'manager') && (
                    <button
                        className="btn-primary"
                        onClick={() => setIsFormOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '10px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        <Plus size={18} /> Add New Employee
                    </button>
                )}
            </header>

            {/* Main Table Container */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '1.25rem',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        backgroundColor: '#f8fafc',
                        padding: '0.6rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Filter by name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                width: '100%',
                                outline: 'none',
                                marginLeft: '0.75rem',
                                fontSize: '0.9rem',
                                color: '#1e293b'
                            }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                <th style={thStyle}>Employee</th>
                                <th style={thStyle}>Role</th>
                                <th style={thStyle}>Company</th>
                                <th style={thStyle}>Department</th>
                                <th style={thStyle}>Profile</th>
                                <th style={thStyle}>Contact</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                                        <User size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 600, color: '#475569', margin: 0 }}>No employees found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <tr key={employee.id} style={{ borderBottom: '1px solid #f8fafc' }} className="row-hover">
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Avatar firstName={employee.firstName} lastName={employee.lastName} />
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                                                        {employee.firstName} {employee.lastName}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                                        {employee.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <RoleBadge role={employee.role} />
                                        </td>
                                        <td style={{ padding: '1.25rem', color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                                <Building2 size={14} />
                                                {getCompanyName(employee.companyId)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem', color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                                <Briefcase size={14} />
                                                {employee.department || '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            {(() => {
                                                const { percentage } = calculateProfileCompletion(employee);
                                                let color = '#ef4444'; // Red
                                                if (percentage > 50) color = '#f59e0b'; // Amber
                                                if (percentage === 100) color = '#22c55e'; // Green

                                                return (
                                                    <div
                                                        onClick={() => setSelectedEmployee(employee)}
                                                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', width: '80px' }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color }}>
                                                            <span>{percentage}%</span>
                                                        </div>
                                                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${percentage}%`, height: '100%', background: color, transition: 'width 0.3s ease' }} />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '1.25rem', color: '#64748b' }}>
                                            {employee.phone ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                                    <Phone size={14} /> {employee.phone}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontStyle: 'italic' }}>No phone</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    style={actionBtnStyle('#f1f5f9', '#475569')}
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                {(userRole === 'admin' || userRole === 'manager') && (
                                                    <button
                                                        onClick={() => setDeletingId(employee.id)}
                                                        style={actionBtnStyle('#fef2f2', '#ef4444')}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isFormOpen && (
                <div style={overlayStyle}>
                    <div style={{ ...modalCardStyle, maxWidth: '550px' }}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Employee' : 'Add Employee'}</h3>
                            <button onClick={resetForm} style={closeBtnStyle}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>First Name</label>
                                    <input
                                        required
                                        className="styled-input"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Jane"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name</label>
                                    <input
                                        required
                                        className="styled-input"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Doe"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <label style={labelStyle}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="styled-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="jane@company.com"
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="employee">Employee</option>
                                        <option value="team_leader">Team Leader</option>
                                        {userRole === 'admin' && (
                                            <>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                                <option value="contractor">Contractor</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Company</label>
                                    {/* If Manager, they can't change company. It's auto-assigned. */}
                                    {userRole === 'admin' ? (
                                        <select
                                            value={formData.companyId}
                                            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                                            style={inputStyle}
                                            required
                                        >
                                            <option value="">Select Company...</option>
                                            {companies.map(company => (
                                                <option key={company.id} value={company.id}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            value={getCompanyName(userData?.companyId)}
                                            disabled
                                            style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b' }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <label style={labelStyle}>Department</label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    style={inputStyle}
                                    required
                                >
                                    <option value="">Select Department...</option>
                                    {(userRole === 'admin' && formData.companyId)
                                        ? departments.filter(d => d.companyId === formData.companyId).map(d => (
                                            <option key={d.id} value={d.name}>{d.name}</option>
                                        ))
                                        : departments.filter(d => d.companyId === userData?.companyId).map(d => (
                                            <option key={d.id} value={d.name}>{d.name}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <label style={labelStyle}>Phone Number</label>
                                <input
                                    type="tel"
                                    className="styled-input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    style={inputStyle}
                                />
                            </div>

                            <div style={modalFooterStyle}>
                                <button type="button" onClick={resetForm} style={cancelBtnStyle}>Cancel</button>
                                <button type="submit" style={submitBtnStyle}>
                                    {editingId ? 'Save Changes' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deletingId && (
                <div style={overlayStyle}>
                    <div style={{ ...modalCardStyle, maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ padding: '2.5rem 2rem' }}>
                            <div style={warningIconStyle}><AlertTriangle size={32} /></div>
                            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#1e293b' }}>Confirm Removal</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                Are you sure you want to remove this employee? They will lose access immediately.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                                <button onClick={() => setDeletingId(null)} style={{ ...cancelBtnStyle, flex: 1 }}>Cancel</button>
                                <button
                                    onClick={() => { deleteEmployee(deletingId); setDeletingId(null); }}
                                    style={{ ...submitBtnStyle, backgroundColor: '#ef4444', flex: 1 }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Detail Modal */}
            {selectedEmployee && (() => {
                const { percentage, missingFields } = calculateProfileCompletion(selectedEmployee);
                const fieldMappings = [
                    { key: 'firstName', label: 'First Name' },
                    { key: 'lastName', label: 'Last Name' },
                    { key: 'phone', label: 'Phone Number' },
                    { key: 'address', label: 'Physical Address' },
                    { key: 'departmentId', label: 'Department' },
                    { key: 'idNumber', label: 'ID/National Number' },
                    { key: 'expiryDate', label: 'ID Expiry Date' },
                    { key: 'photoUrl', label: 'Profile Photo' },
                    { key: 'idFrontUrl', label: 'ID Front Scan' },
                    { key: 'idBackUrl', label: 'ID Back Scan' }
                ];

                return (
                    <div style={overlayStyle}>
                        <div style={{ ...modalCardStyle, maxWidth: '500px' }}>
                            <div style={modalHeaderStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Avatar firstName={selectedEmployee.firstName} lastName={selectedEmployee.lastName} />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Profile Completion Status</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedEmployee(null)} style={closeBtnStyle}><X size={20} /></button>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Overall Progress</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: percentage === 100 ? '#22c55e' : '#2563eb' }}>{percentage}%</span>
                                    </div>
                                    <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: percentage === 100 ? '#22c55e' : 'linear-gradient(90deg, #2563eb, #6366f1)',
                                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }} />
                                    </div>
                                </div>

                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Field Verification
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                                    {fieldMappings.map(field => {
                                        const isFilled = selectedEmployee[field.key] && selectedEmployee[field.key] !== '';
                                        return (
                                            <div key={field.key} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem',
                                                borderRadius: '10px',
                                                background: isFilled ? '#f0fdf4' : '#fff1f2',
                                                border: `1px solid ${isFilled ? '#dcfce7' : '#ffe4e6'}`
                                            }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isFilled ? '#166534' : '#991b1b' }}>
                                                    {field.label}
                                                </span>
                                                <div style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: isFilled ? '#22c55e' : '#ef4444',
                                                    color: 'white'
                                                }}>
                                                    {isFilled ? '✓' : '×'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={modalFooterStyle}>
                                    <button
                                        onClick={() => setSelectedEmployee(null)}
                                        style={{ ...submitBtnStyle, width: '100%' }}
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <style>{`
                .row-hover:hover { background-color: #fbfcfd !important; }
                .styled-input:focus { border-color: #2563eb !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
            `}</style>
        </div>
    );
};

// Styles reused from Companies.jsx for consistency
const thStyle = {
    padding: '1rem 1.25rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#64748b',
    letterSpacing: '0.05em'
};

const actionBtnStyle = (bg, color) => ({
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bg,
    color: color,
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.1s ease'
});

const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(8px)',
    zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
};

const modalCardStyle = {
    backgroundColor: 'white', borderRadius: '20px', width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden'
};

const modalHeaderStyle = {
    padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0f172a'
};

const modalFooterStyle = {
    marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end'
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569' };

const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem'
};

const cancelBtnStyle = {
    padding: '0.7rem 1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0',
    backgroundColor: 'white', fontWeight: 600, color: '#64748b', cursor: 'pointer'
};

const submitBtnStyle = {
    padding: '0.7rem 1.2rem', borderRadius: '10px', border: 'none',
    backgroundColor: '#2563eb', fontWeight: 600, color: 'white', cursor: 'pointer'
};

const closeBtnStyle = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' };

const warningIconStyle = {
    width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2',
    color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
};

export default Employees;
