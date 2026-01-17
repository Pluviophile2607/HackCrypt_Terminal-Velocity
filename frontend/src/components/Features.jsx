import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, UserCheck, Smartphone } from 'lucide-react';

const features = [
    {
        icon: ShieldCheck,
        title: "Secure Verification",
        description: "Advanced biometric and location-based verification ensures 100% authenticity.",
        color: "blue"
    },
    {
        icon: Zap,
        title: "Real-time Tracking",
        description: "Instant attendance updates and live monitoring for administrators.",
        color: "orange"
    },
    {
        icon: UserCheck,
        title: "Proxy Prevention",
        description: "Smart algorithms detect and prevent proxy attendance attempts effectively.",
        color: "green"
    },
    {
        icon: Smartphone,
        title: "Mobile First",
        description: "Designed for seamless experience on all mobile devices.",
        color: "purple"
    }
];

const colorClasses = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
};

const Features = () => {
    return (
        <section id="features" className="py-12 px-4 md:px-6 max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    Why Choose SmartHazri?
                </h2>
                <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto">
                    Experience the future of attendance management with our cutting-edge features.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {features.map((feature, index) => {
                    const IconComponent = feature.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="p-5 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50 hover:shadow-lg hover:border-gray-200 dark:hover:border-slate-600 transition-all group"
                        >
                            <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${colorClasses[feature.color]}`}>
                                <IconComponent className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default Features;
