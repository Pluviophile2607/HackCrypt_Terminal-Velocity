import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import signupImg from '../assets/signup.png';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/select-role', { state: formData });
    };

    return (
        <div className="flex h-screen w-full bg-[#111827]">
            {/* Left Side: Form */}
            <div className="w-full lg:w-1/2 flex justify-center items-center px-6 lg:px-20">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold mb-8 text-white text-center">Register</h2>

                    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                        {/* Name Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        {/* Email Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-[#1F2937] border border-[#374151] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-2 shadow-lg shadow-blue-500/20">
                            Register
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-400 text-sm">
                        Already have an account? <Link to="/signin" className="text-primary hover:underline">Log In</Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Image/Illustration */}
            <div className="hidden lg:flex w-1/2 justify-center items-center bg-gray-100">
                <img
                    src={signupImg}
                    alt="Register Illustration"
                    className="w-full max-w-lg max-h-[80vh] object-contain"
                />
            </div>
        </div>
    );
};

export default Register;
