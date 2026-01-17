import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck, Key, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import signupImg from '../assets/signup.png';

const RegisterForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const role = location.state?.role || 'student';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        facultyCode: '',
        consentAccepted: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (role === 'faculty' && !formData.facultyCode) {
            setError('Faculty verification code is required');
            return;
        }

        if (!formData.consentAccepted) {
            setError('Please accept the biometric consent');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register', {
                ...formData,
                role,
                consentAccepted: true
            });

            const { token, ...userData } = response.data;
            login(userData, token);

            if (role === 'student') navigate(`/student/${userData._id}`);
            else if (role === 'faculty') navigate(`/faculty/${userData._id}`);
            else navigate(`/admin/${userData._id}`);

        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white dark:bg-slate-950 font-sans transition-colors duration-300">
            <div className="w-full lg:w-1/2 flex justify-center items-center px-6 lg:px-20 py-12">
                <div className="w-full max-w-md space-y-8">
                    <button
                        onClick={() => navigate('/register')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Role
                    </button>

                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white">
                            {role === 'faculty' ? 'Faculty' : role === 'admin' ? 'Administrator' : 'Student'} <span className="text-blue-600">Signup</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">Please enter your specialized credentials below.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-500/20 text-red-600 dark:text-rose-500 p-4 rounded-xl text-sm font-bold animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            />
                        </div>

                        {role === 'faculty' && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-indigo-600 transition-colors">
                                    <Key size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="facultyCode"
                                    placeholder="Enter Faculty Code (Provided by Admin)"
                                    required
                                    value={formData.facultyCode}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border-2 border-indigo-500/20 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold tracking-widest uppercase italic"
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Secure Password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            />
                        </div>

                        <div className={`p-4 rounded-2xl border transition-all ${formData.consentAccepted ? 'bg-blue-600/10 border-blue-500/50' : 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800'}`}>
                            <label className="flex items-start gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="consentAccepted"
                                    checked={formData.consentAccepted}
                                    onChange={handleChange}
                                    className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-blue-600 focus:ring-blue-500 transition-all"
                                />
                                <div className="text-xs">
                                    <p className={`font-bold transition-colors ${formData.consentAccepted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>Biometric Identity Consent</p>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">I consent to the generation of encrypted faceprint hashes for secure attendance verification. SmartAttend never stores visual images.</p>
                                </div>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all duration-200 mt-2 shadow-xl shadow-blue-500/20 flex justify-center items-center gap-2 uppercase tracking-widest text-sm active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                            {loading ? 'Initializing Profile...' : 'Create Secure Account'}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Already registered? <Link to="/signin" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Sign In here</Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 justify-center items-center bg-gray-50 dark:bg-[#0d111c] relative overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
                <img
                    src={signupImg}
                    alt="Register Illustration"
                    className="w-full max-w-lg z-10 drop-shadow-2xl"
                />
            </div>
        </div>
    );
};

export default RegisterForm;
