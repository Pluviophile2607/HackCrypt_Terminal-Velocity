import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, GraduationCap, UserCog, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RoleSelection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [registrationData, setRegistrationData] = useState(null);
    const [isAdminExists, setIsAdminExists] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [consent, setConsent] = useState(false);

    useEffect(() => {
        if (!location.state) {
            navigate('/register');
            return;
        }
        setRegistrationData(location.state);

        const checkAdmin = async () => {
            try {
                const response = await api.get('/auth/check-admin');
                setIsAdminExists(response.data.exists);
            } catch (err) {
                console.error('Failed to check admin existence');
            }
        };
        checkAdmin();
    }, [location, navigate]);

    const handleRoleSelect = async (role) => {
        if (!consent) {
            setError('Please accept the biometric consent to continue.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/register', {
                ...registrationData,
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

    if (!registrationData) return null;

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 font-sans">
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black text-white tracking-tight">
                        Complete your <span className="text-blue-500">Identity</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-xl mx-auto">
                        Hi {registrationData.name}, select your primary role to initialize your secure biometric profile.
                    </p>
                </div>

                {/* Consent Card */}
                <div className={`max-w-md mx-auto p-6 rounded-2xl border transition-all ${consent ? 'bg-blue-600/10 border-blue-500/50' : 'bg-gray-900 border-gray-800'}`}>
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                        />
                        <div className="text-sm">
                            <p className={`font-bold transition-colors ${consent ? 'text-blue-400' : 'text-gray-300'}`}>Biometric Data Consent</p>
                            <p className="text-gray-500 mt-1 leading-relaxed">I agree to let SmartAttend generate and store encrypted cryptographic hashes of my face and fingerprint patterns for attendance verification. Raw data is never stored on servers.</p>
                        </div>
                    </label>
                </div>

                {error && (
                    <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl flex items-center gap-3 text-rose-400 text-sm animate-in fade-in duration-300">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Student Card */}
                    <button
                        onClick={() => handleRoleSelect('student')}
                        disabled={loading}
                        className="group relative bg-gray-900 border-2 border-gray-800 p-8 rounded-[2.5rem] text-center transition-all hover:border-blue-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)]"
                    >
                        <div className="mb-6 inline-flex p-5 bg-blue-500/10 text-blue-500 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                            <GraduationCap size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Student</h3>
                        <p className="text-gray-500 text-sm">Enroll in classes and mark verified attendance</p>
                    </button>

                    {/* Faculty Card */}
                    <button
                        onClick={() => handleRoleSelect('faculty')}
                        disabled={loading}
                        className="group relative bg-gray-900 border-2 border-gray-800 p-8 rounded-[2.5rem] text-center transition-all hover:border-indigo-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)]"
                    >
                        <div className="mb-6 inline-flex p-5 bg-indigo-500/10 text-indigo-500 rounded-3xl group-hover:scale-110 transition-transform duration-500">
                            <Shield size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Faculty</h3>
                        <p className="text-gray-500 text-sm">Manage class sessions and monitor anomalies</p>
                    </button>

                    {/* Admin Card */}
                    <button
                        onClick={() => !isAdminExists && handleRoleSelect('admin')}
                        disabled={loading || isAdminExists}
                        className={`group relative p-8 rounded-[2.5rem] text-center transition-all border-2 
                            ${isAdminExists
                                ? 'bg-gray-950 border-dashed border-gray-800 opacity-50 cursor-not-allowed'
                                : 'bg-gray-900 border-gray-800 hover:border-rose-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.3)]'}`}
                    >
                        <div className={`mb-6 inline-flex p-5 rounded-3xl transition-transform duration-500 ${isAdminExists ? 'bg-gray-800 text-gray-600' : 'bg-rose-500/10 text-rose-500 group-hover:scale-110'}`}>
                            <UserCog size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Admin</h3>
                        <p className="text-gray-500 text-sm">
                            {isAdminExists ? 'Administrator already registered' : 'System-wide governance and global logs'}
                        </p>
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center flex-col items-center gap-4 py-4 animate-in fade-in duration-500">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Generating Biometric Profile...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleSelection;
