import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Search, CheckCircle, XCircle, Clock, FileText, Ban, Check } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
        approved: { bg: 'rgba(34, 197, 94, 0.1)', color: '#15803d', border: 'rgba(34, 197, 94, 0.2)' },
        rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#b91c1c', border: 'rgba(239, 68, 68, 0.2)' }
    };
    const s = styles[status?.toLowerCase()] || styles.pending;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.25rem 0.7rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor: s.bg,
            color: s.color,
            border: `1px solid ${s.border}`
        }}>
            {status}
        </span>
    );
};

const Requisitions = () => {
    const { requisitions, addRequisition, updateRequisition, userData, user } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // New state for editing
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        type: 'Purchase Requisition',
        description: '',
        amount: '',
        startDate: '',
        endDate: '',
    });

    // --- Role Logic ---
    const role = userData?.role?.toLowerCase() || 'employee';
    const isManager = role === 'manager' || role === 'admin' || role === 'team_leader';

    // --- Filtering ---
    const visibleRequisitions = requisitions.filter(req => {
        // Scope Filter
        if (role === 'admin') return true;
        if (role === 'manager') return req.companyId === userData?.companyId; // See all in company
        if (role === 'team_leader') return req.companyId === userData?.companyId && req.department === userData?.department; // See only team
        if (role === 'employee') return req.employeeId === user?.uid; // Match Auth UID
        return false;
    }).filter(req => {
        // Status Filter
        if (filterStatus !== 'all' && req.status !== filterStatus) return false;
        // Search Filter
        const search = searchTerm.toLowerCase();
        return (
            req.title?.toLowerCase().includes(search) ||
            req.employeeFName?.toLowerCase().includes(search) ||
            req.type?.toLowerCase().includes(search)
        );
    });

    const resetForm = () => {
        setFormData({ title: '', type: 'Purchase Requisition', description: '', amount: '', startDate: '', endDate: '' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEdit = (req) => {
        setFormData({
            title: req.title,
            type: req.type,
            description: req.description,
            amount: req.amount,
            startDate: req.startDate,
            endDate: req.endDate,
        });
        setEditingId(req.id);
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData) {
            alert("User profile not loaded. Please try again.");
            return;
        }

        try {
            if (editingId) {
                // Update existing
                await updateRequisition(editingId, {
                    ...formData,
                    // Don't overwrite immutable fields like createdAt
                });
            } else {
                // Create new
                const newReq = {
                    ...formData,
                    status: 'pending',
                    employeeId: user?.uid,
                    employeeFName: userData.firstName || 'Unknown',
                    employeeLName: userData.lastName || 'User',
                    departmentId: userData.department || 'Unassigned',
                    department: userData.department || 'Unassigned',
                    companyId: userData.companyId || '',
                };
                await addRequisition(newReq);
            }
            resetForm();
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to save requisition. Please check console.");
        }
    };

    const handleAction = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;

        const status = action === 'approve' ? 'approved' : 'rejected';
        await updateRequisition(id, { status });
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '2rem',
                paddingBottom: '1.5rem',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Requisitions</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Track and manage approvals.</p>
                </div>
                {role !== 'team_leader' && (
                    <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> New Request
                    </button>
                )}
            </header>

            {/* Controls */}
            <div className="table-card" style={{ marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="search-input-wrapper">
                        <Search size={18} color="#94a3b8" />
                        <input
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title / Type</th>
                                <th>Requester</th>
                                <th>Amount</th>
                                <th>Schedule</th>
                                <th>Submitted</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        No requisitions found.
                                    </td>
                                </tr>
                            ) : (
                                visibleRequisitions.map(req => (
                                    <tr key={req.id} className="row-hover">
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{req.type}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{req.employeeFName} {req.employeeLName}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{req.department}</div>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {req.amount ? parseInt(req.amount).toLocaleString() : '-'}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {req.startDate ? `${req.startDate} to ${req.endDate}` : 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td><StatusBadge status={req.status} /></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                {/* Manager Actions */}
                                                {isManager && req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'approve')}
                                                            style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: '#dcfce7', color: '#166534', cursor: 'pointer' }}
                                                            title="Approve"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'reject')}
                                                            style={{ padding: '0.4rem', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer' }}
                                                            title="Reject"
                                                        >
                                                            <Ban size={16} />
                                                        </button>
                                                    </>
                                                )}

                                                {/* Employee Actions - Edit */}
                                                {!isManager && req.status === 'pending' && req.employeeId === user?.uid && (
                                                    <button
                                                        onClick={() => handleEdit(req)}
                                                        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                                    >
                                                        Edit
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

            {/* Create Modal */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Requisition' : 'New Requisition'}</h3>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Title</label>
                                <input
                                    required
                                    className="styled-input"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. New Laptop"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option>Purchase Requisition</option>
                                        <option>Leave Request</option>
                                        <option>Expense Claim</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Amount (Est.)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Description</label>
                                <textarea
                                    required
                                    className="styled-input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Details..."
                                    rows={3}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={resetForm} style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', background: '#2563eb' }}>
                                    {editingId ? 'Save Changes' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requisitions;
