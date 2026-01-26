import React from 'react';
import { Clock } from 'lucide-react';

const Attendance = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Attendance</h2>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Track your work hours.</p>
            </header>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', textAlign: 'center' }}>
                <div style={{
                    width: '120px', height: '120px', borderRadius: '50%',
                    backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '2rem'
                }}>
                    <Clock size={64} color="#94a3b8" />
                </div>

                <h3 style={{ fontSize: '1.5rem', color: '#334155', margin: '0 0 1rem 0' }}>Current Status: <span style={{ color: '#64748b' }}>Checked Out</span></h3>

                <button className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 3rem', borderRadius: '50px' }}>
                    Check In
                </button>

                <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Server time: {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

export default Attendance;
