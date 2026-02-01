import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Search, Users, Building2, ChevronRight, UserPlus, Check, FileText } from 'lucide-react';

const Departments = () => {
    const { departments, employees, userData, addDepartment, updateDepartment, deleteDepartment, updateEmployee } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isMembersOpen, setIsMembersOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [viewingDept, setViewingDept] = useState(null); // For members modal

    const [formData, setFormData] = useState({
        name: '',
        supervisorId: '',
        description: ''
    });

    // --- Scoping ---
    const userRole = userData?.role?.toLowerCase() || 'employee';
    const isManager = userRole === 'manager' || userRole === 'admin';
    const isTL = userRole === 'supervisor';
    const userCompanyId = userData?.companyId;

    // Filter departments based on role
    const companyDepartments = userRole === 'admin'
        ? departments
        : userRole === 'manager'
            ? departments.filter(d => d.companyId === userCompanyId)
            : departments.filter(d =>
                d.companyId === userCompanyId &&
                (d.name === userData?.department || d.supervisorId === userData?.id)
            );

    // Filter employees based on role (for assignment)
    const companyEmployees = userRole === 'admin'
        ? employees
        : employees.filter(e => e.companyId === userCompanyId);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation: must have a company context
        const finalCompanyId = userCompanyId || (editingId ? companyDepartments.find(d => d.id === editingId)?.companyId : '');

        if (!finalCompanyId && userRole !== 'admin') {
            toast.error("Error: Company context not found.");
            return;
        }

        const data = {
            ...formData,
            companyId: finalCompanyId
        };

        try {
            let deptId = editingId;
            if (editingId) {
                await updateDepartment(editingId, data);
                toast.success('Department updated successfully');
            } else {
                const docRef = await addDepartment(data);
                deptId = docRef?.id;
                toast.success('New department created');
            }

            // Sync Supervisor Data (CORRECT)
            // === TEAM LEADER ENFORCEMENT ===
            if (data.supervisorId && deptId) {

                // 1. Remove this leader from any previous department
                const previousDept = companyDepartments.find(
                    d => d.supervisorId === data.supervisorId && d.id !== deptId
                );

                if (previousDept) {
                    await updateDepartment(previousDept.id, {
                        supervisorId: ''
                    });
                }

                // 2. Update department with new leader
                await updateDepartment(deptId, {
                    supervisorId: data.supervisorId
                });

                // 3. Update leader document
                await updateEmployee(data.supervisorId, {
                    role: 'supervisor',
                    departmentId: deptId,
                    department: data.name
                });
            }

            resetForm();
        } catch (error) {
            console.error("Error saving department:", error);
            toast.error('Failed to save department details.');
        }
    };

    const handleEdit = (dept) => {
        setFormData({
            name: dept.name,
            supervisorId: dept.supervisorId || '',
            description: dept.description || ''
        });
        setEditingId(dept.id);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', supervisorId: '', description: '' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleManageMembers = (dept) => {
        setViewingDept(dept);
        setIsMembersOpen(true);
    };

    const toggleMember = async (employee, dept) => {
        if (employee.departmentId && employee.departmentId !== dept.id) {
            toast.error(
                `${employee.firstName} already belongs to ${employee.department}`
            );
            return;
        }

        try {
            const isSameDept = employee.departmentId === dept.id;

            await updateEmployee(employee.id, {
                departmentId: isSameDept ? '' : dept.id,
                department: isSameDept ? '' : dept.name
            });

            toast.success(
                isSameDept
                    ? `Removed ${employee.firstName}`
                    : `Added ${employee.firstName} to ${dept.name}`
            );
        } catch (error) {
            toast.error("Error updating member");
        }
    };

    // Helper to get leader name
    const getLeaderName = (id) => {
        const leader = companyEmployees.find(e => e.id === id);
        return leader ? `${leader.firstName} ${leader.lastName}` : 'Unassigned';
    };

    // Helper to count members
    const getMemberCount = (deptId) => {
        return companyEmployees.filter(e => e.departmentId === deptId).length;
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
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>Departments</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.95rem' }}>Organize your teams and assign leadership.</p>
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
                        <Plus size={18} /> New Department
                    </button>
                )}
            </header>

            {/* Departments Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {companyDepartments.map(dept => (
                    <div key={dept.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    backgroundColor: '#f1f5f9', color: '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Building2 size={24} />
                                </div>
                                {isManager && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(dept.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{dept.name}</h3>
                            <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, minHeight: '2.5em' }}>
                                {dept.description || 'No description provided.'}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem' }}>
                                <Users size={14} color="#64748b" />
                                <span style={{ fontWeight: 600, color: '#475569' }}>Supervisor:</span>
                                <span style={{ color: '#1e293b' }}>{getLeaderName(dept.supervisorId)}</span>
                            </div>
                        </div>

                        <div style={{
                            padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                                {getMemberCount(dept.id)} Members
                            </div>
                            <button
                                onClick={() => handleManageMembers(dept)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    color: '#2563eb', fontWeight: 600, fontSize: '0.85rem',
                                    background: 'none', border: 'none', cursor: 'pointer'
                                }}
                            >
                                {isManager ? 'Manage Team' : 'View Team'} {isManager ? <ChevronRight size={14} /> : <FileText size={14} />}
                            </button>
                        </div>
                    </div>
                ))}

                {companyDepartments.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
                        <Building2 size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ margin: 0, color: '#475569' }}>No Departments Yet</h3>
                        <p>Create your first department to organize your team.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{editingId ? 'Edit Department' : 'New Department'}</h3>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Department Name</label>
                                <input
                                    required
                                    className="styled-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Engineering"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Description</label>
                                <textarea
                                    className="styled-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief overview of responsibilities..."
                                    rows={3}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Assign Supervisor</label>
                                <select
                                    value={formData.supervisorId}
                                    onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    <option value="">Select an employee...</option>

                                    {companyEmployees
                                        .filter(emp => emp.role?.toLowerCase() !== 'manager')
                                        .map(emp => {
                                            const assignedElsewhere =
                                                emp.departmentId &&
                                                emp.departmentId !== editingId;

                                            return (
                                                <option
                                                    key={emp.id}
                                                    value={emp.id}
                                                    disabled={assignedElsewhere}
                                                >
                                                    {emp.firstName} {emp.lastName}
                                                    {assignedElsewhere ? ` — ${emp.department}` : ''}
                                                </option>
                                            );
                                        })}
                                </select>

                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={resetForm} style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                    {editingId ? 'Save Changes' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Members Modal */}
            {isMembersOpen && viewingDept && (
                <div className="modal-overlay">
                    <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{isManager ? 'Manage Team Members' : 'Team Members'}</h3>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    {isManager ? `Assign employees to ${viewingDept.name}` : `Colleagues in ${viewingDept.name}`}
                                </p>
                            </div>
                            <button onClick={() => setIsMembersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            {companyEmployees
                                .filter(emp => emp.role?.toLowerCase() !== 'manager' && emp.id !== viewingDept.supervisorId)
                                .map(emp => {
                                    const isMember = emp.departmentId === viewingDept.id;
                                    const assignedElsewhere = emp.departmentId && !isMember;

                                    // If TL, only show members. If Manager, show all candidates.
                                    if (isTL && !isMember) return null;

                                    return (
                                        <div
                                            key={emp.id}
                                            onClick={() => {
                                                if (!isManager || assignedElsewhere) return;
                                                toggleMember(emp, viewingDept);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem 1rem',
                                                marginBottom: '0.5rem',
                                                borderRadius: '10px',
                                                border: isMember
                                                    ? '1px solid #2563eb'
                                                    : '1px solid #e2e8f0',
                                                backgroundColor: assignedElsewhere
                                                    ? '#f8fafc'
                                                    : isMember
                                                        ? '#eff6ff'
                                                        : 'white',
                                                opacity: assignedElsewhere ? 0.6 : 1,
                                                cursor: assignedElsewhere
                                                    ? 'not-allowed'
                                                    : isManager
                                                        ? 'pointer'
                                                        : 'default',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    backgroundColor: isMember ? '#dbeafe' : '#f1f5f9',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: isMember ? '#2563eb' : '#64748b', fontSize: '0.8rem', fontWeight: 600
                                                }}>
                                                    {emp.firstName[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isMember ? '#1e293b' : '#475569' }}>{emp.firstName} {emp.lastName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        {emp.department ? emp.department : 'Unassigned'}
                                                    </div>
                                                </div>
                                            </div>
                                            {isMember && isManager && <Check size={18} color="#2563eb" />}
                                        </div>
                                    );
                                })}
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
                            <button onClick={() => setIsMembersOpen(false)} style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="modal-overlay" style={{ zIndex: 1100 }}>
                    <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem', textAlign: 'center' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef2f2',
                            color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <Trash2 size={30} />
                        </div>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Delete Department?</h3>
                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.5 }}>
                            Are you sure you want to delete this department? This action cannot be undone and may affect assigned employees.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setDeletingId(null)}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await deleteDepartment(deletingId);
                                        toast.success('Department deleted');
                                    } catch (err) {
                                        toast.error('Failed to delete department');
                                    }
                                    setDeletingId(null);
                                }}
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
