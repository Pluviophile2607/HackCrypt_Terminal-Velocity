import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, GraduationCap, UserCog, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const Register = () => {
    const navigate = useNavigate();
    const [isAdminExists, setIsAdminExists] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await api.get('/auth/check-admin');
                setIsAdminExists(response.data.exists);
                setLoading(false);
            } catch (err) {
                console.error('Failed to check admin existence');
                setLoading(false);
            }
        };
        checkAdmin();
    }, []);

    const handleRoleSelect = (role) => {
        navigate('/register-details', { state: { role } });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans transition-colors duration-300">
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                        I am a <span className="text-blue-600">...</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto font-medium">
                        Select your destination role to begin the secure onboarding process.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Student Card */}
                    <button
                        onClick={() => handleRoleSelect('student')}
                        className="group relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-[2.5rem] text-center transition-all hover:border-blue-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.2)]"
                    >
                        <div className="mb-6 inline-flex p-5 bg-blue-500/10 text-blue-600 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                            <GraduationCap size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Student</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Access your lectures and mark attendance via biometric ID.</p>
                        <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Continue <ArrowRight size={14} />
                        </div>
                    </button>

                    {/* Faculty Card */}
                    <button
                        onClick={() => handleRoleSelect('faculty')}
                        className="group relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-[2.5rem] text-center transition-all hover:border-indigo-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)]"
                    >
                        <div className="mb-6 inline-flex p-5 bg-indigo-500/10 text-indigo-600 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                            <Shield size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Faculty</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Create secure sessions and govern classroom logs.</p>
                        <div className="mt-6 flex items-center justify-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Continue <ArrowRight size={14} />
                        </div>
                    </button>

                    {/* Admin Card */}
                    <button
                        onClick={() => !isAdminExists && handleRoleSelect('admin')}
                        disabled={isAdminExists}
                        className={`group relative p-8 rounded-[2.5rem] text-center transition-all border-2 
                            ${isAdminExists
                                ? 'bg-gray-100/50 dark:bg-black/40 border-dashed border-gray-300 dark:border-gray-800 opacity-50 cursor-not-allowed'
                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-rose-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.2)]'}`}
                    >
                        <div className={`mb-6 inline-flex p-5 rounded-3xl transition-transform duration-500 ${isAdminExists ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-600' : 'bg-rose-500/10 text-rose-600 group-hover:scale-110'}`}>
                            <UserCog size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Admin</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {isAdminExists ? 'Management slot fulfilled' : 'Full system governance and global audit logs.'}
                        </p>
                        {!isAdminExists && (
                            <div className="mt-6 flex items-center justify-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Continue <ArrowRight size={14} />
                            </div>
                        )}
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Already have an account? <Link to="/signin" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Log in to Dashboard</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
