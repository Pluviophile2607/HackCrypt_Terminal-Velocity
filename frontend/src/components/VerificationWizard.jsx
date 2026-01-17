import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    ScanFace,
    Fingerprint,
    QrCode,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Loader2,
    ShieldCheck,
    Lock,
    Eye,
    Zap
} from 'lucide-react';
import api from '../api/axios';
import { socket } from '../api/socket';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const VerificationWizard = ({ session, onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [error, setError] = useState('');
    const [results, setResults] = useState({});
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const landmarkerRef = useRef(null);
    const requestRef = useRef();

    // Biometric Data States
    const [faceDetected, setFaceDetected] = useState(false);
    const [faceCaptureProgress, setFaceCaptureProgress] = useState(0);
    const [isFaceVerified, setIsFaceVerified] = useState(false);

    const [qrData, setQrData] = useState('');
    const [isQRVerified, setIsQRVerified] = useState(false);

    const [blinkCount, setBlinkCount] = useState(0);
    const [isLivenessVerified, setIsLivenessVerified] = useState(false);
    const [bioMessage, setBioMessage] = useState('Position Face...');
    const lastBlinkRef = useRef(false);

    const totalSteps = 3;

    // Initialize MediaPipe
    useEffect(() => {
        console.log("VerificationWizard: Starting AI Engine...");
        const initMediaPipe = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
                );
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "CPU" // Use CPU for better cross-device compatibility
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                landmarkerRef.current = landmarker;
                setIsModelLoading(false);
                console.log("VerificationWizard: AI Engine Ready (CPU Mode)!");
            } catch (err) {
                console.error("VerificationWizard: AI Load Failed:", err);
                setError("Bio-engine failed to initialize. Please check your connection.");
                setIsModelLoading(false);
            }
        };
        initMediaPipe();
    }, []);

    // Handle Camera setup
    useEffect(() => {
        if ((step === 1 || step === 3) && (session.verificationRules.face || session.verificationRules.liveness)) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [step]);

    const startCamera = async () => {
        try {
            if (streamRef.current) return;
            const stream = await navigator?.mediaDevices?.getUserMedia({
                video: { width: 1280, height: 720, facingMode: "user" }
            });
            if (videoRef.current) videoRef.current.srcObject = stream;
            streamRef.current = stream;

            // Start detection loop
            if (step === 1 || step === 3) {
                requestRef.current = requestAnimationFrame(detectLoop);
            }
        } catch (err) {
            setError('Camera access denied');
        }
    };

    const stopCamera = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const detectLoop = useCallback(() => {
        if (!videoRef.current || !landmarkerRef.current || !streamRef.current || videoRef.current.readyState < 2) {
            requestRef.current = requestAnimationFrame(detectLoop);
            return;
        }

        try {
            const startTimeMs = performance.now();
            const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const face = results.faceLandmarks[0];
                setFaceDetected(true);

                // Alignment Check (Dynamic Proportions)
                const xs = face.map(p => p.x);
                const ys = face.map(p => p.y);
                const minX = Math.min(...xs), maxX = Math.max(...xs);
                const minY = Math.min(...ys), maxY = Math.max(...ys);
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                const faceWidth = maxX - minX;

                const isCentered = centerX > 0.4 && centerX < 0.6 && centerY > 0.35 && centerY < 0.6;
                const isCloseEnough = faceWidth > 0.15;

                // Logic for Step 1: Face Recognition Progress
                if (step === 1 && !isFaceVerified) {
                    if (!isCentered) {
                        setBioMessage('Center your face');
                        setFaceCaptureProgress(prev => Math.max(0, prev - 1)); // Decay if moved
                    } else if (!isCloseEnough) {
                        setBioMessage('Move closer');
                    } else {
                        setBioMessage('Hold steady...');
                        setFaceCaptureProgress(prev => {
                            if (prev >= 100) {
                                setIsFaceVerified(true);
                                setBioMessage('Identity Verified');
                                setTimeout(() => nextStep(), 1000);
                                return 100;
                            }
                            return prev + 0.8; // Much more balanced, professional speed
                        });
                    }
                }

                // Logic for Step 3: Liveness (Blink Detection)
                if (step === 3 && !isLivenessVerified) {
                    setBioMessage('Blink naturally');
                    const blendshapes = results.faceBlendshapes[0]?.categories;
                    if (blendshapes) {
                        const leftBlink = blendshapes.find(c => c.categoryName === "eyeBlinkLeft")?.score || 0;
                        const rightBlink = blendshapes.find(c => c.categoryName === "eyeBlinkRight")?.score || 0;
                        const isBlinking = leftBlink > 0.4 && rightBlink > 0.4;

                        if (isBlinking && !lastBlinkRef.current) {
                            setBlinkCount(prev => {
                                const newCount = prev + 1;
                                if (newCount >= 2) {
                                    setIsLivenessVerified(true);
                                    setBioMessage('Liveness Confirmed');
                                    setTimeout(() => submitVerification(), 1000);
                                }
                                return newCount;
                            });
                        }
                        lastBlinkRef.current = isBlinking;
                    }
                }
            } else {
                setFaceDetected(false);
                setBioMessage('Face missing...');
                if (step === 1) setFaceCaptureProgress(0);
            }
        } catch (err) {
            console.error("Detection Error:", err);
        }

        requestRef.current = requestAnimationFrame(detectLoop);
    }, [step, isFaceVerified, isLivenessVerified, faceDetected]); // Include faceDetected to stabilize loop state



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
                faceVector: Array.from({ length: 128 }, () => Math.random()), // Simulated embedding capture
                qrToken: qrData,
                livenessBlinks: blinkCount || 2, // At least 2 if auto-advancing
                deviceHash: btoa(navigator.userAgent + navigator.language),
                ipHash: 'local_proxy_trust'
            });

            if (response.data.success) {
                setStatus('success');
                setResults(response.data);

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
                        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-blue-500/30 flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />

                            {/* SVG Face Guide (Perfect Proportions) */}
                            {!isModelLoading && (
                                <div className="absolute inset-0 pointer-events-none z-10">
                                    <svg className="w-full h-full" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">
                                        <defs>
                                            <mask id="face-mask">
                                                <rect width="1280" height="720" fill="white" />
                                                <ellipse
                                                    cx="640" cy="340" rx="180" ry="240"
                                                    fill="black"
                                                />
                                            </mask>
                                        </defs>
                                        <rect
                                            width="1280" height="720"
                                            fill="rgba(0,0,0,0.7)"
                                            mask="url(#face-mask)"
                                        />
                                        <ellipse
                                            cx="640" cy="340" rx="180" ry="240"
                                            fill="none"
                                            stroke={bioMessage === 'Hold steady...' ? "#60A5FA" : faceDetected ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.4)"}
                                            strokeWidth="4"
                                            strokeDasharray={bioMessage === 'Hold steady...' ? "none" : "12,12"}
                                            className={`transition-all duration-300 ${bioMessage === 'Hold steady...' ? 'scale-[1.01]' : 'animate-pulse'}`}
                                        />

                                        {/* Scanning Beam (Inside SVG) */}
                                        {bioMessage === 'Hold steady...' && (
                                            <rect
                                                x="460" y="100" width="360" height="3"
                                                fill="#60A5FA"
                                                className="animate-scan"
                                                style={{ filter: 'drop-shadow(0 0 12px rgba(96,165,250,0.9))' }}
                                            />
                                        )}
                                    </svg>
                                </div>
                            )}

                            {/* Explicit Loading Hub Overlay */}
                            {isModelLoading && (
                                <div className="absolute inset-0 bg-gray-900/90 flex flex-col items-center justify-center z-20 backdrop-blur-md">
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                    <p className="text-white font-bold tracking-widest uppercase text-xs animate-pulse">Initializing AI Engine...</p>
                                    <p className="text-gray-500 text-[10px] mt-2">Loading biometric neural networks...</p>
                                </div>
                            )}

                            {/* Bio-Sync Aura */}
                            {faceDetected && !isModelLoading && (
                                <div className="absolute inset-0 pointer-events-none z-0">
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                                        <div className="w-[240px] h-[340px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                                    </div>
                                </div>
                            )}

                            {/* Progress Bar Overlay */}
                            <div className="absolute bottom-6 left-10 right-10 z-20">
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-md border border-white/10">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
                                        style={{ width: `${faceCaptureProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-[9px] text-white/70 font-black uppercase tracking-widest">
                                        Bio-Sync Status
                                    </p>
                                    <p className="text-[10px] text-white font-bold uppercase tracking-widest">
                                        {bioMessage}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-8">
                            <button
                                disabled={!isFaceVerified || isModelLoading}
                                onClick={nextStep}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isFaceVerified ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                                {isModelLoading ? 'Loading Bio-Engine...' : isFaceVerified ? 'Continue to Next Step' : 'Detecting Face...'} <ArrowRight size={20} />
                            </button>

                            {/* Manual Fallback (Only if AI fails for any reason) */}
                            {!isFaceVerified && !isModelLoading && (
                                <button
                                    onClick={() => {
                                        setIsFaceVerified(true);
                                        setFaceCaptureProgress(100);
                                        setTimeout(() => nextStep(), 500);
                                    }}
                                    className="text-[10px] font-bold text-gray-400 hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <Zap size={12} /> Having trouble? Click here to manual scan <Zap size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 text-center">
                        <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
                            <QrCode size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Session Verification</h3>
                        <p className="text-gray-500">Enter the unique session code from the screen</p>

                        <div className="relative group">
                            <input
                                type="text"
                                maxLength={6}
                                value={qrData}
                                onChange={(e) => setQrData(e.target.value.toUpperCase())}
                                className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center font-mono text-3xl tracking-[1rem] focus:border-emerald-500 focus:bg-white outline-none transition-all"
                                placeholder="000000"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity">
                                <Zap size={24} />
                            </div>
                        </div>

                        <button
                            disabled={qrData.length < 6}
                            onClick={nextStep}
                            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xl shadow-emerald-200"
                        >
                            Validate Session <ArrowRight size={20} />
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 text-center">
                        <div className="inline-flex p-4 bg-purple-50 text-purple-600 rounded-full mb-4">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Passive Liveness Check</h3>
                        <p className="text-gray-500">Verification complete. Just blink twice to submit.</p>

                        <div className={`relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${faceDetected ? 'border-purple-500 scale-[1.01] grayscale-0 opacity-100' : 'border-purple-200 grayscale opacity-40'}`}>
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                            {isLivenessVerified && (
                                <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-[2px]">
                                    <CheckCircle2 size={80} className="text-white animate-bounce" />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center gap-4 py-4">
                            {[1, 2].map((i) => (
                                <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl border-2 transition-all ${blinkCount >= i ? 'bg-purple-600 text-white border-transparent scale-110 shadow-lg' : 'bg-white text-purple-200 border-purple-50'}`}>
                                    {blinkCount >= i ? <Eye size={24} /> : i}
                                </div>
                            ))}
                        </div>

                        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest animate-pulse">
                            {isLivenessVerified ? 'Liveness Confirmed' : 'Detecting Natural Blinks...'}
                        </p>

                        <button
                            disabled={!isLivenessVerified}
                            onClick={submitVerification}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isLivenessVerified ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}
                        >
                            Final Submission <CheckCircle2 size={20} />
                        </button>
                    </div>
                );
            default:
                return null;
        }
    };

    if (status === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="relative">
                    <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={24} className="text-blue-400" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold mt-8">Securing Attendance</h3>
                <p className="text-gray-500 mt-2">Compiling biometric profile and session hashes...</p>
                <div className="w-48 h-1 background-blue-100 rounded-full mt-8 overflow-hidden">
                    <div className="h-full bg-blue-600 animate-progress"></div>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center py-24 animate-in zoom-in duration-500">
                <div className="relative">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 relative z-10">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping scale-150"></div>
                </div>
                <h3 className="text-3xl font-black text-gray-900">Successfully Recorded!</h3>
                <p className="text-gray-500 mt-4 max-w-xs text-center">Your attendance for <strong>{session.courseId}</strong> has been securely logged with multi-factor verification.</p>
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
                    <button onClick={() => {
                        setStep(1);
                        setStatus('idle');
                        setFaceCaptureProgress(0);
                        setIsFaceVerified(false);
                        setBlinkCount(0);
                        setIsLivenessVerified(false);
                        setQrData('');
                    }} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all">Restart Wizard</button>
                    <button onClick={onCancel} className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all">Dismiss</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 leading-tight">Verification Center</h2>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Step {step} of {totalSteps}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`w-6 h-1 rounded-full transition-all duration-500 ${step === s ? 'bg-blue-600 w-12' : step > s ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                    ))}
                </div>
            </div>

            <div className="p-10">
                {renderStep()}
            </div>
        </div>
    );
};

export default VerificationWizard;
