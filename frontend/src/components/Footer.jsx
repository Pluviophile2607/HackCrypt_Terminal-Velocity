import React from 'react';
import { UserCheck, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16">
            <div className="max-w-[1200px] mx-auto px-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                    {/* Brand Section */}
                    <div className="flex flex-col items-start gap-4">
                        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-white group">
                            <div className="flex justify-center items-center w-8 h-8 bg-primary rounded-lg text-white">
                                <UserCheck size={20} />
                            </div>
                            <span>SmartAttend</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-[260px]">
                            Secure, AI-powered attendance verification system for modern educational institutions.
                        </p>
                        <div className="flex gap-4 mt-2">
                            <a href="#" className="w-9 h-9 flex justify-center items-center rounded-full bg-gray-800 text-gray-400 hover:bg-primary hover:text-white transition-all duration-300">
                                <Github size={18} />
                            </a>
                            <a href="#" className="w-9 h-9 flex justify-center items-center rounded-full bg-gray-800 text-gray-400 hover:bg-primary hover:text-white transition-all duration-300">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-9 h-9 flex justify-center items-center rounded-full bg-gray-800 text-gray-400 hover:bg-primary hover:text-white transition-all duration-300">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Product</h4>
                        <ul className="flex flex-col gap-3 text-sm">
                            <li><Link to="/" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-colors">Security</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-colors">Integrations</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-colors">Enterprise</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Resources</h4>
                        <ul className="flex flex-col gap-3 text-sm">
                            <li><Link to="/" className="hover:text-primary transition-colors">Documentation</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-colors">API Reference</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-colors">Support</Link></li>
                            <li><Link to="/" className="hover:text-primary transition-colors">Status</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Contact</h4>
                        <ul className="flex flex-col gap-3 text-sm">
                            <li className="flex items-center gap-2">
                                <Mail size={16} className="text-primary" />
                                <span>support@smartattend.com</span>
                            </li>
                            <li>123 Education Lane</li>
                            <li>Tech City, TC 90210</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} SmartHazri. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
