import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, X, Search, CheckCircle, XCircle, AlertTriangle, Building2, Mail, Hash, MapPin, Users, Eye } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const isActive = status === 'active';
    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.7rem',
            letterSpacing: '0.025em',
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(100, 116, 139, 0.1)',
            color: isActive ? '#15803d' : '#475569',
            border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)'}`
        }}>
            <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#22c55e' : '#94a3b8',
                boxShadow: isActive ? '0 0 8px #22c55e' : 'none'
            }} />
            {isActive ? 'Active' : 'Inactive'}
        </div>
    );
};

const Companies = () => {
    const { companies, employees, addCompany, deleteCompany, updateCompany, userData } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [viewingCompany, setViewingCompany] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        registrationNumber: '',
        email: '',
        status: 'active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateCompany(editingId, formData);
        } else {
            addCompany(formData);
        }
        resetForm();
    };

    const handleEdit = (company) => {
        setFormData({
            name: company.name,
            address: company.address,
            registrationNumber: company.registrationNumber,
            email: company.email,
            status: company.status || 'active'
        });
        setEditingId(company.id);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', address: '', registrationNumber: '', email: '', status: 'active' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    // --- Role-Based Filter ---
    const userRole = userData?.role?.toLowerCase() || 'employee';
    const userCompanyId = userData?.companyId;

    const visibleCompanies = companies.filter(c => {
        if (userRole === 'admin') return true; // Admin sees all
        if (userRole === 'manager') return c.id === userCompanyId; // Manager sees only their company
        return false; // Others shouldn't be here, but safe fallback
    });

    const filteredCompanies = visibleCompanies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.registrationNumber.includes(searchTerm)
    );

    const getEmployeeCount = (companyId) => {
        return employees.filter(e => e.companyId === companyId).length;
    };

    const getCompanyEmployees = (companyId) => {
        return employees.filter(e => e.companyId === companyId);
    };

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
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Entities</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.95rem' }}>Overview and management of registered corporate partners.</p>
                </div>
                {userRole === 'admin' && (
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
                        <Plus size={18} /> Add New Company
                    </button>
                )}
            </header>

            {/* Main Table Container */}
            <div className="table-card">
                <div className="table-header">
                    <div className="search-input-wrapper">
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Filter by name, ID or registration..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                        Showing {filteredCompanies.length} companies
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Company Details</th>
                                <th>Staff</th>
                                <th>Status</th>
                                <th>Registration</th>
                                <th>Contact</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                                        <Building2 size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                                        <p style={{ fontWeight: 600, color: '#475569', margin: 0 }}>No records found</p>
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Try refining your search keywords.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <tr key={company.id} className="row-hover">
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{company.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                <MapPin size={12} /> {company.address || 'No address provided'}
                                            </div>
                                        </td>
                                        <td>
                                            <div
                                                onClick={() => setViewingCompany(company)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    padding: '4px 10px', borderRadius: '20px',
                                                    backgroundColor: '#eff6ff', color: '#3b82f6',
                                                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                                            >
                                                <Users size={14} />
                                                {getEmployeeCount(company.id)}
                                            </div>
                                        </td>
                                        <td>
                                            <StatusBadge status={company.status} />
                                        </td>
                                        <td>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.85rem',
                                                fontFamily: 'JetBrains Mono, monospace',
                                                color: '#475569'
                                            }}>
                                                <Hash size={14} color="#94a3b8" />
                                                {company.registrationNumber}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                                                <Mail size={14} />
                                                {company.email}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => setViewingCompany(company)}
                                                    style={actionBtnStyle('#f1f5f9', '#475569')}
                                                    title="View Details"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(company)}
                                                    style={actionBtnStyle('#f1f5f9', '#475569')}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                {userRole === 'admin' && (
                                                    <button
                                                        onClick={() => setDeletingId(company.id)}
                                                        style={actionBtnStyle('#fef2f2', '#ef4444')}
                                                        title="Delete"
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

            {/* View Company Employees Modal */}
            {viewingCompany && (
                <div className="modal-overlay">
                    <div style={{ ...modalCardStyle, maxWidth: '700px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={modalHeaderStyle}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'hsl(var(--primary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{viewingCompany.name}</h3>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Hash size={12} /> {viewingCompany.registrationNumber}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> {viewingCompany.email}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setViewingCompany(null)} style={closeBtnStyle}><X size={24} /></button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                                Employee Directory ({getEmployeeCount(viewingCompany.id)})
                            </h4>

                            {getCompanyEmployees(viewingCompany.id).length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                    {getCompanyEmployees(viewingCompany.id).map(emp => (
                                        <div key={emp.id} style={{
                                            backgroundColor: 'white', padding: '1rem', borderRadius: '12px',
                                            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                        }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.9rem', fontWeight: 600, color: '#475569'
                                            }}>
                                                {emp.firstName?.[0]}{emp.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{emp.firstName} {emp.lastName}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{emp.role}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{emp.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                    <Users size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                    <p>No employees assigned to this company yet.</p>
                                </div>
                            )}

                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>Registered Address</h4>
                                <p style={{ margin: 0, color: '#334155', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                    {viewingCompany.address || 'No address provided'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals - Standardizing on a glassmorphism look */}
            {isFormOpen && (
                <div className="modal-overlay" style={overlayStyle}>
                    <div style={{ ...modalCardStyle, maxWidth: '550px' }}>
                        <div style={modalHeaderStyle}>
                            <h3 style={{ margin: 0 }}>{editingId ? 'Update Entity' : 'Register New Entity'}</h3>
                            <button onClick={resetForm} style={closeBtnStyle}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div style={formGridStyle}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Company Name</label>
                                    <input
                                        required
                                        className="styled-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Acme Corp"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Registration No.</label>
                                    {editingId ? (
                                        <input
                                            className="styled-input"
                                            value={formData.registrationNumber}
                                            readOnly
                                            style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }}
                                        />
                                    ) : (
                                        <div style={{ ...inputStyle, backgroundColor: '#f8fafc', color: '#94a3b8', fontStyle: 'italic' }}>
                                            Auto-generated
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={labelStyle}>Initial Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Contact Email</label>
                                    <input
                                        type="email"
                                        className="styled-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="admin@company.com"
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Registered Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
                                    />
                                </div>
                            </div>
                            <div style={modalFooterStyle}>
                                <button type="button" onClick={resetForm} style={cancelBtnStyle}>Discard</button>
                                <button type="submit" style={submitBtnStyle}>
                                    {editingId ? 'Update Record' : 'Create Company'}
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
                            <h3 style={{ margin: '1rem 0 0.5rem 0', color: '#1e293b' }}>Confirm Deletion</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                This will permanently remove the company from the system. This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                                <button onClick={() => setDeletingId(null)} style={{ ...cancelBtnStyle, flex: 1 }}>Cancel</button>
                                <button
                                    onClick={() => { deleteCompany(deletingId); setDeletingId(null); }}
                                    style={{ ...submitBtnStyle, backgroundColor: '#ef4444', flex: 1 }}
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .row-hover:hover { background-color: #fbfcfd !important; }
                .styled-input:focus { border-color: #2563eb !important; outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
            `}</style>
        </div>
    );
};

// --- Component Styles ---

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

const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' };

export default Companies;