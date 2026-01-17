import React, { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

const StatItem = ({ value, label, suffix = "" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { duration: 3000 });
    const numberRef = useRef(null);

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (numberRef.current) {
                numberRef.current.textContent = Math.floor(latest);
            }
        });
    }, [springValue]);

    return (
        <div ref={ref} className="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-blue-50 dark:border-slate-700 hover:border-blue-100 dark:hover:border-slate-600 transition-colors shadow-sm hover:shadow-md">
            <div className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 flex justify-center items-center">
                <span ref={numberRef}>0</span>
                <span>{suffix}</span>
            </div>
            <div className="text-gray-500 dark:text-slate-400 font-medium">{label}</div>
        </div>
    );
};

const Stats = () => {
    return (
        <section className="py-8 bg-gray-50/50 dark:bg-slate-900/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatItem value={90} suffix="%" label="Attendance Accuracy" />
                    <StatItem value={5} suffix="+" label="Partner Institutions" />
                    <StatItem value={1000} suffix="+" label="Daily Verifications" />
                </div>
            </div>
        </section>
    );
};

export default Stats;