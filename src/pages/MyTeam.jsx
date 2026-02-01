import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, Crown, User } from 'lucide-react';

const MyTeam = () => {
    const { employees, userData } = useApp();

    const myTeam = employees.filter(e =>
        e.companyId === userData?.companyId &&
        e.departmentId === userData?.departmentId
    );

    const isTeamLeader = (member) => member.role === 'supervisor';
    const isMe = (member) => member.id === userData?.id;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                    My Team
                </h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Colleagues in {userData?.department || 'your department'}.
                </p>
            </header>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem'
                }}
            >
                {myTeam.map(member => {
                    const leader = isTeamLeader(member);
                    const me = isMe(member);

                    return (
                        <div
                            key={member.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.25rem',
                                borderRadius: '14px',
                                background: me
                                    ? '#eff6ff'
                                    : '#ffffff',
                                border: leader
                                    ? '2px solid #facc15'
                                    : me
                                        ? '2px solid #3b82f6'
                                        : '1px solid #e5e7eb',
                                boxShadow: leader
                                    ? '0 10px 25px rgba(250,204,21,0.25)'
                                    : '0 4px 12px rgba(0,0,0,0.05)',
                                position: 'relative'
                            }}
                        >
                            {/* Badges */}
                            {leader && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: '#92400e',
                                        backgroundColor: '#fef3c7',
                                        padding: '4px 8px',
                                        borderRadius: '999px'
                                    }}
                                >
                                    <Crown size={12} />
                                    TEAM LEAD
                                </div>
                            )}

                            {me && !leader && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        color: '#1d4ed8',
                                        backgroundColor: '#dbeafe',
                                        padding: '4px 8px',
                                        borderRadius: '999px'
                                    }}
                                >
                                    YOU
                                </div>
                            )}

                            {/* Avatar */}
                            <div
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    backgroundColor: leader
                                        ? '#fef3c7'
                                        : me
                                            ? '#dbeafe'
                                            : '#f1f5f9',
                                    color: leader
                                        ? '#92400e'
                                        : me
                                            ? '#1d4ed8'
                                            : '#475569',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    fontWeight: 800,
                                    flexShrink: 0
                                }}
                            >
                                {member.firstName?.[0]}
                                {member.lastName?.[0]}
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        color: '#1e293b'
                                    }}
                                >
                                    {member.firstName} {member.lastName}
                                </h3>

                                <p
                                    style={{
                                        margin: '0.25rem 0 0.6rem 0',
                                        fontSize: '0.9rem',
                                        color: '#64748b'
                                    }}
                                >
                                    {leader ? 'Supervisor' : member.role}
                                </p>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '1.25rem',
                                        fontSize: '0.85rem',
                                        color: '#64748b'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Mail size={14} />
                                        Email
                                    </div>

                                    {member.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={14} />
                                            Call
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyTeam;
