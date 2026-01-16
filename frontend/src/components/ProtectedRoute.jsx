import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Since AuthProvider blocks rendering until loading is false, 
        // this might not be strictly necessary, but good practice.
        return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
    }

    // 1. Check if user is logged in
    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    // 2. Check for role permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard based on their actual role
        if (user.role === 'student') return <Navigate to={`/student/${user._id}`} replace />;
        if (user.role === 'faculty') return <Navigate to={`/faculty/${user._id}`} replace />;
        if (user.role === 'admin') return <Navigate to="/admin" replace />;

        // Fallback
        return <Navigate to="/" replace />;
    }

    // Authorization successful
    return children;
};

export default ProtectedRoute;
