import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import loginImg from '../assets/loginimg.svg';

const SignIn = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Message passed from RoleSelection (Registration Success)
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data) {
                const { token, ...userData } = response.data;
                login(userData, token);

                // Redirect based on role with ID
                const role = response.data.role;
                const userId = response.data._id;

                if (role === 'student') navigate(`/student/${userId}`);
                else if (role === 'faculty') navigate(`/faculty/${userId}`);
                else if (role === 'admin') navigate('/admin');
                else navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white dark:bg-slate-950 transition-colors duration-300">
            {/* Left Side: Image/Illustration */}
            <div className="hidden lg:flex w-1/2 justify-center items-center bg-gray-50 dark:bg-slate-900 transition-colors">
                <img
                    src={loginImg}
                    alt="Login Illustration"
                    className="w-full max-w-lg max-h-[80vh] object-contain drop-shadow-2xl"
                />
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex justify-center items-center px-6 lg:px-20">
                <div className="w-full max-w-md">
                    <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white text-center tracking-tight">Login</h2>

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/50 rounded-xl text-green-600 dark:text-green-500 text-sm text-center">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-xl text-red-600 dark:text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-600 dark:text-gray-400 text-sm font-semibold ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-600 dark:text-gray-400 text-sm font-semibold ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all duration-300 mt-2 shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50">
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                        Don't have an account? <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
