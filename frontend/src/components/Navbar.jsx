import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, UserCheck, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    return (
        <nav className="h-20 flex justify-center items-center sticky top-0 z-50 bg-white">
            <div className="flex justify-between items-center h-20 w-full max-w-[1200px] px-5">
                <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-gray-900 group">
                    <div className="flex justify-center items-center w-8 h-8 bg-primary rounded-lg text-white">
                        <UserCheck size={20} />
                    </div>
                    <span>SmartAttend</span>
                </Link>

                <div className="md:hidden text-gray-900 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </div>

                <div className={`${isOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:static top-20 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none p-5 md:p-0 gap-4 items-center text-center transition-all duration-300 ease-in-out`}>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to={user.role === 'student' ? `/student/${user._id}?view=dashboard` : user.role === 'faculty' ? `/faculty/${user._id}` : '/admin'}
                                className="text-sm font-medium text-gray-600 hover:text-primary transition-colors hidden sm:block"
                            >
                                Dashboard
                            </Link>

                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex justify-center items-center text-gray-600">
                                    <User size={18} />
                                </div>
                                <span>{user.name}</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">{user.role}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/signin"
                                className="px-6 py-2.5 rounded-full font-medium text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
                                onClick={() => setIsOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2.5 rounded-full font-medium text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300"
                                onClick={() => setIsOpen(false)}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
