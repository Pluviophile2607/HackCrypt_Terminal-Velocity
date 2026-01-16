import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    Calendar,
    AlertTriangle,
    Plus,
    LogOut,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    QrCode,
    StopCircle,
    PlayCircle
} from 'lucide-react';
import api from '../api/axios';
import { socket } from '../api/socket';

const FacultyDashboard = () => {
    const { user, logout } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [activeSession, setActiveSession] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [courseId, setCourseId] = useState('');
    const [liveAttendance, setLiveAttendance] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEnrolled: 45,
        avgAttendance: 88,
        absentToday: 4,
        alerts: 0
    });

    const [rules, setRules] = useState({
        face: true,
        fingerprint: true,
        idCard: true,
        liveness: true
    });

    useEffect(() => {
        if (user && user._id !== id) {
            navigate(`/faculty/${user._id}`, { replace: true });
        }
    }, [id, user, navigate]);

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            await fetchInitialData();
            socket.on('connect', () => {
                console.log('Socket connected');
            });
            socket.connect();

            socket.on('liveUpdate', (data) => {
                setLiveAttendance(prev => [data, ...prev]);
                if (data.status === 'FLAGGED' || data.status === 'FAILED') {
                    setStats(s => ({ ...s, alerts: s.alerts + 1 }));
                }
            });

            setLoading(false);
        };

        initialize();

        return () => {
            socket.off('liveUpdate');
            socket.disconnect();
        };
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const [activeRes, anomaliesRes] = await Promise.all([
                api.get('/session/active'),
                api.get('/attendance/anomalies')
            ]);

            const mySession = activeRes.data.find(s => {
                const facId = s.facultyId?._id || s.facultyId;
                return facId === id;
            });

            if (mySession) {
                setActiveSession(mySession);
                socket.emit('joinSession', mySession._id);
                fetchSessionAttendance(mySession._id);
            }
            setAnomalies(anomaliesRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const fetchSessionAttendance = async (sessionId) => {
        try {
            const res = await api.get(`/attendance/session/${sessionId}`);
            setLiveAttendance(res.data.map(r => ({
                studentName: r.studentId?.name || 'Unknown',
                status: r.status,
                timestamp: r.createdAt
            })));
        } catch (err) {
            console.error(err);
        }
    };

    const handleStartSession = async () => {
        try {
            const res = await api.post('/session/start', {
                courseId,
                verificationRules: rules
            });
            setActiveSession(res.data);
            setShowCreateModal(false);
            socket.emit('joinSession', res.data._id);
            setLiveAttendance([]);
        } catch (err) {
            alert('Failed to start session');
        }
    };

    const handleEndSession = async () => {
        if (!activeSession) return;
        try {
            await api.patch(`/session/end/${activeSession._id}`);
            setActiveSession(null);
            setCourseId('');
        } catch (err) {
            alert('Failed to end session');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Activity className="w-12 h-12 text-indigo-600 animate-pulse mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Initializing Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">FA</div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Faculty Portal</h1>
                        <p className="text-xs text-gray-500 font-medium">Monitoring Real-time Verified Attendance</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {activeSession ? (
                        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 animate-pulse">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            <span className="text-sm font-bold uppercase tracking-wider">Live: {activeSession.courseId}</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            <Plus size={18} />
                            Start New Session
                        </button>
                    )}
                    <button onClick={logout} className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <Users size={24} />
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">+12%</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Total Students</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.totalEnrolled}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Activity size={24} />
                            </div>
                            <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">High</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Attendance Rate</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.avgAttendance}%</h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                <Clock size={24} />
                            </div>
                            <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">Today</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Absentees Today</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.absentToday}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm transition-all hover:shadow-md bg-rose-50/10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                                <AlertTriangle size={24} />
                            </div>
                            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">Action Needed</span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Proxy Alerts</p>
                        <h3 className="text-3xl font-black text-rose-600">{stats.alerts}</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Activity size={20} className="text-indigo-600" />
                                Real-time Verification Feed
                            </h3>
                            {activeSession && (
                                <button
                                    onClick={handleEndSession}
                                    className="px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2"
                                >
                                    <StopCircle size={14} /> Stop Session
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-0">
                            {activeSession ? (
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {liveAttendance.map((log, i) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-gray-900">{log.studentName}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${log.status === 'MARKED' ? 'bg-emerald-100 text-emerald-700' :
                                                            log.status === 'FLAGGED' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                                                </td>
                                            </tr>
                                        ))}
                                        {liveAttendance.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-20 text-center text-gray-400 font-medium">Waiting for students to connect...</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-60">
                                    <PlayCircle size={64} className="text-gray-200 mb-6" />
                                    <h4 className="text-xl font-bold text-gray-400">No Session Active</h4>
                                    <p className="text-gray-400 text-sm max-w-xs mt-2">Start a new classroom session to enable real-time tracking.</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold border border-indigo-100"
                                    >
                                        Setup Session
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {activeSession && (
                            <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 opacity-10">
                                    <QrCode size={160} />
                                </div>
                                <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-6">Session Connection</h4>
                                <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                    <p className="text-sm text-indigo-100 mb-2">Display Token</p>
                                    <h2 className="text-5xl font-black tracking-widest font-mono">{activeSession.qrToken?.substring(0, 6).toUpperCase()}</h2>
                                </div>
                                <p className="text-xs text-indigo-200 mt-6 leading-relaxed italic">Students must enter this token to complete the ID verification step.</p>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b bg-rose-50/30">
                                <h3 className="font-bold text-rose-900 flex items-center gap-2">
                                    <AlertTriangle size={20} />
                                    Anomaly Reports
                                </h3>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto divide-y">
                                {anomalies.map((anomaly, i) => (
                                    <div key={i} className="p-4 bg-white hover:bg-rose-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 text-sm">{anomaly.studentId?.name || 'Unknown Student'}</span>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${anomaly.severity === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                                                }`}>{anomaly.severity}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-1">{anomaly.reason}</p>
                                        <p className="text-[10px] text-gray-400 mt-2">{new Date(anomaly.createdAt).toLocaleString()}</p>
                                    </div>
                                ))}
                                {anomalies.length === 0 && (
                                    <div className="p-10 text-center text-gray-300 text-sm italic">No system anomalies detected.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2">Configure Session</h2>
                        <p className="text-gray-500 mb-8 font-medium">Set up verification rules for this lecture.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Course Code / ID</label>
                                <input
                                    type="text"
                                    value={courseId}
                                    onChange={(e) => setCourseId(e.target.value)}
                                    placeholder="e.g. CS-101 (Computer Science)"
                                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Verification Factors</label>
                                {Object.keys(rules).map((rule) => (
                                    <label key={rule} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                                        <span className="capitalize font-bold text-gray-700">{rule === 'idCard' ? 'ID Token' : rule} Check</span>
                                        <input
                                            type="checkbox"
                                            checked={rules[rule]}
                                            onChange={(e) => setRules({ ...rules, [rule]: e.target.checked })}
                                            className="w-5 h-5 accent-indigo-600"
                                        />
                                    </label>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={!courseId}
                                    onClick={handleStartSession}
                                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                                >
                                    Start Live
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;
