import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Building2, Save, Loader2, Image as ImageIcon, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
    const { userData, companies, updateCompany, uploadToExternalServer } = useApp();
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoProgress, setLogoProgress] = useState(0);
    const [logoPreview, setLogoPreview] = useState(null);
    const [companyName, setCompanyName] = useState('');

    const company = companies.find(c => c.id === userData?.companyId);

    useEffect(() => {
        if (company) {
            setCompanyName(company.name || '');
            setLogoPreview(company.logoUrl || null);
        }
    }, [company]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !company) return;

        // Validate file size (max 5MB as per profile)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File is too large. Max 5MB allowed.');
            return;
        }

        setUploadingLogo(true);
        setLogoProgress(0);

        try {
            // Using external server upload with progress callback
            const url = await uploadToExternalServer(file, setLogoProgress);

            await updateCompany(company.id, {
                logoUrl: url,
                updatedAt: new Date().toISOString()
            });

            setLogoPreview(url);
            toast.success('Company logo updated successfully!');
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error(error.message || 'Failed to upload logo');
        } finally {
            setUploadingLogo(false);
            setLogoProgress(0);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!company) return;

        setLoading(true);
        try {
            await updateCompany(company.id, {
                name: companyName,
                updatedAt: new Date().toISOString()
            });

            toast.success('Company info updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update info');
        } finally {
            setLoading(false);
        }
    };

    if (!userData || userData.role?.toLowerCase() !== 'manager') {
        return (
            <div className="page-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
                <p>Only managers can access company settings.</p>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <header className="page-header" style={{ marginBottom: '3rem' }}>
                <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <SettingsIcon size={32} />
                    Company Settings
                </h2>
                <p className="page-subtitle">Manage your company profile and timesheet settings</p>
            </header>

            <div className="card" style={{ padding: '3rem', borderRadius: '24px', background: 'white', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

                    {/* Logo Upload Section */}
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #f1f5f9', paddingRight: '2rem' }}>
                        <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '24px',
                                background: '#f8fafc', border: '2px dashed #e2e8f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', position: 'relative',
                                transition: 'all 0.3s ease',
                                cursor: uploadingLogo ? 'not-allowed' : 'pointer'
                            }} onClick={() => !uploadingLogo && document.getElementById('logo-upload').click()}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                        <ImageIcon size={48} style={{ marginBottom: '8px' }} />
                                        <p style={{ margin: 0, fontSize: '0.85rem' }}>Click to upload logo</p>
                                    </div>
                                )}

                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    background: 'rgba(99, 102, 241, 0.9)', color: 'white',
                                    padding: '8px', fontSize: '0.75rem', fontWeight: 600,
                                    opacity: uploadingLogo ? 1 : 0, transition: 'opacity 0.3s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }} className="upload-overlay">
                                    {uploadingLogo ? (
                                        <>
                                            <Loader2 size={12} className="animate-spin" />
                                            {Math.round(logoProgress)}%
                                        </>
                                    ) : (
                                        'Change Logo'
                                    )}
                                </div>
                            </div>

                            {uploadingLogo && (
                                <div style={{
                                    position: 'absolute', bottom: '-15px', left: '0', width: '100%',
                                    height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden'
                                }}>
                                    <div style={{ width: `${logoProgress}%`, height: '100%', background: 'hsl(var(--primary))', transition: 'width 0.2s linear' }}></div>
                                </div>
                            )}
                        </div>

                        <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            style={{ display: 'none' }}
                            disabled={uploadingLogo}
                        />
                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Upload your company logo.<br />Max 5MB (External Service)
                        </p>
                    </div>

                    {/* Company Info Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                                    Company Name
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Building2 size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Enter company name"
                                        required
                                        style={{
                                            width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '12px',
                                            border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                padding: '1.5rem', borderRadius: '16px', background: 'hsl(var(--primary))05',
                                border: '1px solid hsl(var(--primary))20', display: 'flex', gap: '12px'
                            }}>
                                <SettingsIcon size={20} style={{ color: 'hsl(var(--primary))', flexShrink: 0 }} />
                                <div>
                                    <p style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>Timesheet Configuration</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
                                        The uploaded logo will be used in the header of all generated attendance timesheets.
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '12px',
                                        background: 'hsl(var(--primary))', color: 'white', border: 'none',
                                        fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    Save Company Name
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>

            <style>{`
                .card:hover .upload-overlay {
                    opacity: 1 !important;
                }
                input:focus {
                    border-color: hsl(var(--primary)) !important;
                }
            `}</style>
        </div>
    );
};

export default Settings;
