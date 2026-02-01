import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Search, CheckCircle, XCircle, Clock, FileText, Ban, Check, DollarSign, Plane, Wallet, Package, Wrench, Monitor, GraduationCap, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
    const styles = {
        pending_leader: {
            bg: 'hsl(214, 100%, 97%)',
            color: 'hsl(214, 95%, 45%)',
            border: 'hsl(214, 90%, 90%)',
            label: 'Pending Leader'
        },
        pending_manager: {
            bg: 'hsl(35, 100%, 97%)',
            color: 'hsl(35, 90%, 45%)',
            border: 'hsl(35, 90%, 90%)',
            label: 'Pending Manager'
        },
        approved: {
            bg: 'hsl(142, 70%, 97%)',
            color: 'hsl(142, 72%, 29%)',
            border: 'hsl(142, 70%, 90%)',
            label: 'Approved'
        },
        rejected: {
            bg: 'hsl(0, 100%, 97%)',
            color: 'hsl(0, 84%, 45%)',
            border: 'hsl(0, 100%, 90%)',
            label: 'Rejected'
        }
    };

    const s = styles[status?.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: status };

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '10px',
            fontSize: '0.725rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            backgroundColor: s.bg,
            color: s.color,
            border: `1px solid ${s.border}`,
            letterSpacing: '0.025em'
        }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.color }}></div>
            {s.label}
        </span>
    );
};

