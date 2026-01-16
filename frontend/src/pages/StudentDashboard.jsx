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
    PlayCircle
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

    useEffect(() => {
        if (user && user._id !== id) {
            navigate(`/student/${user._id}${isDashboard ? '?view=dashboard' : ''}`, { replace: true });
        }
    }, [id, user, navigate, isDashboard]);

    // Data Fetching
    useEffect(() => {
        if (isDashboard) {
            fetchData();
            socket.on('connect', () => console.log('Connected to socket'));
            socket.connect();
            return () => socket.disconnect();
        }
    }, [isDashboard]);

    const fetchData = async () => {
        try {
            const [sessionsRes, historyRes] = await Promise.all([
                api.get('/session/active'),
                api.get('/attendance/my')
            ]);
            setActiveSessions(sessionsRes.data);
            setAttendanceHistory(historyRes.data);
        } catch (err) {
            console.error('Error fetching student data:', err);
        }
    };

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
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-blue-600 transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button onClick={logout} className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-all duration-200 font-bold">
                            <LogOut size={18} />
                            Log Out
                        </button>
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
                                            {attendanceHistory.length > 0 ? Math.round((attendanceHistory.filter(r => r.status === 'MARKED').length / attendanceHistory.length) * 100) : '--'}%
                                        </p>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Average</p>
                                    </div>
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                        <p className="text-2xl font-black text-indigo-600">{attendanceHistory.filter(r => r.status === 'MARKED').length}</p>
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
