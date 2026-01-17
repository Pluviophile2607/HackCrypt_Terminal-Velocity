import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import RegisterForm from './pages/RegisterForm';
import SignIn from './pages/SignIn';
import RoleSelection from './pages/RoleSelection';
import Footer from './components/Footer';

import { AuthProvider } from './context/AuthContext';

import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';


import ProtectedRoute from './components/ProtectedRoute';

// Placeholder for other pages to avoid errors
const Placeholder = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const hideFooterRoutes = ['/signin', '/register', '/select-role', '/faculty', '/admin'];
  const showFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-details" element={<RegisterForm />} />
          <Route path="/select-role" element={<RoleSelection />} />

          <Route
            path="/faculty/:id"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/:id"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          {/* Fallback routes for redirection */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/verify" element={<Placeholder title="Verify Attendance" />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