const RequisitionCard = ({ req, role, user, onEdit, onAction, onView }) => {
    const isOwner = req.employeeId === user?.uid;

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'leave request': return <Clock size={16} />;
            case 'purchase requisition': return <FileText size={16} />;
            case 'expense claim': return <CheckCircle size={16} />;
            case 'advance salary': return <DollarSign size={16} />;
            case 'travel request': return <Plane size={16} />;
            case 'petty cash': return <Wallet size={16} />;
            case 'office supplies': return <Package size={16} />;
            case 'maintenance': return <Wrench size={16} />;
            case 'it support': return <Monitor size={16} />;
            case 'training request': return <GraduationCap size={16} />;
            default: return <FileText size={16} />;
        }
    };

    return (
        <div className="card fade-in" onClick={() => onView?.(req, 'requisition')} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            padding: '1.5rem',
            background: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Header / Type */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'hsl(var(--primary))',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        backgroundColor: 'hsl(var(--primary) / 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {getTypeIcon(req.type)}
                    </div>
                    {req.type}
                </div>
                <StatusBadge status={req.status} />
            </div>

            {/* Content */}
            <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                    {req.title}
                </h3>
                <p style={{
                    margin: 0, fontSize: '0.9rem', color: '#64748b',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', lineHeight: '1.5'
                }}>
                    {req.description}
                </p>
            </div>

            {/* Rejection Reason Display */}
            {req.status === 'rejected' && req.rejectionReason && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    backgroundColor: 'hsl(0, 100%, 98%)',
                    border: '1px dashed hsl(0, 100%, 90%)',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ fontWeight: 700, color: 'hsl(0, 84%, 45%)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={12} /> Rejection Reason
                    </div>
                    <p style={{ margin: 0, color: 'hsl(0, 50%, 40%)', fontStyle: 'italic' }}>
                        "{req.rejectionReason}"
                    </p>
                </div>
            )}

            {/* Meta */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                padding: '1rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9'
            }}>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Amount</p>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                        {req.amount ? `MK ${parseInt(req.amount).toLocaleString()}` : '—'}
                    </p>
                </div>
                <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Submitted</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                        {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Footer / Requester & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#f1f5f9', color: '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700
                    }}>
                        {req.employeeFName?.[0]}{req.employeeLName?.[0]}
                    </div>
                    <div style={{ fontSize: '0.85rem', overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{req.employeeFName} {req.employeeLName}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{req.department}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {/* Team Leader Actions */}
                    {role === 'team_leader' && req.status === 'pending_leader' && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAction(req, 'approve'); }}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'hsl(142, 70%, 90%)', color: 'hsl(142, 72%, 29%)', cursor: 'pointer' }}
                                title="Approve"
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAction(req, 'reject'); }}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'hsl(0, 100%, 90%)', color: 'hsl(0, 84%, 45%)', cursor: 'pointer' }}
                                title="Reject"
                            >
                                <Ban size={18} />
                            </button>
                        </>
                    )}

                    {/* Manager Actions */}
                    {role === 'manager' && req.status === 'pending_manager' && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAction(req, 'approve'); }}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'hsl(142, 70%, 90%)', color: 'hsl(142, 72%, 29%)', cursor: 'pointer' }}
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAction(req, 'reject'); }}
                                style={{ padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'hsl(0, 100%, 90%)', color: 'hsl(0, 84%, 45%)', cursor: 'pointer' }}
                            >
                                <Ban size={18} />
                            </button>
                        </>
                    )}

                    {/* Employee Edit */}
                    {isOwner && req.status === 'pending_leader' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(req); }}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0',
                                background: 'white', color: '#1e293b', fontSize: '0.85rem', fontWeight: 600
                            }}
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Requisitions = () => {
    const { requisitions, addRequisition, updateRequisition, leaveRequests, addLeaveRequest, updateLeaveRequest, userData, user, employees } = useApp();
    const [activeTab, setActiveTab] = useState('leave'); // 'requisitions' or 'leave'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReq, setRejectReq] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [pinVerifiedForReject, setPinVerifiedForReject] = useState(false); // Track if PIN was verified for rejection
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // PIN modal state for approvals and rejections
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinReq, setPinReq] = useState(null); // the request being approved/rejected
    const [pinReqType, setPinReqType] = useState(null); // 'requisition' or 'leave'
    const [pinAction, setPinAction] = useState(null); // 'approve' or 'reject'
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');

    // Detail modal state
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedType, setSelectedType] = useState(null); // 'requisition' or 'leave'
    const [employeeDetails, setEmployeeDetails] = useState(null);

    const openDetail = (item, type) => {
        setSelectedItem(item);
        setSelectedType(type);
    };

    const closeDetail = () => {
        setSelectedItem(null);
        setSelectedType(null);
        setEmployeeDetails(null);
    };

    useEffect(() => {
        if (!selectedItem) return;
        const onKey = (e) => { if (e.key === 'Escape') closeDetail(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedItem]);

    // Fetch employee details (email and phone) when modal opens
    useEffect(() => {
        if (!selectedItem || !selectedItem.employeeId) {
            setEmployeeDetails(null);
            return;
        }
        
        const employee = employees?.find(emp => emp.id === selectedItem.employeeId);
        if (employee) {
            setEmployeeDetails({ email: employee.email, phone: employee.phone });
        }
    }, [selectedItem, employees]);

    const [formData, setFormData] = useState({
        title: '',
        type: 'Purchase Requisition',
        description: '',
        amount: '',
        startDate: '',
        endDate: '',
    });

    const [leaveFormData, setLeaveFormData] = useState({
        leaveType: 'vacation',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const role = userData?.role?.toLowerCase() || 'employee';

    // Filter requisitions
    const visibleRequisitions = requisitions.filter(req => {
        if (role === 'admin') return true;
        if (role === 'manager') return req.companyId === userData?.companyId;
        if (role === 'team_leader') return req.companyId === userData?.companyId && req.departmentId === userData?.departmentId;
        if (role === 'employee') return req.employeeId === user?.uid;
        return false;
    }).filter(req => {
        if (filterStatus !== 'all' && req.status !== filterStatus) return false;
        const search = searchTerm.toLowerCase();
        return (
            req.title?.toLowerCase().includes(search) ||
            req.employeeFName?.toLowerCase().includes(search) ||
            req.type?.toLowerCase().includes(search)
        );
    });

    // Filter leave requests
    const visibleLeaveRequests = leaveRequests.filter(req => {
        if (role === 'admin') return true;
        if (role === 'manager') return req.companyId === userData?.companyId;
        if (role === 'team_leader') return req.companyId === userData?.companyId && req.departmentId === userData?.departmentId;
        if (role === 'employee') return req.employeeId === user?.uid;
        return false;
    }).filter(req => {
        if (filterStatus !== 'all' && req.status !== filterStatus) return false;
        const search = searchTerm.toLowerCase();
        return (
            req.employeeName?.toLowerCase().includes(search) ||
            req.leaveType?.toLowerCase().includes(search) ||
            req.reason?.toLowerCase().includes(search)
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
        if (!userData) return;

        try {
            if (editingId) {
                await updateRequisition(editingId, { ...formData });
            } else {
                // Determine initial status based on role
                const initialStatus = role === 'team_leader' ? 'pending_manager' : 'pending_leader';

                const newReq = {
                    ...formData,
                    status: initialStatus,
                    employeeId: user?.uid,
                    employeeFName: userData.firstName || 'Unknown',
                    employeeLName: userData.lastName || 'User',
                    departmentId: userData.departmentId || '',
                    department: userData.department || 'Unassigned',
                    companyId: userData.companyId || '',
                    createdAt: new Date().toISOString()
                };
                await addRequisition(newReq);
            }
            resetForm();
        } catch (error) {
            console.error("Submission error:", error);
        }
    };

    const handleAction = async (req, action) => {
        // Require PIN for both approve and reject for team leaders and managers
        if ((action === 'approve' || action === 'reject') && (role === 'team_leader' || role === 'manager')) {
            if (!userData?.approvalPin) {
                toast.error('You must set an approval PIN in Settings before approving or declining requests.');
                return;
            }
            setPinReq(req);
            setPinReqType('requisition');
            setPinAction(action);
            setPinInput('');
            setPinError('');
            setPinVerifiedForReject(false);
            setIsPinModalOpen(true);
            return;
        }

        // For other roles, reject without PIN
        if (action === 'reject') {
            setRejectReq(req);
            setPinVerifiedForReject(false);
            setRejectionReason('');
            setIsRejectModalOpen(true);
            return;
        }

        if (!confirm(`Are you sure you want to approve this request?`)) return;

        let nextStatus = req.status;
        if (action === 'approve') {
            if (req.status === 'pending_leader') nextStatus = 'pending_manager';
            else if (req.status === 'pending_manager') nextStatus = 'approved';
        }

        await updateRequisition(req.id, {
            status: nextStatus,
            updatedAt: new Date().toISOString()
        });
    };

    const handleConfirmRejection = async () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        try {
            await updateRequisition(rejectReq.id, {
                status: 'rejected',
                rejectionReason: rejectionReason.trim(),
                updatedAt: new Date().toISOString()
            });
            setIsRejectModalOpen(false);
            setRejectReq(null);
            setRejectionReason('');
            setPinVerifiedForReject(false);
            toast.success('Request has been declined.');
        } catch (error) {
            console.error("Rejection error:", error);
        }
    };

    const confirmPinAndApprove = async () => {
        if (!pinReq || !pinReqType) return;
        if (!pinInput || pinInput.trim() === '') {
            setPinError('Please enter your PIN');
            return;
        }

        if (!userData?.approvalPin) {
            setPinError('No PIN set. Go to Settings to set your approval PIN.');
            return;
        }

        if (pinInput !== userData.approvalPin) {
            setPinError('Incorrect PIN');
            return;
        }

        // If action is reject, move to rejection reason screen
        if (pinAction === 'reject') {
            setPinVerifiedForReject(true);
            setPinInput('');
            setPinError('');
            setRejectReq(pinReq);
            setRejectionReason('');
            setIsPinModalOpen(false);
            setIsRejectModalOpen(true);
            // Keep modal open but will show rejection reason field instead of PIN field
            return;
        }

        try {
            if (pinReqType === 'requisition') {
                let nextStatus = pinReq.status;
                if (pinReq.status === 'pending_leader') nextStatus = 'pending_manager';
                else if (pinReq.status === 'pending_manager') nextStatus = 'approved';

                await updateRequisition(pinReq.id, {
                    status: nextStatus,
                    updatedAt: new Date().toISOString()
                });
            } else if (pinReqType === 'leave') {
                let updateData = {};
                const currentDate = new Date().toISOString();
                const reviewerName = `${userData?.firstName || ''} ${userData?.lastName || ''}`;

                if (role === 'team_leader' && pinReq.status === 'pending_leader') {
                    updateData = {
                        status: 'pending_manager',
                        teamLeaderApprovedBy: reviewerName,
                        teamLeaderApprovedAt: currentDate,
                        teamLeaderComments: 'Approved by Team Leader'
                    };
                } else if (role === 'manager' && pinReq.status === 'pending_manager') {
                    updateData = {
                        status: 'approved',
                        managerApprovedBy: reviewerName,
                        managerApprovedAt: currentDate,
                        finalApprovedAt: currentDate,
                        managerComments: 'Approved by Manager'
                    };
                }

                await updateLeaveRequest(pinReq.id, updateData);
            }

            // success
            setIsPinModalOpen(false);
            setPinReq(null);
            setPinReqType(null);
            setPinInput('');
            setPinError('');
        } catch (err) {
            console.error('Error approving with PIN', err);
            setPinError(err.message || 'Failed to approve');
        }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        if (!userData) return;

        try {
            const startDate = new Date(leaveFormData.startDate);
            const endDate = new Date(leaveFormData.endDate);
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

            // Determine initial status based on role
            const initialStatus = role === 'team_leader' ? 'pending_manager' : 'pending_leader';

            await addLeaveRequest({
                ...leaveFormData,
                employeeId: user?.uid,
                employeeName: `${userData.firstName || ''} ${userData.lastName || ''}`,
                companyId: userData.companyId,
                departmentId: userData.departmentId,
                department: userData.department || '',
                totalDays,
                status: initialStatus,
            });
            resetForm();
        } catch (error) {
            console.error("Error submitting leave request:", error);
        }
    };

    const handleLeaveAction = async (req, action) => {
        if (action === 'reject') {
            // Require PIN for reject for team leaders and managers
            if (role === 'team_leader' || role === 'manager') {
                if (!userData?.approvalPin) {
                    toast.error('You must set an approval PIN in Settings before declining requests.');
                    return;
                }
                setPinReq(req);
                setPinReqType('leave');
                setPinAction('reject');
                setPinInput('');
                setPinError('');
                setPinVerifiedForReject(false);
                setIsPinModalOpen(true);
                return;
            }
            // For other roles, reject without PIN
            setRejectReq(req);
            setPinVerifiedForReject(false);
            setRejectionReason('');
            setIsRejectModalOpen(true);
            return;
        }

        // Require approval PIN for team leaders and managers
        if (action === 'approve' && (role === 'team_leader' || role === 'manager')) {
            if (!userData?.approvalPin) {
                toast.error('You must set an approval PIN in Settings before approving requests.');
                return;
            }
            setPinReq(req);
            setPinReqType('leave');
            setPinAction('approve');
            setPinInput('');
            setPinError('');
            setPinVerifiedForReject(false);
            setIsPinModalOpen(true);
            return;
        }

        try {
            let updateData = {};
            const currentDate = new Date().toISOString();
            const reviewerName = `${userData?.firstName || ''} ${userData?.lastName || ''}`;

            if (action === 'approve') {
                // Team Leader approval: escalate to manager
                if (role === 'team_leader' && req.status === 'pending_leader') {
                    updateData = {
                        status: 'pending_manager',
                        teamLeaderApprovedBy: reviewerName,
                        teamLeaderApprovedAt: currentDate,
                        teamLeaderComments: 'Approved by Team Leader'
                    };
                }
                // Manager approval: final approval
                else if (role === 'manager' && req.status === 'pending_manager') {
                    updateData = {
                        status: 'approved',
                        managerApprovedBy: reviewerName,
                        managerApprovedAt: currentDate,
                        finalApprovedAt: currentDate,
                        managerComments: 'Approved by Manager'
                    };
                }
            }

            await updateLeaveRequest(req.id, updateData);
        } catch (error) {
            console.error("Error updating leave request:", error);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.5rem 0.25rem' }}>
            {/* Optimized Header Section */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                        fontWeight: 900,
                        color: '#0f172a',
                        margin: 0,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1,
                        background: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Requisitions & Leave Requests
                    </h2>
                    <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.05rem', fontWeight: 500 }}>
                        Streamline your workflow & requests
                    </p>
                </div>

                {role !== 'manager' && (
                    <button
                        className="btn-primary"
                        onClick={() => setIsFormOpen(true)}
                        style={{
                            padding: '0.875rem 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.01em',
                            fontSize: '0.95rem',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                            border: 'none',
                            color: 'white',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            flexShrink: 0
                        }}
                    >
                        <div style={{
                            width: '24px', height: '24px', borderRadius: '8px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Plus size={16} strokeWidth={3} />
                        </div>
                        New Request
                    </button>
                )}
            </header>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                borderBottom: '2px solid #f1f5f9',
                padding: '0 0.25rem',
                overflow: 'auto'
            }}>
                <button
                    onClick={() => setActiveTab('leave')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'leave' ? '2px solid #2563eb' : '2px solid transparent',
                        color: activeTab === 'leave' ? '#2563eb' : '#64748b',
                        fontWeight: activeTab === 'leave' ? 700 : 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '-2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Calendar size={18} />
                    Leave Requests
                </button>
                <button
                    onClick={() => setActiveTab('requisitions')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'none',
                        border: 'none',
                        borderBottom: activeTab === 'requisitions' ? '2px solid #2563eb' : '2px solid transparent',
                        color: activeTab === 'requisitions' ? '#2563eb' : '#64748b',
                        fontWeight: activeTab === 'requisitions' ? 700 : 500,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginBottom: '-2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <FileText size={18} />
                    Requisitions
                </button>
            </div>

            {/* Responsive Controls */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '1.25rem',
                alignItems: 'center',
                marginBottom: '2.5rem',
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 20px -5px rgba(0,0,0,0.03)'
            }}>
                <div className="search-input-wrapper" style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    flex: '1 1 400px',
                    minWidth: '280px',
                    padding: '0.75rem 0.75rem',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Search size={20} color="#94a3b8" />
                    <input
                        placeholder="Search title, requester or type..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ fontSize: '1rem', marginLeft: '12px' }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    padding: '4px',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    flex: '0 1 auto'
                }}>
                    {['all', 'pending_leader', 'pending_manager', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '0.65rem 1.25rem',
                                borderRadius: '14px',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                                border: '1px solid',
                                borderColor: filterStatus === status ? 'hsl(var(--primary))' : 'transparent',
                                backgroundColor: filterStatus === status ? 'hsl(var(--primary))' : '#f1f5f9',
                                color: filterStatus === status ? 'white' : '#64748b',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                boxShadow: filterStatus === status ? '0 8px 15px -3px rgba(99, 102, 241, 0.3)' : 'none'
                            }}
                        >
                            {status === 'all' ? 'All Requests' : status.replace('_', ' ').replace('pending ', '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid - Conditional Based on Active Tab */}
            {activeTab === 'leave' ? (
                // Leave Requests View
                visibleLeaveRequests.length === 0 ? (
                    <div style={{
                        padding: '6rem 2rem', textAlign: 'center', background: 'white', borderRadius: '24px',
                        border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#f8fafc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                            color: '#94a3b8'
                        }}>
                            <Calendar size={32} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No leave requests found</h3>
                        <p style={{ margin: 0, color: '#64748b' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {visibleLeaveRequests.map((req, idx) => (
                            <div key={req.id} style={{ animationDelay: `${idx * 0.05}s` }} className="fade-in">
                                <div onClick={() => openDetail(req, 'leave')} style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '1.5rem',
                                    border: '1px solid #f1f5f9',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
                                    transition: 'all 0.3s',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                            }}>
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                                                    {req.leaveType?.charAt(0).toUpperCase() + req.leaveType?.slice(1)} Leave
                                                </h4>
                                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                                    {req.employeeName}
                                                </p>
                                            </div>
                                        </div>
                                        <StatusBadge status={req.status} />
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Clock size={14} color="#64748b" />
                                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            Total Days:
                                            <span style={{
                                                marginLeft: '0.5rem',
                                                padding: '0.25rem 0.5rem',
                                                background: '#ee0c0cff',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                color: 'white'
                                            }}>
                                                {req.totalDays} day{req.totalDays !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        {req.reason && (
                                            <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                                                {req.reason}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons - Hierarchical Approval Logic */}
                                    {(
                                        (role === 'team_leader' && req.status === 'pending_leader') ||
                                        (role === 'manager' && req.status === 'pending_manager')
                                    ) && (
                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleLeaveAction(req, 'approve'); }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.6rem',
                                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        fontWeight: 600,
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <CheckCircle size={16} />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleLeaveAction(req, 'reject'); }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.6rem',
                                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '10px',
                                                        fontWeight: 600,
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.5rem'
                                                    }}
                                                >
                                                    <XCircle size={16} />
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                // Requisitions View (existing)
                visibleRequisitions.length === 0 ? (
                    <div style={{
                        padding: '6rem 2rem', textAlign: 'center', background: 'white', borderRadius: '24px',
                        border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '20px', backgroundColor: '#f8fafc',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
                            color: '#94a3b8'
                        }}>
                            <FileText size={32} />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No requisitions found</h3>
                        <p style={{ margin: 0, color: '#64748b' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {visibleRequisitions.map((req, idx) => (
                            <div key={req.id} style={{ animationDelay: `${idx * 0.05}s` }} className="fade-in">
                                <RequisitionCard
                                    req={req}
                                    role={role}
                                    user={user}
                                    onEdit={handleEdit}
                                    onAction={handleAction}
                                    onView={openDetail}
                                />
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Create Modal */}
            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="fade-in" style={{
                        backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
                        borderRadius: '24px', maxWidth: '550px', width: '100%', padding: '0',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255,255,255,0.5)'
                    }}>
                        <div style={{
                            padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255,255,255,0.5)'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>
                                    {activeTab === 'leave' ? 'New Leave Request' : (editingId ? 'Edit Requisition' : 'New Requisition')}
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    {activeTab === 'leave' ? 'Request time off from work' : 'Fill in the details below'}
                                </p>
                            </div>
                            <button onClick={resetForm} style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b'
                            }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={activeTab === 'leave' ? handleLeaveSubmit : handleSubmit} style={{
                            padding: '2rem',
                            maxHeight: 'calc(90vh - 100px)',
                            overflowY: 'auto'
                        }}>
                            {activeTab === 'leave' ? (
                                /* Leave Request Form */
                                <>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Leave Type</label>
                                        <select
                                            required
                                            value={leaveFormData.leaveType}
                                            onChange={e => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', appearance: 'none', background: 'white' }}
                                        >
                                            <option value="vacation">Vacation Leave</option>
                                            <option value="sick">Sick Leave</option>
                                            <option value="personal">Personal Leave</option>
                                            <option value="maternity">Maternity Leave</option>
                                            <option value="paternity">Paternity Leave</option>
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={leaveFormData.startDate}
                                                onChange={e => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>End Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={leaveFormData.endDate}
                                                onChange={e => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Reason</label>
                                        <textarea
                                            required
                                            value={leaveFormData.reason}
                                            onChange={e => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                                            placeholder="Provide a reason for your leave request..."
                                            rows={4}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'none', lineHeight: '1.6' }}
                                        />
                                    </div>
                                </>
                            ) : (
                                /* Requisition Form */
                                <>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Request Title</label>
                                        <input
                                            required
                                            className="styled-input"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. MacBook Pro M3 Upgrade"
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Request Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', appearance: 'none', background: 'white' }}
                                            >
                                                <option>Purchase Requisition</option>
                                                <option>Leave Request</option>
                                                <option>Expense Claim</option>
                                                <option>Advance Salary</option>
                                                <option>Travel Request</option>
                                                <option>Petty Cash</option>
                                                <option>Office Supplies</option>
                                                <option>Maintenance</option>
                                                <option>IT Support</option>
                                                <option>Training Request</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Estimated Amount</label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8' }}>MK</div>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={formData.amount ? parseInt(formData.amount).toLocaleString() : ''}
                                                    onChange={e => {
                                                        const numValue = e.target.value.replace(/,/g, '');
                                                        setFormData({ ...formData, amount: numValue || '' });
                                                    }}
                                                    placeholder="0"
                                                    style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 3rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Start Date</label>
                                            <input
                                                type="date"
                                                value={formData.startDate}
                                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>End Date</label>
                                            <input
                                                type="date"
                                                value={formData.endDate}
                                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Justification / Details</label>
                                        <textarea
                                            required
                                            className="styled-input"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Provide a detailed explanation for this request..."
                                            rows={4}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'none', lineHeight: '1.6' }}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Submit Buttons - Common for both forms */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={resetForm} style={{
                                    padding: '0.875rem 1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0',
                                    background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{
                                    padding: '0.875rem 2rem',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                    color: 'white',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                                }}>
                                    {activeTab === 'leave' ? 'Submit Leave Request' : (editingId ? 'Update Request' : 'Submit Requisition')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rejection Modal - PIN Entry or Reason */}
            {(isRejectModalOpen || (isPinModalOpen && pinAction === 'reject' && pinVerifiedForReject)) && (
                <div className="modal-overlay">
                    <div className="fade-in" style={{
                        backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
                        borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '0',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255,255,255,0.5)'
                    }}>
                        <div style={{
                            padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'rgba(255,255,255,0.5)'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#b91c1c' }}>
                                    Decline Request
                                </h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                                    {pinVerifiedForReject ? 'Please provide a reason for declining this request' : 'Enter your PIN to decline this request'}
                                </p>
                            </div>
                            <button onClick={() => { setIsRejectModalOpen(false); setRejectReq(null); setRejectionReason(''); setPinVerifiedForReject(false); setPinInput(''); setPinError(''); setIsPinModalOpen(false); }} style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b'
                            }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            {/* Show PIN entry for manager/team_leader */}
                            {!pinVerifiedForReject && (role === 'team_leader' || role === 'manager') ? (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        padding: '1rem', borderRadius: '12px', backgroundColor: '#f8fafc',
                                        border: '1px solid #f1f5f9', marginBottom: '1.5rem'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Request</div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{rejectReq?.title || pinReq?.title}</div>
                                    </div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Enter PIN</label>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={pinInput}
                                        onChange={(e) => { setPinInput(e.target.value.replace(/[^0-9]/g, '')); setPinError(''); }}
                                        placeholder="Enter your PIN"
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', marginBottom: '0.5rem' }}
                                        autoFocus
                                    />
                                    {pinError && <div style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem' }}>{pinError}</div>}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                        <button type="button" onClick={() => { setIsRejectModalOpen(false); setRejectReq(null); setRejectionReason(''); setPinVerifiedForReject(false); setPinInput(''); setPinError(''); setIsPinModalOpen(false); }} style={{
                                            padding: '0.875rem 1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0',
                                            background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                        }}>
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmPinAndApprove}
                                            style={{
                                                padding: '0.875rem 2rem', borderRadius: '14px', border: 'none',
                                                background: 'linear-gradient(135deg, #f59e0b, #dc2626)', color: 'white', fontWeight: 700,
                                                cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)'
                                            }}
                                        >
                                            Verify PIN
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Show Rejection Reason */
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{
                                        padding: '1rem', borderRadius: '12px', backgroundColor: '#f8fafc',
                                        border: '1px solid #f1f5f9', marginBottom: '1.5rem'
                                    }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Request</div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{rejectReq?.title}</div>
                                    </div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Reason for Declining</label>
                                    <textarea
                                        required
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        placeholder="e.g. Budget constraints, insufficient details..."
                                        rows={4}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'none', lineHeight: '1.6' }}
                                        autoFocus
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button type="button" onClick={() => { setIsRejectModalOpen(false); setRejectReq(null); setRejectionReason(''); setPinVerifiedForReject(false); setPinInput(''); setPinError(''); }} style={{
                                            padding: '0.875rem 1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0',
                                            background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                        }}>
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmRejection}
                                            style={{
                                                padding: '0.875rem 2rem', borderRadius: '14px', border: 'none',
                                                background: '#dc2626', color: 'white', fontWeight: 700,
                                                cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)'
                                            }}
                                        >
                                            Submit Decline
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal for Requisition or Leave */}
            {selectedItem && (
                <div className="modal-overlay" onClick={closeDetail}>
                    <div className="fade-in" onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)',
                        borderRadius: '20px', maxWidth: '720px', width: '100%', padding: '0',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{selectedType === 'leave' ? 'Leave Request Details' : 'Requisition Details'}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{selectedType === 'leave' ? 'Full details for this leave request' : 'Full details for this requisition'}</p>
                            </div>
                            <button onClick={closeDetail} style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Department</div>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedItem.department || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Employee</div>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedItem.employeeName || `${selectedItem.employeeFName || ''} ${selectedItem.employeeLName || ''}`.trim() || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Email</div>
                                    <div style={{ color: '#475569' }}>{employeeDetails?.email || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Phone</div>
                                    <div style={{ color: '#475569' }}>{employeeDetails?.phone || '—'}</div>
                                </div>
                            </div>

                            {selectedType === 'requisition' ? (
                                <div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Title</div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedItem.title || '—'}</div>
                                    </div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Type</div>
                                        <div style={{ color: '#475569' }}>{selectedItem.type || '—'}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Amount</div>
                                            <div style={{ fontWeight: 700 }}>{selectedItem.amount ? `MK ${parseInt(selectedItem.amount).toLocaleString()}` : '—'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Submitted</div>
                                            <div style={{ color: '#475569' }}>{selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : '—'}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Description</div>
                                        <div style={{ color: '#475569', lineHeight: 1.5 }}>{selectedItem.description || '—'}</div>
                                    </div>
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                                        <div style={{ marginTop: '6px' }}><StatusBadge status={selectedItem.status} /></div>
                                        {selectedItem.status === 'rejected' && selectedItem.rejectionReason && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'hsl(0, 100%, 98%)', borderRadius: '8px', border: '1px dashed hsl(0, 100%, 90%)' }}>
                                                <div style={{ fontWeight: 700, color: 'hsl(0, 84%, 45%)' }}>Rejection Reason</div>
                                                <div style={{ color: '#475569' }}>{selectedItem.rejectionReason}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Leave Type</div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedItem.leaveType || '—'}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Start</div>
                                            <div style={{ color: '#475569' }}>{selectedItem.startDate ? new Date(selectedItem.startDate).toLocaleDateString() : '—'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>End</div>
                                            <div style={{ color: '#475569' }}>{selectedItem.endDate ? new Date(selectedItem.endDate).toLocaleDateString() : '—'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Days</div>
                                            <div style={{ color: '#475569' }}>{selectedItem.totalDays || '—'}</div>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Reason</div>
                                        <div style={{ color: '#475569', lineHeight: 1.5 }}>{selectedItem.reason || '—'}</div>
                                    </div>
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Status</div>
                                        <div style={{ marginTop: '6px' }}><StatusBadge status={selectedItem.status} /></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PIN Modal for Approvals */}
            {isPinModalOpen && (
                <div className="modal-overlay" onClick={() => { setIsPinModalOpen(false); setPinReq(null); setPinReqType(null); setPinError(''); }}>
                    <div className="fade-in" onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)',
                        borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '0',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>Enter Approval PIN</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Confirm your identity to complete this approval.</p>
                            </div>
                            <button onClick={() => { setIsPinModalOpen(false); setPinReq(null); setPinReqType(null); setPinError(''); }} style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '1.25rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={pinInput}
                                    onChange={(e) => { setPinInput(e.target.value.replace(/[^0-9]/g, '')); setPinError(''); }}
                                    placeholder="Enter PIN"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                />
                                {pinError && <div style={{ color: '#dc2626', marginTop: '8px', fontSize: '0.9rem' }}>{pinError}</div>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button onClick={() => { setIsPinModalOpen(false); setPinReq(null); setPinReqType(null); setPinError(''); }} style={{ padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#475569' }}>Cancel</button>
                                <button onClick={confirmPinAndApprove} style={{ padding: '0.7rem 1rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700 }}>Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requisitions;