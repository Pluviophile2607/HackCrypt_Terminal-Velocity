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
        <div className="flex h-screen w-full bg-[#111827]">
            {/* Left Side: Image/Illustration */}
            {/* Left Side: Image/Illustration */}
            <div className="hidden lg:flex w-1/2 justify-center items-center bg-gray-100">
                <img
                    src={loginImg}
                    alt="Login Illustration"
                    className="w-full max-w-lg max-h-[80vh] object-contain"
                />
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex justify-center items-center px-6 lg:px-20">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-8 text-white text-center">Login</h2>

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm text-center">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400 text-sm font-medium ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400 text-sm font-medium ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                />
                            </div>
                        </div>

                        <button disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-2 shadow-lg shadow-blue-500/20 disabled:opacity-50">
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-gray-400 text-sm">
                        Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
