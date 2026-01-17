import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ShieldAlert,
    Users,
    Server,
    Settings,
    Download,
    UserPlus,
    Activity,
    LogOut,
    CheckCircle2,
    Database,
    Globe,
    AlertCircle,
    X,
    Mail,
    Key,
    User,
    ShieldCheck
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../api/axios';
import { socket } from '../api/socket';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [distributionData, setDistributionData] = useState([]);
    const [deptData, setDeptData] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSessions: 0,
        systemHealth: 99.8,
        totalAnomalies: 0,
        highRiskAnomalies: 0
    });

    const [usersList, setUsersList] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [showFacultyModal, setShowFacultyModal] = useState(false);
    const [facultyFormData, setFacultyFormData] = useState({ name: '', email: '' });
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    const fetchAdminData = async () => {
        try {
            const [anomaliesRes, statsRes, usersRes, facultiesRes] = await Promise.all([
                api.get('/attendance/anomalies'),
                api.get('/attendance/stats'),
                api.get('/attendance/all-users'),
                api.get('/auth/faculties')
            ]);

            setAnomalies(anomaliesRes.data || []);
            if (statsRes.data) {
                setStats({
                    totalUsers: statsRes.data.totalUsers || 0,
                    activeSessions: statsRes.data.activeSessionsCount || 0,
                    systemHealth: statsRes.data.systemHealth || 99.8,
                    totalAnomalies: statsRes.data.totalAnomalies || 0,
                    highRiskAnomalies: statsRes.data.highRiskAnomalies || 0
                });
                setDistributionData(statsRes.data.distribution || []);
                setDeptData(statsRes.data.deptData || []);
            }
            setUsersList(usersRes.data || []);
            setFaculties(facultiesRes.data || []);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        }
    };

    useEffect(() => {
        fetchAdminData();

        // Real-time updates for Admin
        socket.on('connect', () => console.log('Admin connected to socket'));
        socket.connect();

        socket.on('liveUpdate', () => {
            fetchAdminData(); // Refresh all stats when attendance is marked
        });

        socket.on('sessionStarted', () => {
            fetchAdminData(); // Refresh active sessions count
        });

        return () => {
            socket.off('liveUpdate');
            socket.off('sessionStarted');
            socket.disconnect();
        };
    }, []);

    const handleAddFaculty = async (e) => {
        e.preventDefault();
        setModalLoading(true);
        setModalError('');
        try {
            await api.post('/auth/add-faculty', facultyFormData);
            setFacultyFormData({ name: '', email: '' });
            setShowFacultyModal(false);
            fetchAdminData(); // Refresh list
        } catch (err) {
            setModalError(err.response?.data?.message || 'Failed to add faculty');
        } finally {
            setModalLoading(false);
        }
    };

    const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-8 py-5 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white font-bold">AD</div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Control Center</h1>
                        <p className="text-xs text-gray-500 font-medium">Global System Governance & Security Logs</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-6 mr-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Server: Online</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sync: Active</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute -bottom-4 -right-4 text-gray-50 group-hover:scale-110 transition-transform">
                            <Users size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Total Network</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.totalUsers.toLocaleString()}</h3>
                            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 w-max px-2 py-0.5 rounded-lg">
                                <Activity size={12} /> Active Users
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative group font-sans">
                        <div className="absolute -bottom-4 -right-4 text-gray-50 group-hover:scale-110 transition-transform">
                            <Globe size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">Active Sessions</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.activeSessions}</h3>
                            <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 font-bold bg-blue-50 w-max px-2 py-0.5 rounded-lg">
                                Live Tracking
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute -bottom-4 -right-4 text-gray-50 group-hover:scale-110 transition-transform">
                            <Database size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">System Health</p>
                            <h3 className="text-3xl font-black text-gray-900">{stats.systemHealth}%</h3>
                            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 w-max px-2 py-0.5 rounded-lg">
                                0.2% Latency
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-6 rounded-3xl shadow-xl overflow-hidden relative group text-white">
                        <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform">
                            <ShieldAlert size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Security Incidents</p>
                            <h3 className="text-3xl font-black text-rose-500">{stats.totalAnomalies}</h3>
                            <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-100 font-bold bg-rose-500/20 w-max px-2 py-0.5 rounded-lg">
                                High Risk: {stats.highRiskAnomalies}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <BarChart size={20} className="text-rose-500" />
                                    Attendance by Department (%)
                                </h3>
                                <div className="flex gap-2">
                                    <button className="px-4 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg uppercase tracking-wider hover:bg-gray-100">Weekly</button>
                                    <button className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">Monthly</button>
                                </div>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={deptData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                        <Tooltip
                                            cursor={{ fill: '#f9fafb' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="value" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                                <h4 className="font-bold text-gray-900 mb-6 w-full">User Distribution</h4>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributionData}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {distributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    {distributionData.map((d, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">{d.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-6">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setShowFacultyModal(true)}
                                        className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 group"
                                    >
                                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                            <UserPlus size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">New Faculty</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 group">
                                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                            <Download size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Export Logs</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 group">
                                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                            <Settings size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Config</span>
                                    </button>
                                    <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 group">
                                        <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                            <Activity size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Reports</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Feed */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-6 border-b bg-gray-900 text-white flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                                <ShieldAlert size={18} className="text-rose-500" />
                                Global Alerts
                            </h3>
                            <button className="text-[10px] font-bold text-gray-400 hover:text-white uppercase">Reset Feed</button>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y">
                            {anomalies.map((anomaly, i) => (
                                <div key={i} className="p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">
                                            {anomaly.severity} Priority
                                        </div>
                                        <span className="text-[10px] text-gray-400">{new Date(anomaly.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm mb-1">{anomaly.studentId?.name}</p>
                                    <p className="text-xs text-gray-500 mb-3">{anomaly.reason}</p>
                                    <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Course: {anomaly.sessionId?.courseId}</span>
                                        <button className="text-[10px] font-bold text-blue-600 hover:underline">Details</button>
                                    </div>
                                </div>
                            ))}
                            {anomalies.length === 0 && (
                                <div className="p-12 text-center text-gray-400 italic text-sm">No security incidents reported.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-widest">
                            <ShieldCheck size={18} className="text-indigo-600" />
                            Registered Faculty Directory
                        </h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{faculties.length} Faculty Members</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Faculty Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verification Code</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {faculties.map((f, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {f.name?.substring(0, 2)}
                                                </div>
                                                <span className="font-bold text-gray-900">{f.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">{f.email}</td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-indigo-600 tracking-widest">
                                                {f.facultyCode}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${f.password === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {f.password === 'PENDING' ? 'Pending Signup' : 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm uppercase tracking-widest">
                            <Users size={18} className="text-rose-500" />
                            Global User Directory
                        </h3>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{usersList.length} Accounts Registered</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {usersList.map((usr, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${usr.role === 'faculty' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {usr.name?.substring(0, 2) || '??'}
                                                </div>
                                                <span className="font-bold text-gray-900">{usr.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 font-medium">{usr.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${usr.role === 'faculty' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {usr.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-emerald-500 text-[10px] font-bold uppercase">Status: OK</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Faculty Modal */}
                {showFacultyModal && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">Authorize <span className="text-indigo-600">Faculty</span></h2>
                                <button onClick={() => setShowFacultyModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                                This will generate a unique verification code. The faculty must use this code during registration.
                            </p>

                            {modalError && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                                    <AlertCircle size={16} /> {modalError}
                                </div>
                            )}

                            <form onSubmit={handleAddFaculty} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Faculty Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                            <User size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Prof. Alan Turing"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-900"
                                            value={facultyFormData.name}
                                            onChange={(e) => setFacultyFormData({ ...facultyFormData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Official Email</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            placeholder="faculty@university.edu"
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none transition-all font-bold text-gray-900"
                                            value={facultyFormData.email}
                                            onChange={(e) => setFacultyFormData({ ...facultyFormData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowFacultyModal(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={modalLoading}
                                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                                    >
                                        {modalLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                                        {modalLoading ? 'Syncing...' : 'Generate Code'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
};

export default AdminDashboard;
