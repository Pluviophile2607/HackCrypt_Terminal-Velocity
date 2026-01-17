import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    User,
    LogOut,
    ShieldCheck,
    Fingerprint,
    Calendar,
    CheckCircle2,
    Clock,
    ScanFace,
    Bell,
    PlayCircle,
    Activity
} from 'lucide-react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import VerificationWizard from '../components/VerificationWizard';
import api from '../api/axios';
import { socket } from '../api/socket';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // State
    const [activeSessions, setActiveSessions] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [markingSession, setMarkingSession] = useState(null);

    const isDashboard = searchParams.get('view') === 'dashboard';

    const [notifications, setNotifications] = useState([]);
    const [studentStats, setStudentStats] = useState({
        avgAttendance: 0,
        presentCount: 0
    });

    useEffect(() => {
        if (user && user._id !== id) {
            navigate(`/student/${user._id}${isDashboard ? '?view=dashboard' : ''}`, { replace: true });
        }
    }, [id, user, navigate, isDashboard]);

    const fetchData = async (isInitial = false) => {
        try {
            const [sessionsRes, historyRes, statsRes] = await Promise.all([
                api.get('/session/active'),
                api.get('/attendance/my'),
                api.get('/attendance/stats')
            ]);
            setActiveSessions(sessionsRes.data);
            setAttendanceHistory(historyRes.data);
            setStudentStats(statsRes.data);

            // If initial load and there are active sessions, add them to notifications
            if (isInitial && sessionsRes.data && sessionsRes.data.length > 0) {
                const initialNotifications = sessionsRes.data.map(session => ({
                    id: session._id,
                    message: `Active session available: ${session.courseId}`,
                    time: 'Ongoing',
                    isInitial: true
                }));
                setNotifications(initialNotifications);
            }
        } catch (err) {
            console.error('Error fetching student data:', err);
        }
    };

    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    // Data Fetching
    useEffect(() => {
        if (isDashboard) {
            fetchData(true);
            socket.on('connect', () => console.log('Connected to socket as Student'));
            socket.connect();

            socket.on('sessionStarted', (newSession) => {
                console.log('Real-time session alert received:', newSession);
                setNotifications(prev => [{
                    id: Date.now(),
                    message: `NEW: Attendance session started for ${newSession.courseId}`,
                    time: new Date().toLocaleTimeString()
                }, ...prev]);
                fetchData(false); // Refresh list without resetting notifications
            });

            return () => {
                socket.off('sessionStarted');
                socket.disconnect();
            };
        }
    }, [isDashboard]);

    if (!isDashboard) {
        return (
            <div>
                <Hero />
                <Features />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex justify-center items-center text-white shadow-lg shadow-blue-500/30">
                            <User size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
                            <p className="text-gray-500 font-medium">Welcome back, {user?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 md:mt-0 relative group">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                className={`p-3 rounded-xl transition-all relative ${showNotifDropdown ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400 hover:text-blue-600'}`}
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifDropdown && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-4 border-b flex justify-between items-center">
                                        <h4 className="font-bold text-gray-900 text-sm">System Notifications</h4>
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">{notifications.length}</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-4 border-b hover:bg-gray-50 transition-colors ${n.isInitial ? 'border-l-4 border-l-blue-400' : 'border-l-4 border-l-rose-400'}`}>
                                                    <p className="text-xs text-gray-800 font-bold mb-1">{n.message}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{n.time}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-400 text-xs italic">
                                                No new notifications
                                            </div>
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setNotifications([]);
                                                setShowNotifDropdown(false);
                                            }}
                                            className="w-full p-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors rounded-b-2xl border-t"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {markingSession ? (
                    <div className="max-w-xl mx-auto py-10">
                        <VerificationWizard
                            session={markingSession}
                            onComplete={() => {
                                setMarkingSession(null);
                                fetchData();
                            }}
                            onCancel={() => setMarkingSession(null)}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Active Classes */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Live Sessions</h3>
                                    <p className="text-gray-500 mb-8 max-w-md">Select an active lecture to begin multi-factor biometric verification.</p>

                                    {notifications.length > 0 && (
                                        <div className="mb-6 animate-bounce">
                                            <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                        <Activity size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-wider">New Session Alert</p>
                                                        <p className="text-sm font-medium">{notifications[0].message}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setNotifications(prev => prev.slice(1))}
                                                    className="text-xs font-bold hover:underline"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {activeSessions.length > 0 ? (
                                            activeSessions.map((session) => (
                                                <div key={session._id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-blue-200 hover:bg-white transition-all group">
                                                    <div className="flex items-center gap-5 mb-4 md:mb-0">
                                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex justify-center items-center text-blue-600 group-hover:scale-110 transition-transform">
                                                            <PlayCircle size={28} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-lg">{session.courseId}</p>
                                                            <p className="text-sm text-gray-500 font-medium">Faculty: {session.facultyId?.name}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setMarkingSession(session)}
                                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                                                    >
                                                        Join & Mark
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                    <Clock size={32} />
                                                </div>
                                                <p className="text-gray-400 font-medium">No live sessions available right now.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar className="text-blue-600" size={24} />
                                    Attendance Timeline
                                </h3>
                                <div className="space-y-4">
                                    {attendanceHistory.map((record) => (
                                        <div key={record._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-100">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex justify-center items-center ${record.status === 'MARKED' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                                    }`}>
                                                    {record.status === 'MARKED' ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{record.sessionId?.courseId || 'Deleted Session'}</p>
                                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                                        {new Date(record.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                                                    <Clock size={14} />
                                                    <span className="text-sm">{new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${record.status === 'MARKED' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {attendanceHistory.length === 0 && (
                                        <p className="text-center py-6 text-gray-400">No attendance records found.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Profile & Stats */}
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white shadow-sm"></div>
                                </div>
                                <div className="w-24 h-24 bg-gray-100 rounded-3xl mx-auto mb-6 flex items-center justify-center text-gray-400 border-4 border-gray-50">
                                    <User size={48} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-gray-500 font-medium text-sm mb-6">{user?.email}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <p className="text-2xl font-black text-blue-600">
                                            {studentStats.avgAttendance}%
                                        </p>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Average</p>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <p className="text-2xl font-black text-indigo-600">{studentStats.presentCount}</p>
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Present</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 p-8 rounded-3xl shadow-xl text-white relative group overflow-hidden">
                                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                    <Fingerprint size={120} />
                                </div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Security Engine</h4>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="text-sm font-medium">Encryption</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase">AES-256</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <span className="text-sm font-medium">GPS Tunneling</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded uppercase">Blocked</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            <span className="text-sm font-medium">Identity Hash</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded uppercase">Verified</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-8 italic leading-relaxed">
                                    Anti-spoofing algorithms are currently monitoring all biometric session requests.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
