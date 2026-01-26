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
    const { invoices, addInvoice, updateInvoice, deleteInvoice, userData, user } = useApp();
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
        if (role === 'manager') return inv.companyId === userData?.companyId && inv.status !== 'Draft';
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
        const doc = new jsPDF();
        const primaryColor = [37, 99, 235]; // #2563eb

        // Header
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.text('INVOICE', 20, 30);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Invoice #: ${inv.invoiceNumber}`, 20, 40);
        doc.text(`Date: ${inv.invoiceDate}`, 20, 45);
        doc.text(`Due Date: ${inv.dueDate}`, 20, 50);

        // Company Details
        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.text('FROM:', 20, 65);
        doc.setFontSize(10);
        doc.text(inv.employeeName, 20, 72);
        doc.text(userData.company || 'EMS Space', 20, 77);

        // Client Details
        doc.setFontSize(12);
        doc.text('BILL TO:', 120, 65);
        doc.setFontSize(10);
        doc.text(inv.clientName, 120, 72);

        // Table
        const tableData = inv.items.map(item => [
            item.description,
            item.quantity,
            `MK ${item.unitPrice.toLocaleString()}`,
            `MK ${(item.quantity * item.unitPrice).toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['Description', 'Qty', 'Unit Price', 'Total']],
            body: tableData,
            headStyles: { fillColor: primaryColor, textColor: 255 },
            foot: [
                ['', '', 'Subtotal', `MK ${inv.subtotal.toLocaleString()}`],
                ['', '', `Tax (${inv.taxRate}%)`, `MK ${inv.taxAmount.toLocaleString()}`],
                ['', '', 'Grand Total', `MK ${inv.total.toLocaleString()}`]
            ],
            footStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' }
        });

        // Notes
        if (inv.notes) {
            const finalY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(12);
            doc.text('NOTES:', 20, finalY);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(inv.notes, 20, finalY + 7);
        }

        doc.save(`${inv.invoiceNumber}.pdf`);
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

                {role === 'employee' && (
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {visibleInvoices.map(inv => (
                    <div key={inv.id} className="card fade-in" style={{ padding: '1.5rem', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{inv.clientName}</h3>
                                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>{inv.invoiceNumber}</p>
                            </div>
                            <StatusBadge status={inv.status} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Amount</p>
                                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>MK {inv.total.toLocaleString()}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Date</p>
                                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{inv.invoiceDate}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                <strong>Items:</strong> {inv.items?.length || 0}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => generatePDF(inv)}
                                    style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                                    title="Download PDF"
                                >
                                    <Download size={18} color="#2563eb" />
                                </button>
                                {role === 'employee' && inv.status === 'Draft' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(inv, 'Submitted')}
                                            style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#dcfce7', color: '#166534', cursor: 'pointer' }}
                                            title="Submit for Review"
                                        >
                                            <Send size={18} />
                                        </button>
                                        <button
                                            onClick={() => deleteInvoice(inv.id)}
                                            style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#fee2e2', color: '#991b1b', cursor: 'pointer' }}
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
                        backgroundColor: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(16px)', borderRadius: '24px',
                        maxWidth: '800px', width: '95%', padding: '0', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        maxHeight: '90vh', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Create New Invoice</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Fill in the details to generate your invoice</p>
                            </div>
                            <button onClick={resetForm} style={{ border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '2rem', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Client Name</label>
                                    <input required placeholder="Client / Company Name" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Invoice Date</label>
                                    <input type="date" value={formData.invoiceDate} onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Due Date</label>
                                    <input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Line Items</label>
                                    <button type="button" onClick={handleAddItem} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer' }}>
                                        <PlusCircle size={16} /> Add Item
                                    </button>
                                </div>
                                {formData.items.map((item, index) => (
                                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 150px 1fr 40px', gap: '1rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                                        <input placeholder="Description" required value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                                        <input type="number" placeholder="Qty" required value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                                        <input type="number" placeholder="Price" required value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid #e2e8f0' }} />
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'right' }}>MK {(item.quantity * item.unitPrice).toLocaleString()}</div>
                                        <button type="button" onClick={() => handleRemoveItem(index)} disabled={formData.items.length === 1} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', opacity: formData.items.length === 1 ? 0.3 : 1 }}>
                                            <MinusCircle size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>Notes</label>
                                    <textarea placeholder="Bank details, terms, etc." rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', resize: 'none' }} />
                                </div>
                                <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                                        <span>Subtotal</span>
                                        <span style={{ fontWeight: 700 }}>MK {calculateSubtotal(formData.items).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tax (%)</span>
                                        <input type="number" value={formData.taxRate} onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })} style={{ width: '60px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'right' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                                        <span>Total</span>
                                        <span style={{ color: '#2563eb' }}>MK {calculateTotal(calculateSubtotal(formData.items), calculateTax(calculateSubtotal(formData.items), formData.taxRate)).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
                                <button type="button" onClick={resetForm} style={{ padding: '0.85rem 2rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.85rem 2.5rem', borderRadius: '14px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' }}>Save as Draft</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
