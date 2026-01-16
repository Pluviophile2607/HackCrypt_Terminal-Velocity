import React, { useState, useEffect, useRef } from 'react';
import {
    ScanFace,
    Fingerprint,
    QrCode,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import api from '../api/axios';
import { socket } from '../api/socket';

const VerificationWizard = ({ session, onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [error, setError] = useState('');
    const [results, setResults] = useState({});
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Simulated Biometric Data (In real app, these come from hardware/sensors)
    const [faceData, setFaceData] = useState(null);
    const [fingerprintData, setFingerprintData] = useState(null);
    const [qrData, setQrData] = useState('');

    const totalSteps = 4;

    // Handle Camera setup when reaching Face Step
    useEffect(() => {
        if (step === 1 && session.verificationRules.face) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [step]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
            streamRef.current = stream;
        } catch (err) {
            setError('Camera access denied');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else submitVerification();
    };

    const submitVerification = async () => {
        setStatus('processing');
        setError('');

        try {
            const response = await api.post('/attendance/verify', {
                sessionId: session._id,
                faceVector: Array.from({ length: 128 }, () => Math.random()), // Simulated capture
                fingerprint: localStorage.getItem('user_fingerprint') || 'simulated_hash',
                qrToken: qrData,
                deviceHash: navigator.userAgent,
                ipHash: '127.0.0.1' // Mock
            });

            if (response.data.success) {
                setStatus('success');
                setResults(response.data);

                // Notify via socket
                const storedUser = localStorage.getItem('user');
                const userData = storedUser ? JSON.parse(storedUser) : null;

                socket.emit('attendanceMarked', {
                    sessionId: session._id,
                    studentName: userData?.name || 'Unknown Student',
                    status: response.data.status
                });

                setTimeout(() => onComplete(), 2000);
            } else {
                setStatus('error');
                setError(response.data.anomalies?.join(', ') || 'Verification Failed');
            }
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                                <ScanFace size={32} />
                            </div>
                            <h3 className="text-xl font-bold">Face Recognition</h3>
                            <p className="text-gray-500">Position your face within the frame</p>
                        </div>
                        <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border-4 border-blue-100">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                            <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-full m-12 pointer-events-none"></div>
                        </div>
                        <button onClick={nextStep} className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all">
                            Capture & Continue <ArrowRight size={20} />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 text-center">
                        <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
                            <Fingerprint size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Fingerprint Scan</h3>
                        <p className="text-gray-500">Press your registered finger on the sensor</p>

                        <div className="py-12 flex justify-center">
                            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center border-4 border-indigo-50 animate-pulse">
                                <Fingerprint size={64} className="text-indigo-200" />
                            </div>
                        </div>

                        <button onClick={nextStep} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                            Scan Fingerprint <ArrowRight size={20} />
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 text-center">
                        <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
                            <QrCode size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Session QR Scan</h3>
                        <p className="text-gray-500">Enter the token shown on the faculty screen</p>

                        <input
                            type="text"
                            value={qrData}
                            onChange={(e) => setQrData(e.target.value)}
                            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-center font-mono text-xl tracking-widest focus:border-emerald-500 outline-none"
                            placeholder="Enter 6-digit code or scan"
                        />

                        <button
                            disabled={!qrData}
                            onClick={nextStep}
                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all"
                        >
                            Validate Token <ArrowRight size={20} />
                        </button>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 text-center">
                        <div className="inline-flex p-4 bg-purple-50 text-purple-600 rounded-full mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Liveness Check</h3>
                        <p className="text-gray-500">Blink twice to confirm you are present</p>

                        <div className="py-8">
                            <div className="text-sm font-mono text-purple-600 animate-bounce">Awaiting blink detection...</div>
                        </div>

                        <button onClick={submitVerification} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all">
                            Confirm Liveness <CheckCircle2 size={20} />
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    if (status === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                <h3 className="text-xl font-bold">Securing Attendance</h3>
                <p className="text-gray-500">Verifying biometric hashes and session tokens...</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Verified Successfully!</h3>
                <p className="text-gray-500 mt-2">Your attendance has been marked for {session.courseId}.</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Verification Failed</h3>
                <p className="text-rose-500 mt-2 font-medium">{error}</p>
                <div className="mt-8 flex gap-4">
                    <button onClick={() => setStatus('idle')} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-bold">Try Again</button>
                    <button onClick={onCancel} className="px-6 py-2 bg-rose-50 text-rose-600 rounded-lg font-bold">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <span className="font-bold text-gray-900">Verification Wizard</span>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-gray-100'}`}></div>
                    ))}
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <AlertCircle size={20} />
                </button>
            </div>

            <div className="p-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default VerificationWizard;
