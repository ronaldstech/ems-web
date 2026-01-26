import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, User } from 'lucide-react';

const MyTeam = () => {
    const { employees, userData } = useApp();

    const myTeam = employees.filter(e =>
        e.companyId === userData?.companyId &&
        e.department === userData?.department
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>My Team</h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Colleagues in {userData?.department || 'your department'}.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {myTeam.map(member => (
                    <div key={member.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            backgroundColor: '#eff6ff', color: '#3b82f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', fontWeight: 700
                        }}>
                            {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                                {member.firstName} {member.lastName}
                                {member.id === userData?.id && <span style={{ marginLeft: '8px', fontSize: '0.7rem', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#64748b' }}>YOU</span>}
                            </h3>
                            <p style={{ margin: '0.25rem 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>{member.role}</p>

                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Mail size={14} /> Email
                                </div>
                                {member.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Phone size={14} /> Call
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyTeam;
