
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Search, CheckCircle, XCircle, Clock, FileText, Ban, Check, DollarSign, Plane, Wallet, Package, Wrench, Monitor, GraduationCap, Calendar, Download, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const StatusBadge = ({ status }) => {
    const styles = {
        pending_supervisor: {
            bg: 'hsl(214, 100%, 97%)',
            color: 'hsl(214, 95%, 45%)',
            border: 'hsl(214, 90%, 90%)',
            label: 'Pending Supervisor'
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
        declined: {
            bg: 'hsl(0, 100%, 97%)',
            color: 'hsl(0, 84%, 45%)',
            border: 'hsl(0, 100%, 90%)',
            label: 'Declined'
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
            border: `1px solid ${s.border} `,
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

            {/* Signature Status Indicators */}
            <div style={{ marginTop: '0.25rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(() => {
                    const isSupSigned = req.status === 'pending_manager' || req.status === 'approved';
                    const isMgrSigned = req.status === 'approved';

                    return (
                        <>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '0.7rem', fontWeight: 600,
                                color: isSupSigned ? '#059669' : '#94a3b8',
                                padding: '2px 8px', borderRadius: '4px',
                                background: isSupSigned ? '#ecfdf5' : '#f1f5f9',
                                border: '1px solid', borderColor: isSupSigned ? '#a7f3d0' : '#e2e8f0'
                            }}>
                                {isSupSigned ? <CheckCircle size={10} /> : <Circle size={10} />} Supervisor
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '0.7rem', fontWeight: 600,
                                color: isMgrSigned ? '#059669' : '#94a3b8',
                                padding: '2px 8px', borderRadius: '4px',
                                background: isMgrSigned ? '#ecfdf5' : '#f1f5f9',
                                border: '1px solid', borderColor: isMgrSigned ? '#a7f3d0' : '#e2e8f0'
                            }}>
                                {isMgrSigned ? <CheckCircle size={10} /> : <Circle size={10} />} Manager
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Decline Reason Display */}
            {req.status === 'declined' && req.declineReason && (
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    backgroundColor: 'hsl(0, 100%, 98%)',
                    border: '1px dashed hsl(0, 100%, 90%)',
                    fontSize: '0.85rem'
                }}>
                    <div style={{ fontWeight: 700, color: 'hsl(0, 84%, 45%)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={12} /> Decline Reason
                    </div>
                    <p style={{ margin: 0, color: 'hsl(0, 50%, 40%)', fontStyle: 'italic' }}>
                        "{req.declineReason}"
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
                        {req.amount ? `MK ${parseInt(req.amount).toLocaleString()} ` : '—'}
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
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                {/* Supervisor Actions */}
                {role === 'supervisor' && req.status === 'pending_supervisor' && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction(req, 'approve'); }}
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
                            title="Approve"
                        >
                            <CheckCircle size={16} />
                            Approve
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction(req, 'reject'); }}
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
                            title="Decline"
                        >
                            <XCircle size={16} />
                            Decline
                        </button>
                    </>
                )}

                {/* Manager Actions */}
                {role === 'manager' && req.status === 'pending_manager' && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction(req, 'approve'); }}
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
                            onClick={(e) => { e.stopPropagation(); onAction(req, 'reject'); }}
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
                            Decline
                        </button>
                    </>
                )}

                {/* Employee Edit */}
                {isOwner && req.status === 'pending_supervisor' && (
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

                {/* Download PDF */}
                <button
                    onClick={(e) => { e.stopPropagation(); onAction(req, 'download'); }}
                    style={{
                        padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0',
                        background: 'white', color: '#2563eb', fontSize: '0.85rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                    }}
                    title="Download PDF"
                >
                    <Download size={16} />
                    PDF
                </button>
            </div>
        </div>
    );
};

const Requisitions = () => {
    const { requisitions, addRequisition, updateRequisition, leaveRequests, addLeaveRequest, updateLeaveRequest, userData, user, employees, companies } = useApp();
    const [activeTab, setActiveTab] = useState('leave'); // 'requisitions' or 'leave'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReq, setRejectReq] = useState(null);
    const [declineReason, setDeclineReason] = useState('');
    const [pinVerifiedForReject, setPinVerifiedForReject] = useState(false); // Track if PIN was verified for decline
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // PIN modal state for approvals and declines
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinReq, setPinReq] = useState(null); // the request being approved/declined
    const [pinReqType, setPinReqType] = useState(null); // 'requisition' or 'leave'
    const [pinAction, setPinAction] = useState(null); // 'approve' or 'decline'
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');

    // E-Signature modal state
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    // Removed signatureCanvas state to prevent re-renders
    const [signatureData, setSignatureData] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const signatureRef = React.useRef(null);

    // Initialize canvas when modal opens
    useEffect(() => {
        if (isSignatureModalOpen && signatureRef.current) {
            const canvas = signatureRef.current;
            const ctx = canvas.getContext('2d');
            // Check if already drawn to avoid clearing on minor updates if needed, 
            // but for now we just want to ensure white background on open.
            // If we want to persist across close/open we would check signatureData.
            // But usually we want a fresh start or the saved image. 
            // Here we just ensure white bg.

            // Only fill if it looks "empty" or just always fill on open?
            // The issue was it was clearing on every render (mouseup). 
            // This Effect runs only when modal open state changes.
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [isSignatureModalOpen]);

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
        } else {
            // If not found in employees list, try to fetch from leave/requisition data
            setEmployeeDetails({ email: selectedItem.email || '', phone: selectedItem.phone || '' });
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
        if (role === 'supervisor') return req.companyId === userData?.companyId && req.departmentId === userData?.departmentId;
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
        if (role === 'supervisor') return req.companyId === userData?.companyId && req.departmentId === userData?.departmentId;
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

    // Calculate badge counts for tabs (only pending items)
    const getPendingLeaveCount = () => {
        const pendingStatus = role === 'manager' ? 'pending_manager' : 'pending_supervisor';
        return leaveRequests.filter(req => {
            if (role === 'admin') return req.status === pendingStatus;
            if (role === 'manager') return req.companyId === userData?.companyId && req.status === pendingStatus;
            if (role === 'supervisor') return req.companyId === userData?.companyId && req.departmentId === userData?.departmentId && req.status === pendingStatus;
            if (role === 'employee') return req.employeeId === user?.uid && req.status === pendingStatus;
            return false;
        }).length;
    };

    const getPendingRequisitionCount = () => {
        const pendingStatus = role === 'manager' ? 'pending_manager' : 'pending_supervisor';
        return requisitions.filter(req => {
            if (role === 'admin') return req.status === pendingStatus;
            if (role === 'manager') return req.companyId === userData?.companyId && req.status === pendingStatus;
            if (role === 'supervisor') return req.companyId === userData?.companyId && req.departmentId === userData?.departmentId && req.status === pendingStatus;
            if (role === 'employee') return req.employeeId === user?.uid && req.status === pendingStatus;
            return false;
        }).length;
    };

    const pendingLeaveCount = getPendingLeaveCount();
    const pendingRequisitionCount = getPendingRequisitionCount();

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
                const initialStatus = role === 'supervisor' ? 'pending_manager' : 'pending_supervisor';

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
            toast.success(editingId ? 'Requisition updated successfully' : 'Requisition submitted successfully');
        } catch (error) {
            console.error("Submission error:", error);
        }
    };

    const handleAction = async (req, action) => {
        // Handle PDF download
        if (action === 'download') {
            await generatePDF(req, 'requisition');
            return;
        }

        // Require PIN for both approve and reject for supervisors and managers
        if ((action === 'approve' || action === 'reject') && (role === 'supervisor' || role === 'manager')) {
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
            setDeclineReason('');
            setIsRejectModalOpen(true);
            return;
        }

        if (!confirm(`Are you sure you want to approve this request ? `)) return;

        let nextStatus = req.status;
        if (action === 'approve') {
            if (req.status === 'pending_supervisor') nextStatus = 'pending_manager';
            else if (req.status === 'pending_manager') nextStatus = 'approved';
        }

        await updateRequisition(req.id, {
            status: nextStatus,
            updatedAt: new Date().toISOString()
        });
    };

    const handleConfirmDecline = async () => {
        if (!declineReason.trim()) {
            alert("Please provide a reason for decline.");
            return;
        }

        try {
            const declineData = {
                status: 'declined',
                declineReason: declineReason.trim(),
                updatedAt: new Date().toISOString()
            };

            // Use pinReqType if available (from PIN verification), otherwise check rejectReq type
            const isLeaveRequest = pinReqType === 'leave' || rejectReq.type === 'leave request';

            if (isLeaveRequest) {
                await updateLeaveRequest(rejectReq.id, declineData);
            } else {
                await updateRequisition(rejectReq.id, declineData);
            }

            setIsRejectModalOpen(false);
            setRejectReq(null);
            setDeclineReason('');
            setPinVerifiedForReject(false);
            const typeLabel = isLeaveRequest ? 'Leave request' : 'Requisition';
            toast.success(`${typeLabel} declined successfully.`);
        } catch (error) {
            console.error("Decline error:", error);
            toast.error('Failed to decline request. Please try again.');
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

        // If action is reject, move to decline reason screen
        if (pinAction === 'reject') {
            setPinVerifiedForReject(true);
            setPinInput('');
            setPinError('');
            setRejectReq(pinReq);
            setDeclineReason('');
            setIsPinModalOpen(false);
            setIsRejectModalOpen(true);
            // Keep modal open but will show decline reason field instead of PIN field
            return;
        }

        // If action is approve, show e-signature modal
        if (pinAction === 'approve') {
            setPinInput('');
            setPinError('');
            setIsPinModalOpen(false);
            setSignatureData(null);
            setIsDrawing(false);
            // Short timeout to ensure modal is closed before opening signature modal
            setTimeout(() => {
                setIsSignatureModalOpen(true);
            }, 100);
            return;
        }
    };

    const handleSignatureComplete = async () => {
        if (!signatureData) {
            alert('Please provide your signature');
            return;
        }

        try {
            if (pinReqType === 'requisition') {
                let nextStatus = pinReq.status;
                if (pinReq.status === 'pending_supervisor') nextStatus = 'pending_manager';
                else if (pinReq.status === 'pending_manager') nextStatus = 'approved';

                await updateRequisition(pinReq.id, {
                    status: nextStatus,
                    signature: signatureData,
                    signedBy: `${userData?.firstName || ''} ${userData?.lastName || ''} `,
                    signedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else if (pinReqType === 'leave') {
                let updateData = {};
                const currentDate = new Date().toISOString();
                const reviewerName = `${userData?.firstName || ''} ${userData?.lastName || ''} `;

                if (role === 'supervisor' && pinReq.status === 'pending_supervisor') {
                    updateData = {
                        status: 'pending_manager',
                        supervisorApprovedBy: reviewerName,
                        supervisorApprovedAt: currentDate,
                        supervisorComments: 'Approved by Supervisor',
                        supervisorSignature: signatureData
                    };
                } else if (role === 'manager' && pinReq.status === 'pending_manager') {
                    updateData = {
                        status: 'approved',
                        managerApprovedBy: reviewerName,
                        managerApprovedAt: currentDate,
                        finalApprovedAt: currentDate,
                        managerComments: 'Approved by Manager',
                        managerSignature: signatureData
                    };
                }

                await updateLeaveRequest(pinReq.id, updateData);
            }

            // Close signature modal and reset states
            setIsSignatureModalOpen(false);
            setSignatureData(null);
            setPinReq(null);
            setPinReqType(null);
            setPinAction(null);
            toast.success('Request approved and signed successfully.');
        } catch (err) {
            console.error('Error completing approval with signature', err);
            toast.error('Failed to complete approval. Please try again.');
        }
    };

    const handleSignatureClear = () => {
        const canvas = signatureRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setSignatureData(null);
        }
    };

    const getCanvasCoordinates = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const handleSignatureDraw = (e) => {
        const canvas = signatureRef.current;
        if (!canvas) return;
        e.preventDefault();

        const { x, y } = getCanvasCoordinates(e, canvas);
        const ctx = canvas.getContext('2d');

        if (e.type === 'mousedown' || e.type === 'touchstart') {
            setIsDrawing(true);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        } else if ((e.type === 'mousemove' || e.type === 'touchmove') && isDrawing) {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (e.type === 'mouseup' || e.type === 'touchend') {
            if (isDrawing) {
                setIsDrawing(false);
                // Save signature as data URL
                const dataUrl = canvas.toDataURL('image/png');
                setSignatureData(dataUrl);
            }
        }
    };

    const generatePDF = async (item, type) => {
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;

            // Get active company
            const activeCompany = companies.find(c => c.id === userData?.companyId) || {};
            const companyName = activeCompany.name || 'ApexSpace';
            const companyLogo = activeCompany.logoUrl; // Could be URL or Base64 (if proxied)
            const companyAddress = activeCompany.address || '123 Business Avenue, Lilongwe';
            const companyEmail = activeCompany.email || 'support@apexspace.com';
            // Extract phone if available or use default
            const companyPhone = activeCompany.phone || '+265 999 123 456';

            const colors = {
                orange: [214, 110, 15],
                navy: [15, 23, 42],
                slate: [100, 116, 139],
                bg: [248, 250, 252]
            };

            // --- 1. HEADER GRAPHICS (The Diagonal Swishes) ---
            // Large Orange Triangle (Background)
            doc.setFillColor(...colors.orange);
            doc.triangle(0, 0, 90, 0, 0, 65, 'F');

            // Smaller Navy Triangle (Overlapping)
            doc.setFillColor(...colors.navy);
            doc.triangle(0, 0, 50, 0, 0, 45, 'F');

            // --- 2. COMPANY BRANDING ---
            let yPos = 30;

            // Logo Icon 
            if (companyLogo) {
                try {
                    // Attempt to add real logo
                    // Note: jsPDF addImage typically needs a Base64 string for better compatibility, 
                    // or a proxy if it's a remote URL to avoid CORS. 
                    // For now, assuming standard addImage behavior for image URLs or if it's pre-fetched.
                    doc.addImage(companyLogo, 'JPEG', margin, yPos - 8, 12, 12);
                } catch (err) {
                    // Fallback to circle
                    doc.setFillColor(...colors.orange);
                    doc.circle(margin + 5, yPos - 2, 4, 'F');
                }
            } else {
                // Fallback to circle
                doc.setFillColor(...colors.orange);
                doc.circle(margin + 5, yPos - 2, 4, 'F');
            }

            doc.setFontSize(22);
            doc.setTextColor(...colors.navy);
            doc.setFont('helvetica', 'bold');
            doc.text(companyName, margin + 15, yPos);

            // Header Info (Right Aligned)
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...colors.slate);
            const rightAlign = pageWidth - margin;

            let headerY = yPos - 5;
            const headerLineHeight = 5;

            // Prepare header lines: Split address by comma/newline for better stacking
            const addressLines = companyAddress ? companyAddress.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) : [];
            const headerInfo = [
                ...addressLines,
                companyEmail,
                companyPhone
            ].filter(Boolean);

            headerInfo.forEach(text => {
                doc.text(text, rightAlign, headerY, { align: 'right' });
                headerY += headerLineHeight;
            });

            // Adjust yPos based on actual header height if needed, 
            // though the next section starts at yPos += 35 which is relative to the *initial* yPos (30).
            // Initial yPos was 30. We started drawing at 25.
            // If we have many lines (e.g. 5 lines), max Y would be 25 + 20 = 45.
            // Next section starts at yPos (30) + 35 = 65.
            // So 45 is well clear of 65. We are safe.

            yPos += 35;

            // --- 3. DOCUMENT TITLE ---
            doc.setFillColor(...colors.navy);
            doc.rect(margin, yPos, 4, 12, 'F'); // Vertical accent bar

            doc.setFontSize(18);
            doc.setTextColor(...colors.navy);
            doc.setFont('helvetica', 'bold');
            const title = type === 'leave' ? 'LEAVE REQUEST' : 'PURCHASE REQUISITION';
            doc.text(title, margin + 8, yPos + 9);

            // Date Label
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const dateStr = new Date().toLocaleDateString();
            doc.text(`DATE: ${dateStr} `, rightAlign, yPos + 9, { align: 'right' });

            yPos += 20;

            // --- 4. DATA SECTION ---
            // Calculate Box Height based on content
            let boxHeight = 60;
            if (item.reason || item.description) boxHeight += 20;

            doc.setFillColor(...colors.bg);
            doc.roundedRect(margin, yPos, pageWidth - (margin * 2), boxHeight, 2, 2, 'F');

            doc.setFontSize(10);
            let rowY = yPos + 12;
            const col1X = margin + 5;
            const col2X = pageWidth / 2 + 10;

            const addRow = (label, value, x, y) => {
                doc.setTextColor(...colors.slate);
                doc.setFont('helvetica', 'bold');
                doc.text(label, x, y);
                doc.setTextColor(...colors.navy);
                doc.setFont('helvetica', 'normal');
                doc.text(String(value), x + 35, y);
            };

            if (type === 'leave') {
                // Row 1
                addRow('EMPLOYEE', item.employeeName || 'N/A', col1X, rowY);
                addRow('DEPT', item.department || 'N/A', col2X, rowY);
                rowY += 10;

                // Row 2
                addRow('LEAVE TYPE', item.leaveType?.toUpperCase() || 'N/A', col1X, rowY);
                addRow('STATUS', item.status?.toUpperCase() || 'PENDING', col2X, rowY);
                rowY += 10;

                // Row 3
                addRow('START DATE', new Date(item.startDate).toLocaleDateString(), col1X, rowY);
                addRow('END DATE', new Date(item.endDate).toLocaleDateString(), col2X, rowY);
                rowY += 10;

                // Row 4
                addRow('TOTAL DAYS', `${item.totalDays} Day(s)`, col1X, rowY);
                if (item.remainingDays !== undefined) {
                    addRow('REMAINING', `${item.remainingDays} Day(s)`, col2X, rowY);
                } else {
                    // If remaining days not in item, show APPLIED DATE instead
                    addRow('APPLIED ON', item.requestedAt ? new Date(item.requestedAt).toLocaleDateString() : '—', col2X, rowY);
                }
                rowY += 10;

                // Reason Section
                if (item.reason) {
                    doc.setDrawColor(226, 232, 240);
                    doc.line(margin + 5, rowY, pageWidth - margin - 5, rowY);
                    rowY += 8;

                    doc.setTextColor(...colors.slate);
                    doc.setFont('helvetica', 'bold');
                    doc.text('REASON:', col1X, rowY);

                    doc.setTextColor(...colors.navy);
                    doc.setFont('helvetica', 'normal');
                    const reasonText = doc.splitTextToSize(item.reason, pageWidth - (margin * 2) - 30);
                    doc.text(reasonText, col1X + 25, rowY);
                }

            } else {
                // Requisition Layout
                // Row 1
                addRow('REQUESTER', `${item.employeeFName} ${item.employeeLName} `, col1X, rowY);
                addRow('DEPT', item.department || 'N/A', col2X, rowY);
                rowY += 10;

                // Row 2
                addRow('CATEGORY', item.type || 'General', col1X, rowY);
                addRow('STATUS', item.status?.toUpperCase() || 'PENDING', col2X, rowY);
                rowY += 10;

                // Row 3
                addRow('AMOUNT', `MK ${parseInt(item.amount).toLocaleString()} `, col1X, rowY);
                addRow('APPLIED ON', item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—', col2X, rowY);
                rowY += 10;

                // Description Section
                if (item.description) {
                    doc.setDrawColor(226, 232, 240);
                    doc.line(margin + 5, rowY, pageWidth - margin - 5, rowY);
                    rowY += 8;

                    doc.setTextColor(...colors.slate);
                    doc.setFont('helvetica', 'bold');
                    doc.text('DESC:', col1X, rowY);

                    doc.setTextColor(...colors.navy);
                    doc.setFont('helvetica', 'normal');
                    const descText = doc.splitTextToSize(item.description, pageWidth - (margin * 2) - 30);
                    doc.text(descText, col1X + 25, rowY);
                }
            }

            yPos += boxHeight + 20;

            // --- 5. AUTHORIZATION ---
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...colors.orange);
            doc.text('OFFICIAL AUTHORIZATION', margin, yPos);
            doc.line(margin, yPos + 2, margin + 40, yPos + 2);

            yPos += 12;

            if (type === 'leave') {
                // --- Dual Signatures for Leave ---
                const supX = margin;
                const mgrX = pageWidth / 2 + 10;
                const boxWidth = 80;
                const boxHeight = 40;

                // Supervisor Box
                doc.setDrawColor(230, 230, 230);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(supX, yPos, boxWidth, boxHeight, 2, 2, 'FD');

                doc.setFontSize(7);
                doc.setTextColor(...colors.slate);
                doc.text('SUPERVISOR APPROVAL', supX + 5, yPos + 8);

                if (item.supervisorSignature) {
                    try {
                        doc.addImage(item.supervisorSignature, 'PNG', supX + 5, yPos + 10, 35, 18);
                    } catch { }
                }

                doc.setFontSize(9);
                doc.setTextColor(...colors.navy);
                doc.setFont('helvetica', 'bold');
                doc.text(item.supervisorApprovedBy || 'Pending', supX + 5, yPos + 32);

                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...colors.slate);
                if (item.supervisorApprovedAt) {
                    doc.text(new Date(item.supervisorApprovedAt).toLocaleDateString(), supX + 5, yPos + 37);
                }


                // Manager Box
                doc.setDrawColor(230, 230, 230);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(mgrX, yPos, boxWidth, boxHeight, 2, 2, 'FD');

                doc.setFontSize(7);
                doc.setTextColor(...colors.slate);
                doc.text('MANAGER APPROVAL', mgrX + 5, yPos + 8);

                if (item.managerSignature) {
                    try {
                        doc.addImage(item.managerSignature, 'PNG', mgrX + 5, yPos + 10, 35, 18);
                    } catch { }
                }

                doc.setFontSize(9);
                doc.setTextColor(...colors.navy);
                doc.setFont('helvetica', 'bold');
                doc.text(item.managerApprovedBy || 'Pending', mgrX + 5, yPos + 32);

                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...colors.slate);
                if (item.managerApprovedAt) {
                    doc.text(new Date(item.managerApprovedAt).toLocaleDateString(), mgrX + 5, yPos + 37);
                }

            } else {
                // --- Single Signature for Requisitions ---
                const boxWidth = 90;
                const boxHeight = 40;

                doc.setDrawColor(230, 230, 230);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(margin, yPos, boxWidth, boxHeight, 2, 2, 'FD');

                doc.setFontSize(7);
                doc.setTextColor(...colors.slate);
                doc.text('AUTHORIZED BY', margin + 5, yPos + 8);

                if (item.signature) {
                    try {
                        doc.addImage(item.signature, 'PNG', margin + 5, yPos + 10, 35, 18);
                    } catch { }
                }

                doc.setFontSize(9);
                doc.setTextColor(...colors.navy);
                doc.setFont('helvetica', 'bold');
                doc.text(item.signedBy || 'Pending', margin + 5, yPos + 32);

                doc.setFontSize(7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...colors.slate);
                if (item.signedAt) {
                    doc.text(new Date(item.signedAt).toLocaleDateString(), margin + 5, yPos + 37);
                }
            }

            // --- 6. FOOTER GRAPHICS ---
            // Large Orange Triangle (Bottom Right)
            doc.setFillColor(...colors.orange);
            doc.triangle(pageWidth, pageHeight, pageWidth - 80, pageHeight, pageWidth, pageHeight - 60, 'F');

            // Smaller Navy Triangle (Bottom Right)
            doc.setFillColor(...colors.navy);
            doc.triangle(pageWidth, pageHeight, pageWidth - 45, pageHeight, pageWidth, pageHeight - 35, 'F');

            // Footer Text
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text('ApexSpace Solutions', pageWidth - 10, pageHeight - 8, { align: 'right' });

            doc.save(`${type} -${item.id.substring(0, 6)}.pdf`);
        } catch (error) {
            console.error("PDF Error:", error);
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
            const initialStatus = role === 'supervisor' ? 'pending_manager' : 'pending_supervisor';

            await addLeaveRequest({
                ...leaveFormData,
                employeeId: user?.uid,
                employeeName: `${userData.firstName || ''} ${userData.lastName || ''} `,
                companyId: userData.companyId,
                departmentId: userData.departmentId,
                department: userData.department || '',
                totalDays,
                status: initialStatus,
            });
            resetForm();
            toast.success('Leave request submitted successfully');
        } catch (error) {
            console.error("Error submitting leave request:", error);
        }
    };

    const handleLeaveAction = async (req, action) => {
        if (action === 'reject') {
            // Require PIN for reject for supervisors and managers
            if (role === 'supervisor' || role === 'manager') {
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
            setDeclineReason('');
            setIsRejectModalOpen(true);
            return;
        }

        // Require approval PIN for supervisors and managers
        if (action === 'approve' && (role === 'supervisor' || role === 'manager')) {
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
            const reviewerName = `${userData?.firstName || ''} ${userData?.lastName || ''} `;

            if (action === 'approve') {
                // Supervisor approval: escalate to manager
                if (role === 'supervisor' && req.status === 'pending_supervisor') {
                    updateData = {
                        status: 'pending_manager',
                        supervisorApprovedBy: reviewerName,
                        supervisorApprovedAt: currentDate,
                        supervisorComments: 'Approved by Supervisor'
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
                    Leave Requests {pendingLeaveCount > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{pendingLeaveCount}</span>}
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
                    Requisitions {pendingRequisitionCount > 0 && <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{pendingRequisitionCount}</span>}
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
                    {['all', 'pending_supervisor', 'pending_manager', 'approved', 'declined'].map(status => (
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
                            <div key={req.id} style={{ animationDelay: `${idx * 0.05} s` }} className="fade-in">
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

                                        {/* Signature Status Indicators */}
                                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {(() => {
                                                const isSupSigned = !!req.supervisorSignature || req.status === 'pending_manager' || req.status === 'approved';
                                                const isMgrSigned = !!req.managerSignature || req.status === 'approved';

                                                return (
                                                    <>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            fontSize: '0.7rem', fontWeight: 600,
                                                            color: isSupSigned ? '#059669' : '#94a3b8',
                                                            padding: '2px 8px', borderRadius: '4px',
                                                            background: isSupSigned ? '#ecfdf5' : '#f1f5f9',
                                                            border: '1px solid', borderColor: isSupSigned ? '#a7f3d0' : '#e2e8f0'
                                                        }}>
                                                            {isSupSigned ? <CheckCircle size={10} /> : <Circle size={10} />} Supervisor
                                                        </div>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: '4px',
                                                            fontSize: '0.7rem', fontWeight: 600,
                                                            color: isMgrSigned ? '#059669' : '#94a3b8',
                                                            padding: '2px 8px', borderRadius: '4px',
                                                            background: isMgrSigned ? '#ecfdf5' : '#f1f5f9',
                                                            border: '1px solid', borderColor: isMgrSigned ? '#a7f3d0' : '#e2e8f0'
                                                        }}>
                                                            {isMgrSigned ? <CheckCircle size={10} /> : <Circle size={10} />} Manager
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Decline Reason Display */}
                                    {req.status === 'declined' && req.declineReason && (
                                        <div style={{
                                            padding: '0.75rem',
                                            borderRadius: '10px',
                                            backgroundColor: 'hsl(0, 100%, 98%)',
                                            border: '1px dashed hsl(0, 100%, 90%)',
                                            fontSize: '0.85rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <div style={{ fontWeight: 700, color: 'hsl(0, 84%, 45%)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <XCircle size={12} /> Decline Reason
                                            </div>
                                            <p style={{ margin: 0, color: 'hsl(0, 50%, 40%)', fontStyle: 'italic' }}>
                                                "{req.declineReason}"
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons - Hierarchical Approval Logic */}
                                    {(
                                        (role === 'supervisor' && req.status === 'pending_supervisor') ||
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
                                                    Decline
                                                </button>
                                            </div>
                                        )}

                                    {/* Download PDF Button */}
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); generatePDF(req, 'leave'); }}
                                            style={{
                                                flex: 1,
                                                padding: '0.6rem',
                                                background: 'white',
                                                color: '#2563eb',
                                                border: '1px solid #e2e8f0',
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
                                            <Download size={16} />
                                            Download PDF
                                        </button>
                                    </div>
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
                            <div key={req.id} style={{ animationDelay: `${idx * 0.05} s` }} className="fade-in">
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

            {/* Decline Modal - PIN Entry or Reason */}
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
                            <button onClick={() => { setIsRejectModalOpen(false); setRejectReq(null); setDeclineReason(''); setPinVerifiedForReject(false); setPinInput(''); setPinError(''); setIsPinModalOpen(false); }} style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b'
                            }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            {/* Show PIN entry for manager/supervisor */}
                            {!pinVerifiedForReject && (role === 'supervisor' || role === 'manager') ? (
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
                                        <button type="button" onClick={() => { setIsRejectModalOpen(false); setRejectReq(null); setDeclineReason(''); setPinVerifiedForReject(false); setPinInput(''); setPinError(''); setIsPinModalOpen(false); }} style={{
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
                                /* Show Decline Reason */
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
                                        value={declineReason}
                                        onChange={e => setDeclineReason(e.target.value)}
                                        placeholder="e.g. Budget constraints, insufficient details..."
                                        rows={4}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'none', lineHeight: '1.6' }}
                                        autoFocus
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                        <button type="button" onClick={() => { setIsRejectModalOpen(false); setRejectReq(null); setDeclineReason(''); setPinVerifiedForReject(false); setPinInput(''); setPinError(''); }} style={{
                                            padding: '0.875rem 1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0',
                                            background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                        }}>
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmDecline}
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
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedItem.employeeName || `${selectedItem.employeeFName || ''} ${selectedItem.employeeLName || ''} `.trim() || '—'}</div>
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
                                            <div style={{ fontWeight: 700 }}>{selectedItem.amount ? `MK ${parseInt(selectedItem.amount).toLocaleString()} ` : '—'}</div>
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
                                        {selectedItem.status === 'declined' && selectedItem.declineReason && (
                                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'hsl(0, 100%, 98%)', borderRadius: '8px', border: '1px dashed hsl(0, 100%, 90%)' }}>
                                                <div style={{ fontWeight: 700, color: 'hsl(0, 84%, 45%)' }}>Decline Reason</div>
                                                <div style={{ color: '#475569' }}>{selectedItem.declineReason}</div>
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
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>Enter PIN</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Confirm your identity to complete this action.</p>
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

            {/* E-Signature Modal */}
            {isSignatureModalOpen && (
                <div className="modal-overlay" onClick={() => {
                    setIsSignatureModalOpen(false);
                    setPinReq(null);
                    setPinReqType(null);
                    setPinAction(null);
                    setSignatureData(null);
                    setIsDrawing(false);
                }}>
                    <div className="fade-in" onClick={(e) => e.stopPropagation()} style={{
                        backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(12px)',
                        borderRadius: '20px', maxWidth: '600px', width: '95%', padding: '0',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>E-Signature Required</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Please sign to confirm your approval</p>
                            </div>
                            <button onClick={() => {
                                setIsSignatureModalOpen(false);
                                setPinReq(null);
                                setPinReqType(null);
                                setPinAction(null);
                                setSignatureData(null);
                                setIsDrawing(false);
                            }} style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1rem' }}>
                                    <strong>Signing as:</strong> {userData?.firstName} {userData?.lastName}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                                    {pinReqType === 'leave' ? 'Leave Request' : 'Requisition'} Approval - {new Date().toLocaleDateString()}
                                </p>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>Your Signature</label>
                                <canvas
                                    ref={signatureRef}
                                    onMouseDown={handleSignatureDraw}
                                    onMouseMove={handleSignatureDraw}
                                    onMouseUp={handleSignatureDraw}
                                    onTouchStart={handleSignatureDraw}
                                    onTouchMove={handleSignatureDraw}
                                    onTouchEnd={handleSignatureDraw}
                                    width={550}
                                    height={180}
                                    style={{
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        cursor: 'crosshair',
                                        backgroundColor: 'white',
                                        display: 'block',
                                        width: '100%',
                                        height: '180px',
                                        touchAction: 'none'
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                    Sign above using your mouse or finger
                                </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSignatureClear();
                                        setIsDrawing(false);
                                    }}
                                    style={{
                                        padding: '0.875rem 1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0',
                                        background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignatureModalOpen(false);
                                        setPinReq(null);
                                        setPinReqType(null);
                                        setPinAction(null);
                                        setSignatureData(null);
                                        setIsDrawing(false);
                                    }}
                                    style={{
                                        padding: '0.875rem 1.75rem', borderRadius: '14px', border: '1px solid #e2e8f0',
                                        background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSignatureComplete}
                                    style={{
                                        padding: '0.875rem 2rem', borderRadius: '14px', border: 'none',
                                        background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 700,
                                        cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                                    }}
                                >
                                    Sign & Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Requisitions;