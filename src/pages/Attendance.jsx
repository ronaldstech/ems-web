import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, Download, Filter, Search, User, Calendar, LogIn, LogOut, Loader2, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Attendance = () => {
    const { userData, attendance, checkIn, checkOut } = useApp();
    const [loading, setLoading] = useState(false);

    const role = userData?.role?.toLowerCase() || 'employee';

    // Get today's record for the logged-in user
    const today = new Date().toISOString().split('T')[0];
    const userTodayRecord = attendance.find(a => a.employeeId === userData?.id && a.date === today);

    const handleCheckIn = async () => {
        if (!userData) return;
        setLoading(true);
        try {
            await checkIn(userData.id, userData.companyId, userData.departmentId);
            toast.success('Check-in successful!');
        } catch (error) {
            toast.error(error.message || 'Failed to check in');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!userData) return;
        setLoading(true);
        try {
            await checkOut(userData.id);
            toast.success('Check-out successful!');
        } catch (error) {
            toast.error(error.message || 'Failed to check out');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = () => {
        if (!userTodayRecord) return { label: 'Not Checked In', color: '#64748b', icon: AlertCircle };
        if (!userTodayRecord.checkOut) return { label: 'Checked In', color: '#10b981', icon: LogIn };
        return { label: 'Checked Out', color: '#ef4444', icon: CheckCircle2 };
    };

    const status = getStatusInfo();

    return (
        <div className="page-container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            <header className="page-header" style={{ textAlign: 'center', marginBottom: 'clamp(1.5rem, 5vw, 3rem)' }}>
                <h2 className="page-title" style={{ fontSize: 'clamp(1.75rem, 6vw, 2.75rem)', letterSpacing: '-0.025em' }}>Daily Attendance</h2>
                <p className="page-subtitle" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>Track your work presence for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
                {/* Main Control Card - ONLY for employees */}
                {role === 'employee' && (
                    <div className="card" style={{
                        padding: 'clamp(2rem, 8vw, 4rem) clamp(1rem, 5vw, 2rem)', textAlign: 'center',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        background: 'white',
                        borderRadius: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                        position: 'relative',
                        overflow: 'hidden',
                        width: '100%'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
                            background: `linear-gradient(90deg, ${status.color}, ${status.color}88)`
                        }}></div>

                        <div style={{
                            width: 'clamp(80px, 15vw, 120px)', height: 'clamp(80px, 15vw, 120px)', borderRadius: '32px',
                            background: `${status.color}10`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '2rem', color: status.color,
                            position: 'relative'
                        }}>
                            {!userTodayRecord || !userTodayRecord.checkOut ? (
                                <div style={{
                                    position: 'absolute', width: '100%', height: '100%',
                                    borderRadius: '32px', background: status.color, opacity: 0.1,
                                    animation: 'pulse-custom 2s infinite'
                                }}></div>
                            ) : null}
                            <Clock size={48} style={{ position: 'relative', zIndex: 1, width: 'clamp(32px, 8vw, 56px)', height: 'clamp(32px, 8vw, 56px)' }} />
                        </div>

                        <h3 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', fontWeight: 800, color: '#1e293b' }}>
                            {status.label}
                        </h3>

                        <p style={{ margin: '0 0 3rem', color: '#64748b', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', maxWidth: '400px' }}>
                            {userTodayRecord
                                ? (userTodayRecord.checkOut ? 'Your shift for today has ended.' : 'You are currently on the clock.')
                                : 'Log your start to begin tracking your hours.'}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', width: '100%', maxWidth: '600px', justifyContent: 'center' }}>
                            <button
                                onClick={handleCheckIn}
                                disabled={loading || !!userTodayRecord}
                                className={`btn ${!!userTodayRecord ? 'btn-secondary' : 'btn-primary'}`}
                                style={{
                                    flex: '1 1 200px', height: '64px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : <LogIn size={24} />}
                                Check In
                            </button>
                            <button
                                onClick={handleCheckOut}
                                disabled={loading || !userTodayRecord || !!userTodayRecord.checkOut}
                                className={`btn ${(!userTodayRecord || !!userTodayRecord.checkOut) ? 'btn-secondary' : 'btn-danger'}`}
                                style={{
                                    flex: '1 1 200px', height: '64px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : <LogOut size={24} />}
                                Check Out
                            </button>
                        </div>

                        {/* Today's Timeline Highlights */}
                        <div style={{
                            marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '1px', background: '#f1f5f9', borderRadius: '24px', overflow: 'hidden',
                            width: '100%', maxWidth: '800px', border: '1px solid #f1f5f9'
                        }}>
                            <div style={{ padding: '1.5rem', background: '#f8fafc', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Arrival</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 800, color: '#334155' }}>
                                    {userTodayRecord ? new Date(userTodayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </p>
                            </div>
                            <div style={{ padding: '1.5rem', background: '#f8fafc', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Departure</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 800, color: '#334155' }}>
                                    {userTodayRecord?.checkOut ? new Date(userTodayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </p>
                            </div>
                            <div style={{ padding: '1.5rem', background: '#f8fafc', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Total Hours</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 800, color: '#334155' }}>
                                    {userTodayRecord?.checkOut
                                        ? (() => {
                                            const diff = Math.abs(new Date(userTodayRecord.checkOut) - new Date(userTodayRecord.checkIn));
                                            const hours = Math.floor(diff / (1000 * 60 * 60));
                                            const minutes = Math.floor((diff / (1000 * 60)) % 60);
                                            return `${hours}h ${minutes}m`;
                                        })()
                                        : '--'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <style>{`
                @keyframes pulse-custom {
                    0% { transform: scale(0.95); opacity: 0.1; }
                    50% { transform: scale(1.05); opacity: 0.3; }
                    100% { transform: scale(0.95); opacity: 0.1; }
                }
                .btn-danger {
                    background: #ef4444;
                    color: white;
                }
                .btn-danger:hover {
                    background: #dc2626;
                }
                .btn-danger:disabled {
                    background: #fecaca;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default Attendance;

