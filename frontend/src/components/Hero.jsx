import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
    const { user } = useAuth();

    const renderRoleBasedContent = () => {
        // ADMIN & FACULTY VIEW (Read-Only / Overview)
        if (user && (user.role === 'admin' || user.role === 'faculty')) {
            return (
                <div className="flex flex-col items-center">
                    <div className="flex flex-col md:flex-row gap-4 mb-12">
                        <Link
                            to={user.role === 'admin' ? '/admin' : `/faculty/${user._id}`}
                            className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Go to {user.role === 'admin' ? 'Admin' : 'Faculty'} Dashboard
                            <ArrowRight size={20} />
                        </Link>
                    </div>

                    {/* System Overview Cards (Mock Data) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center mb-4">
                                <Users size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">1,240</h3>
                            <p className="text-gray-500 text-sm">Total {user.role === 'admin' ? 'Users' : 'Students'}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex justify-center items-center mb-4">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">98%</h3>
                            <p className="text-gray-500 text-sm">Attendance Accuracy</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex justify-center items-center mb-4">
                                <Activity size={24} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">42</h3>
                            <p className="text-gray-500 text-sm">Active Sessions Today</p>
                        </div>
                    </div>
                </div>
            );
        }

        // STUDENT VIEW
        if (user && user.role === 'student') {
            return (
                <div className="flex flex-col md:flex-row justify-center gap-5">
                    <Link
                        to={`/student/${user._id}?view=dashboard`}
                        className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        Mark Attendance Now
                        <ShieldCheck size={20} />
                    </Link>
                    <Link
                        to={`/student/${user._id}?view=dashboard`}
                        className="px-8 py-4 rounded-full font-bold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all duration-300"
                    >
                        View My History
                    </Link>
                </div>
            );
        }

        // PUBLIC VIEW
        return (
            <div className="flex flex-col md:flex-row justify-center gap-5">
                <Link to="/register" className="px-8 py-4 rounded-full font-bold text-white bg-primary hover:bg-primary-hover shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1">
                    Get Started
                </Link>
                <button className="px-8 py-4 rounded-full font-bold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all duration-300">
                    How it Works
                </button>
            </div>
        );
    };

    return (
        <div className="flex justify-center items-center py-20 px-5 text-center bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-[1000px] w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-[3.5rem] font-extrabold leading-[1.2] mb-6 text-gray-900 tracking-tight">
                        Intelligent Student <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Attendance Verification</span>
                    </h1>
                    <p className="text-lg text-gray-600 leading-relaxed max-w-[700px] mx-auto mb-12">
                        {user ? `Welcome back, ${user.name}. ` : ''}
                        Secure, AI-powered attendance verification system for modern educational institutions.
                        Zero proxies, 100% accuracy.
                    </p>

                    {renderRoleBasedContent()}
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
