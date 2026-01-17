import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, ShieldCheck, Users, Activity, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import Stats from "./Stats";

const Hero = () => {
    const { user } = useAuth();

    const renderRoleBasedContent = () => {
        // ADMIN & FACULTY
        if (user && (user.role === "admin" || user.role === "faculty")) {
            return (
                <div className="flex flex-col items-center gap-10">
                    <Link
                        to={user.role === "admin" ? "/admin" : `/faculty/${user._id}`}
                        className="flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all"
                    >
                        Go to {user.role === "admin" ? "Admin" : "Faculty"} Dashboard
                        <ArrowRight size={20} />
                    </Link>

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col items-center">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                                <Users size={22} />
                            </div>
                            <h3 className="text-2xl font-bold">1,240</h3>
                            <p className="text-sm text-gray-500">
                                Total {user.role === "admin" ? "Users" : "Students"}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                <ShieldCheck size={22} />
                            </div>
                            <h3 className="text-2xl font-bold">98%</h3>
                            <p className="text-sm text-gray-500">Attendance Accuracy</p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col items-center">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                                <Activity size={22} />
                            </div>
                            <h3 className="text-2xl font-bold">42</h3>
                            <p className="text-sm text-gray-500">Active Sessions Today</p>
                        </div>
                    </div>
                </div>
            );
        }

        // STUDENT
        if (user && user.role === "student") {
            return (
                <Link
                    to={`/student/${user._id}?view=dashboard`}
                    className="px-10 py-5 rounded-full font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-xl transition-all flex items-center gap-3 text-lg"
                >
                    Mark Attendance Now
                    <ShieldCheck size={24} />
                </Link>
            );
        }

        // PUBLIC
        return (
            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg shadow-lg flex items-center gap-2">
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </Link>

                <button
                    onClick={() => {
                        const el = document.getElementById("features");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-8 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full font-semibold text-lg flex items-center gap-2 transition-all hover:shadow-md"
                >
                    <PlayCircle className="w-5 h-5" />
                    How it Works
                </button>
            </div>
        );
    };

    return (
        <div className="px-6 max-w-7xl mx-auto flex flex-col items-center justify-between h-full pt-28 pb-10">
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto text-center">
                <motion.h1
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
                >
                    Intelligent Student
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                        Attendance Verification
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mt-6"
                >
                    {user ? `Welcome back, ${user.name}. ` : ""}
                    Secure, AI-powered attendance verification system for modern educational institutions.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-10"
                >
                    {renderRoleBasedContent()}
                </motion.div>
            </div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="w-full mt-12"
            >
                <Stats />
            </motion.div>
        </div>
    );
};

export default Hero;
