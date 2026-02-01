import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, X, Search, FileText, Download, Send, Trash2, Eye, PlusCircle, MinusCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
    const styles = {
        draft: { bg: 'hsl(214, 100%, 97%)', color: 'hsl(214, 95%, 45%)', border: 'hsl(214, 90%, 90%)', label: 'Draft' },
        submitted: { bg: 'hsl(35, 100%, 97%)', color: 'hsl(35, 90%, 45%)', border: 'hsl(35, 90%, 90%)', label: 'Submitted' },
        paid: { bg: 'hsl(142, 70%, 97%)', color: 'hsl(142, 72%, 29%)', border: 'hsl(142, 70%, 90%)', label: 'Paid' },
    };

    const s = styles[status?.toLowerCase()] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: status };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '12px',
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', backgroundColor: s.bg,
            color: s.color, border: `1px solid ${s.border}`, letterSpacing: '0.025em'
        }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.color }}></div>
            {s.label}
        </span>
    );
};

const Invoices = () => {
    const { invoices, addInvoice, updateInvoice, deleteInvoice, userData, user, companies } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [formData, setFormData] = useState({
        clientName: '',
        invoiceDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        notes: '',
        taxRate: 16
    });

    const role = userData?.role?.toLowerCase() || 'employee';

    const visibleInvoices = invoices.filter(inv => {
        if (role === 'admin') return true;
        if (role === 'manager' || role === 'supervisor' || role === 'finance_manager') {
            return (inv.companyId === userData?.companyId && inv.status !== 'Draft') || inv.employeeId === user?.uid;
        }
        if (role === 'employee') return inv.employeeId === user?.uid;
        return false;
    }).filter(inv => {
        if (filterStatus !== 'all' && inv.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
        const search = searchTerm.toLowerCase();
        return inv.clientName?.toLowerCase().includes(search) || inv.invoiceNumber?.toLowerCase().includes(search);
    });

    const resetForm = () => {
        setFormData({
            clientName: '',
            invoiceDate: format(new Date(), 'yyyy-MM-dd'),
            dueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            items: [{ description: '', quantity: 1, unitPrice: 0 }],
            notes: '',
            taxRate: 16
        });
        setEditingId(null);
        setIsModalOpen(false);
    };

    const handleAddItem = () => {
        setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }] });
    };

    const handleRemoveItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const calculateSubtotal = (items) => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const calculateTax = (subtotal, rate) => (subtotal * rate) / 100;
    const calculateTotal = (subtotal, tax) => subtotal + tax;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                subtotal: calculateSubtotal(formData.items),
                taxAmount: calculateTax(calculateSubtotal(formData.items), formData.taxRate),
                total: calculateTotal(calculateSubtotal(formData.items), calculateTax(calculateSubtotal(formData.items), formData.taxRate)),
                employeeId: user.uid,
                employeeName: `${userData.firstName} ${userData.lastName}`,
                companyId: userData.companyId,
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
            };

            if (editingId) {
                await updateInvoice(editingId, data);
            } else {
                await addInvoice(data);
            }
            resetForm();
        } catch (error) {
            console.error("Error saving invoice:", error);
        }
    };

    const handleStatusChange = async (inv, newStatus) => {
        if (confirm(`Change status to ${newStatus}?`)) {
            await updateInvoice(inv.id, { status: newStatus });
        }
    };

    const generatePDF = (inv) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;

            // Colors
            const colors = {
                orange: [214, 110, 15],
                navy: [15, 23, 42],
                slate: [100, 116, 139],
                bg: [248, 250, 252]
            };

            // Get company details
            const activeCompany = companies.find(c => c.id === (inv.companyId || userData?.companyId)) || {};
            const companyName = activeCompany.name || 'ApexSpace';
            const companyLogo = activeCompany.logoUrl;
            const companyAddress = activeCompany.address || '123 Business Avenue, Lilongwe';
            const companyEmail = activeCompany.email || 'support@apexspace.com';
            const companyPhone = activeCompany.phone || '+265 999 123 456';

            // --- 1. HEADER GRAPHICS ---
            doc.setFillColor(...colors.orange);
            doc.triangle(0, 0, 90, 0, 0, 65, 'F');
            doc.setFillColor(...colors.navy);
            doc.triangle(0, 0, 50, 0, 0, 45, 'F');

            // --- 2. COMPANY BRANDING ---
            let yPos = 30;

            // Logo
            if (companyLogo) {
                try {
                    doc.addImage(companyLogo, 'JPEG', margin, yPos - 8, 12, 12);
                } catch (err) {
                    doc.setFillColor(...colors.orange);
                    doc.circle(margin + 5, yPos - 2, 4, 'F');
                }
            } else {
                doc.setFillColor(...colors.orange);
                doc.circle(margin + 5, yPos - 2, 4, 'F');
            }

            // Company Name
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

            // Parse address
            const addressLines = companyAddress ? companyAddress.split(/[,;\n]/).map(s => s.trim()).filter(Boolean) : [];
            const headerInfo = [
                ...addressLines,
                companyEmail,
                companyPhone
            ].filter(Boolean);

            headerInfo.forEach(text => {
                doc.text(text, rightAlign, headerY, { align: 'right' });
                headerY += 5;
            });

            yPos += 35;

            // --- 3. INVOICE TITLE & DETAILS ---
            doc.setFillColor(...colors.navy);
            doc.rect(margin, yPos, 4, 12, 'F'); // Vertical accent bar

            doc.setFontSize(24);
            doc.setTextColor(...colors.navy);
            doc.setFont('helvetica', 'bold');
            doc.text('INVOICE', margin + 8, yPos + 10);

            // Invoice Meta (Right side)
            const metaY = yPos + 2;
            doc.setFontSize(10);

            doc.setTextColor(...colors.slate);
            doc.setFont('helvetica', 'bold');
            doc.text('INVOICE #:', rightAlign - 35, metaY, { align: 'right' });
            doc.setTextColor(...colors.navy);
            doc.setFont('helvetica', 'normal');
            doc.text(inv.invoiceNumber || 'N/A', rightAlign, metaY, { align: 'right' });

            doc.setTextColor(...colors.slate);
            doc.setFont('helvetica', 'bold');
            doc.text('DATE:', rightAlign - 35, metaY + 5, { align: 'right' });
            doc.setTextColor(...colors.navy);
            doc.setFont('helvetica', 'normal');
            doc.text(inv.invoiceDate || '-', rightAlign, metaY + 5, { align: 'right' });

            doc.setTextColor(...colors.slate);
            doc.setFont('helvetica', 'bold');
            doc.text('DUE DATE:', rightAlign - 35, metaY + 10, { align: 'right' });
            doc.setTextColor(...colors.navy);
            doc.setFont('helvetica', 'normal');
            doc.text(inv.dueDate || '-', rightAlign, metaY + 10, { align: 'right' });


            yPos += 25;

            // --- 4. BILL TO SECTION ---
            doc.setFillColor(...colors.bg);
            doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 25, 2, 2, 'F');

            doc.setFontSize(10);
            doc.setTextColor(...colors.slate);
            doc.setFont('helvetica', 'bold');
            doc.text('BILL TO:', margin + 5, yPos + 8);

            doc.setTextColor(...colors.navy);
            doc.setFontSize(12);
            doc.text(inv.clientName || 'Valued Client', margin + 5, yPos + 18);

            // Originator (Employee)
            doc.setFontSize(10);
            doc.setTextColor(...colors.slate);
            doc.setFont('helvetica', 'bold');
            doc.text('GENERATED BY:', pageWidth / 2 + 10, yPos + 8);

            doc.setTextColor(...colors.navy);
            doc.setFont('helvetica', 'normal');
            doc.text(inv.employeeName || 'Unknown', pageWidth / 2 + 10, yPos + 18);


            yPos += 35;

            // --- 5. TABLE ---
            const tableData = inv.items.map(item => [
                item.description,
                item.quantity,
                `MK ${item.unitPrice.toLocaleString()}`,
                `MK ${(item.quantity * item.unitPrice).toLocaleString()}`
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Description', 'Qty', 'Unit Price', 'Total']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: colors.navy,
                    textColor: 255,
                    fontStyle: 'bold',
                    cellPadding: 4
                },
                styles: {
                    font: 'helvetica',
                    fontSize: 10,
                    textColor: colors.navy,
                    cellPadding: 4
                },
                alternateRowStyles: {
                    fillColor: colors.bg
                },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 20, halign: 'center' },
                    2: { cellWidth: 35, halign: 'right' },
                    3: { cellWidth: 35, halign: 'right' }
                },
                foot: [
                    ['', '', 'Subtotal', `MK ${inv.subtotal.toLocaleString()}`],
                    ['', '', `Tax (${inv.taxRate}%)`, `MK ${inv.taxAmount.toLocaleString()}`],
                    ['', '', 'Grand Total', `MK ${inv.total.toLocaleString()}`]
                ],
                footStyles: {
                    fillColor: [255, 255, 255],
                    textColor: colors.navy,
                    fontStyle: 'bold',
                    halign: 'right',
                    lineWidth: 0 // Remove borders for footer to look cleaner
                },
                didParseCell: function (data) {
                    // Align footer right for label and value
                    if (data.section === 'foot') {
                        data.cell.styles.halign = 'right';
                        if (data.column.index === 2) {
                            data.cell.styles.textColor = colors.slate;
                        }
                        if (data.column.index === 3) {
                            data.cell.styles.textColor = colors.navy;
                            data.cell.styles.fontSize = 11;
                        }
                    }
                }
            });

            // --- 6. NOTES ---
            if (inv.notes) {
                let finalY = doc.lastAutoTable.finalY + 15;

                // Add page check
                if (finalY > pageHeight - 40) {
                    doc.addPage();
                    finalY = 20;
                }

                doc.setFontSize(10);
                doc.setTextColor(...colors.slate);
                doc.setFont('helvetica', 'bold');
                doc.text('NOTES / PAYMENT TERMS:', margin, finalY);

                doc.setTextColor(...colors.navy);
                doc.setFont('helvetica', 'normal');
                const notesText = doc.splitTextToSize(inv.notes, pageWidth - (margin * 2));
                doc.text(notesText, margin, finalY + 6);
            }

            // --- 7. FOOTER GRAPHICS ---
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);

                doc.setFillColor(...colors.orange);
                doc.triangle(pageWidth, pageHeight, pageWidth - 80, pageHeight, pageWidth, pageHeight - 60, 'F');
                doc.setFillColor(...colors.navy);
                doc.triangle(pageWidth, pageHeight, pageWidth - 45, pageHeight, pageWidth, pageHeight - 35, 'F');

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.text('ApexSpace Solutions', pageWidth - 10, pageHeight - 8, { align: 'right' });
            }

            doc.save(`${inv.invoiceNumber || 'invoice'}.pdf`);
        } catch (error) {
            console.error("PDF Error:", error);
            alert("Failed to generate PDF. Check console for details.");
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.5rem 1.25rem' }}>
            <header style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap',
                gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem 0', borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 900, color: '#0f172a', margin: 0,
                        letterSpacing: '-0.03em', lineHeight: 1.1, background: 'linear-gradient(135deg, #0f172a 0%, #475569 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        Invoices
                    </h2>
                    <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.05rem', fontWeight: 500 }}>
                        Manage and track your professional billings
                    </p>
                </div>

                {role !== 'manager' && (
                    <button
                        className="btn-primary"
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            padding: '0.875rem 2rem', display: 'flex', alignItems: 'center', gap: '10px',
                            fontWeight: 700, borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)', border: 'none', color: 'white'
                        }}
                    >
                        <Plus size={20} /> Create Invoice
                    </button>
                )}
            </header>

            {/* Controls */}
            <div style={{
                display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '2.5rem', padding: '1.5rem',
                background: 'rgba(255,255,255,0.6)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.03)'
            }}>
                <div className="search-input-wrapper" style={{
                    background: 'white', border: '1px solid #e2e8f0', flex: '1 1 400px',
                    minWidth: '280px', padding: '0.75rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center'
                }}>
                    <Search size={20} color="#94a3b8" />
                    <input
                        placeholder="Search client or invoice number..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ fontSize: '1rem', marginLeft: '12px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px' }}>
                    {['all', 'Draft', 'Submitted', 'Paid'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                padding: '0.65rem 1.25rem', borderRadius: '14px', fontSize: '0.875rem', fontWeight: 700,
                                border: '1px solid', borderColor: filterStatus === status ? '#2563eb' : 'transparent',
                                backgroundColor: filterStatus === status ? '#2563eb' : '#f1f5f9',
                                color: filterStatus === status ? 'white' : '#64748b', transition: 'all 0.25s'
                            }}
                        >
                            {status === 'all' ? 'All Invoices' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 400px), 1fr))',
                gap: '1.5rem'
            }}>
                {visibleInvoices.map(inv => (
                    <div key={inv.id} className="card fade-in" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2 }}>{inv.clientName}</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>{inv.invoiceNumber}</p>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                                <StatusBadge status={inv.status} />
                            </div>
                        </div>

                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
                            marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc',
                            borderRadius: '16px', border: '1px solid #f1f5f9'
                        }}>
                            <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</p>
                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>MK {inv.total.toLocaleString()}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</p>
                                <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>{inv.invoiceDate}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '6px 12px', backgroundColor: '#f1f5f9', borderRadius: '10px'
                            }}>
                                <FileText size={14} color="#64748b" />
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                                    {inv.items?.length || 0} {inv.items?.length === 1 ? 'item' : 'items'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => generatePDF(inv)}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        border: '1px solid #e2e8f0', background: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    className="hover-subtle"
                                    title="Download PDF"
                                >
                                    <Download size={18} color="#2563eb" />
                                </button>
                                {role === 'employee' && inv.status === 'Draft' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(inv, 'Submitted')}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                border: 'none', background: '#dcfce7', color: '#166534',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            title="Submit for Review"
                                        >
                                            <Send size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteInvoice(inv.id)}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                border: 'none', background: '#fee2e2', color: '#991b1b',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="fade-in" style={{
                        backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)',
                        borderRadius: '24px', maxWidth: '900px', width: '95%', padding: '0',
                        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                        margin: '20px'
                    }}>
                        <div style={{
                            padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Create New Invoice</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Generate a professional billing statement</p>
                            </div>
                            <button onClick={resetForm} style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b'
                            }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Client Name</label>
                                    <input required placeholder="Client / Company Name" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Invoice Date</label>
                                    <input type="date" value={formData.invoiceDate} onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Due Date</label>
                                    <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>Line Items</label>
                                    <button type="button" onClick={handleAddItem} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
                                        fontWeight: 700, color: '#2563eb', border: 'none', background: '#eff6ff',
                                        padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer'
                                    }}>
                                        <PlusCircle size={16} /> Add Item
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {formData.items.map((item, index) => (
                                        <div key={index} style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                            gap: '1rem', padding: '1.25rem', background: '#f8fafc',
                                            borderRadius: '16px', border: '1px solid #f1f5f9',
                                            position: 'relative'
                                        }}>
                                            <div style={{ flex: '2 1 200px' }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Description</label>
                                                <input placeholder="e.g. Graphic Design" required value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }} />
                                            </div>
                                            <div style={{ flex: '0.5 1 80px' }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Qty</label>
                                                <input type="number" min="1" placeholder="1" required value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }} />
                                            </div>
                                            <div style={{ flex: '1 1 120px' }}>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>Unit Price</label>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8', fontSize: '0.8rem' }}>MK</span>
                                                    <input type="number" placeholder="0" required value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white' }} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'right', gap: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Amount</span>
                                                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>MK {(item.quantity * item.unitPrice).toLocaleString()}</span>
                                            </div>
                                            {formData.items.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveItem(index)} style={{
                                                    position: 'absolute', top: '-10px', right: '-10px', width: '28px', height: '28px',
                                                    borderRadius: '50%', background: '#fee2e2', color: '#ef4444', border: 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                                }}>
                                                    <MinusCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '2rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem'
                            }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Notes / Payment Info</label>
                                    <textarea placeholder="e.g. Bank Account details, payment terms..." rows={4} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0', resize: 'none', fontSize: '0.95rem' }} />
                                </div>
                                <div style={{
                                    backgroundColor: '#f8fafc', padding: '2rem', borderRadius: '20px',
                                    display: 'flex', flexDirection: 'column', gap: '1rem',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b' }}>
                                        <span style={{ fontWeight: 500 }}>Subtotal</span>
                                        <span style={{ fontWeight: 800, color: '#1e293b' }}>MK {calculateSubtotal(formData.items).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>Tax (%)</span>
                                        <input type="number" value={formData.taxRate} onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })} style={{ width: '70px', padding: '6px 10px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 700 }} />
                                    </div>
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem',
                                        fontWeight: 900, color: '#0f172a', borderTop: '2px dashed #e2e8f0',
                                        paddingTop: '1rem', marginTop: '0.5rem'
                                    }}>
                                        <span>Total Due</span>
                                        <span style={{ color: '#2563eb' }}>MK {calculateTotal(calculateSubtotal(formData.items), calculateTax(calculateSubtotal(formData.items), formData.taxRate)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={resetForm} style={{ padding: '0.875rem 2.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.875rem 3rem', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' }}>Save as Draft</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
