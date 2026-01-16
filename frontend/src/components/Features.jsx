import React from 'react';
import { ScanFace, Fingerprint, ShieldCheck, BarChart3, Lock, Users } from 'lucide-react';

const featuresData = [
    {
        icon: <ScanFace size={32} />,
        title: "Facial Recognition",
        description: "Advanced AI-powered facial matching with liveness detection to prevent photo-based proxy attendance."
    },
    {
        icon: <Fingerprint size={32} />,
        title: "Biometric Verification",
        description: "Simulated fingerprint authentication for multi-factor security and identity consistency."
    },
    {
        icon: <ShieldCheck size={32} />,
        title: "ID Card Validation",
        description: "Instant student ID card scanning and validation against the central college database."
    },
    {
        icon: <BarChart3 size={32} />,
        title: "Real-time Analytics",
        description: "Comprehensive dashboards for faculty to monitor attendance trends and detect anomalies."
    },
    {
        icon: <Lock size={32} />,
        title: "Tamper-Resistant",
        description: "Secure storage and encrypted records ensure that attendance data remains accurate and unalterable."
    },
    {
        icon: <Users size={32} />,
        title: "Smart Campus Integration",
        description: "Seamlessly integrates with classroom schedules and lab sessions for automated tracking."
    }
];

const Features = () => {
    return (
        <div className="py-20 px-5 bg-gray-50 flex flex-col items-center">
            <div className="text-center max-w-[700px] mb-15">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">Secure Multi-Factor Verification</h2>
                <p className="text-base text-gray-600">Our system combines multiple layers of security to ensure 100% accurate attendance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] w-full">
                {featuresData.map((feature, index) => (
                    <div className="bg-white p-8 rounded-xl border border-gray-200 flex flex-col items-start text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-gray-300" key={index}>
                        <div className="text-primary mb-5 bg-blue-50 p-2.5 rounded-lg inline-flex justify-center items-center">
                            {feature.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2.5 text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;
