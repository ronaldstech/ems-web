import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, User, Mail, Phone, MapPin, Briefcase, Shield, Save, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
    const { userData, updateUserProfile, uploadToExternalServer, departments } = useApp();
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingFront, setUploadingFront] = useState(false);
    const [uploadingBack, setUploadingBack] = useState(false);

    // Progress states
    const [photoProgress, setPhotoProgress] = useState(0);
    const [frontProgress, setFrontProgress] = useState(0);
    const [backProgress, setBackProgress] = useState(0);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        departmentId: '',
        role: '',
        status: '',
        idNumber: '',
        expiryDate: ''
    });

    const calculateCompletion = () => {
        if (!userData) return 0;

        const fields = [
            userData.firstName,
            userData.lastName,
            userData.phone,
            userData.address,
            userData.departmentId,
            userData.idNumber,
            userData.expiryDate,
            userData.photoUrl,
            userData.idFrontUrl,
            userData.idBackUrl
        ];

        const filledFields = fields.filter(field => field && field !== '').length;
        return Math.round((filledFields / fields.length) * 100);
    };

    const profileCompletion = calculateCompletion();

    useEffect(() => {
        if (userData) {
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                address: userData.address || '',
                departmentId: userData.departmentId || '',
                role: userData.role || '',
                status: userData.status || 'active',
                idNumber: userData.idNumber || '',
                expiryDate: userData.expiryDate || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!userData?.id) return;

        setLoading(true);
        try {
            await updateUserProfile(userData.id, formData);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file || !userData?.id) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File is too large. Max 5MB allowed.');
            return;
        }

        const setProgress = (val) => {
            if (type === 'photo') setPhotoProgress(val);
            else if (type === 'idFront') setFrontProgress(val);
            else if (type === 'idBack') setBackProgress(val);
        };

        if (type === 'photo') { setUploadingPhoto(true); setPhotoProgress(0); }
        else if (type === 'idFront') { setUploadingFront(true); setFrontProgress(0); }
        else if (type === 'idBack') { setUploadingBack(true); setBackProgress(0); }

        try {
            // Using external server upload with progress callback
            const url = await uploadToExternalServer(file, setProgress);

            const mapping = {
                photo: 'photoUrl',
                idFront: 'idFrontUrl',
                idBack: 'idBackUrl'
            };

            await updateUserProfile(userData.id, { [mapping[type]]: url });

            toast.success(`${type.replace(/([A-Z])/g, ' $1')} uploaded successfully!`);
        } catch (error) {
            toast.error(`Failed to upload ${type.replace(/([A-Z])/g, ' $1')}`);
            console.error(error);
        } finally {
            if (type === 'photo') setUploadingPhoto(false);
            else if (type === 'idFront') setUploadingFront(false);
            else if (type === 'idBack') setUploadingBack(false);
            // Keep progress at 100 for a moment then reset if needed, 
            // but usually we can just hide the bar via the 'uploading' state
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2 className="page-title">User Profile</h2>
                <p className="page-subtitle">Manage your personal information, documents, and employment details</p>

                {/* Profile Completion Progress */}
                <div style={{ marginTop: '1.5rem', background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={18} color="hsl(var(--primary))" /> Profile Completion
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>{profileCompletion}%</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${profileCompletion}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}></div>
                    </div>
                    {profileCompletion < 100 && (
                        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                            Complete your profile to unlock all features.
                        </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }} className="profile-grid">
                {/* Left Column: Photo & ID Uploads */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 1.5rem' }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                background: '#f1f5f9', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', overflow: 'hidden', border: '4px solid white',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}>
                                {userData?.photoUrl ? (
                                    <img src={userData.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={64} color="#94a3b8" />
                                )}
                            </div>
                            <label style={{
                                position: 'absolute', bottom: '5px', right: '5px',
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: 'hsl(var(--primary))', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.2s ease'
                            }} className="hover:scale-110">
                                {uploadingPhoto ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'photo')} disabled={uploadingPhoto} />
                            </label>

                            {uploadingPhoto && (
                                <div style={{
                                    position: 'absolute', bottom: '-25px', left: '0', width: '100%',
                                    display: 'flex', flexDirection: 'column', gap: '4px'
                                }}>
                                    <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${photoProgress}%`, height: '100%', background: 'hsl(var(--primary))', transition: 'width 0.2s linear' }}></div>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>{Math.round(photoProgress)}%</span>
                                </div>
                            )}
                        </div>
                        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700 }}>{userData?.firstName} {userData?.lastName}</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Briefcase size={14} /> {userData?.role}
                        </p>
                    </div>

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>National ID Documents</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* Front Side */}
                            <div style={{
                                border: '2px dashed #e2e8f0', borderRadius: '12px',
                                padding: '1rem', textAlign: 'center', background: '#f8fafc'
                            }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>FRONT SIDE</p>
                                {userData?.idFrontUrl ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '100%', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#eee' }}>
                                            <img src={userData.idFrontUrl} alt="ID Front" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <a href={userData.idFrontUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: 600 }}>View Full</a>
                                    </div>
                                ) : (
                                    <FileText size={24} color="#94a3b8" />
                                )}
                                <label style={{
                                    marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '0.4rem', padding: '0.4rem', borderRadius: '6px',
                                    background: 'white', border: '1px solid #e2e8f0',
                                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                }}>
                                    {uploadingFront ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
                                    Upload
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'idFront')} disabled={uploadingFront} />
                                </label>

                                {uploadingFront && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${frontProgress}%`, height: '100%', background: 'hsl(var(--primary))', transition: 'width 0.2s linear' }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>{Math.round(frontProgress)}%</span>
                                    </div>
                                )}
                            </div>

                            {/* Back Side */}
                            <div style={{
                                border: '2px dashed #e2e8f0', borderRadius: '12px',
                                padding: '1rem', textAlign: 'center', background: '#f8fafc'
                            }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>BACK SIDE</p>
                                {userData?.idBackUrl ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '100%', height: '60px', borderRadius: '6px', overflow: 'hidden', background: '#eee' }}>
                                            <img src={userData.idBackUrl} alt="ID Back" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <a href={userData.idBackUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: 600 }}>View Full</a>
                                    </div>
                                ) : (
                                    <FileText size={24} color="#94a3b8" />
                                )}
                                <label style={{
                                    marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '0.4rem', padding: '0.4rem', borderRadius: '6px',
                                    background: 'white', border: '1px solid #e2e8f0',
                                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                }}>
                                    {uploadingBack ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
                                    Upload
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'idBack')} disabled={uploadingBack} />
                                </label>

                                {uploadingBack && (
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${backProgress}%`, height: '100%', background: 'hsl(var(--primary))', transition: 'width 0.2s linear' }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>{Math.round(backProgress)}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <form className="card" onSubmit={handleSave} style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <User size={20} color="hsl(var(--primary))" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Personal Details</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ paddingLeft: '2.5rem' }} placeholder="+1 234 567 890" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input type="email" value={userData?.email || ''} readOnly style={{ paddingLeft: '2.5rem', background: '#f8fafc', cursor: 'not-allowed' }} />
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Home Address</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                <textarea name="address" value={formData.address} onChange={handleChange} style={{ paddingLeft: '2.5rem', minHeight: '80px' }} placeholder="Your full residential address"></textarea>
                            </div>
                        </div>

                        {/* ID Specific Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#fafafa', padding: '1rem', borderRadius: '12px', border: '1px solid #eee' }}>
                            <div className="form-group">
                                <label>National ID Number</label>
                                <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="ID Number" />
                            </div>
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                            <Briefcase size={20} color="hsl(var(--primary))" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Employment Details</h3>
                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                                <Shield size={12} /> Managed by Admin
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label>Department</label>
                                <select name="departmentId" value={formData.departmentId} disabled style={{ background: '#f8fafc', cursor: 'not-allowed', color: '#64748b' }}>
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Role / Position</label>
                                <select name="role" value={formData.role} disabled style={{ background: '#f8fafc', cursor: 'not-allowed', color: '#64748b' }}>
                                    <option value="employee">Employee</option>
                                    <option value="team_leader">Team Leader</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Employment Status</label>
                                <select name="status" value={formData.status} disabled style={{ background: '#f8fafc', cursor: 'not-allowed', color: '#64748b' }}>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="resigned">Resigned</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Save Profile Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
        .profile-grid {
          animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .form-group label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          background: white;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          outline: none;
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        @media (max-width: 992px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
};

export default Profile;
