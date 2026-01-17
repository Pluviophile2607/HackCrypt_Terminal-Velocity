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
    Globe
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

    const fetchAdminData = async () => {
        try {
            const [anomaliesRes, statsRes, usersRes] = await Promise.all([
                api.get('/attendance/anomalies'),
                api.get('/attendance/stats'),
                api.get('/attendance/all-users')
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
                                    <button className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100 group">
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
            </main >
        </div >
    );
};

export default AdminDashboard;
