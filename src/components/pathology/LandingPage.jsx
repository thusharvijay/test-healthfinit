"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Shield,
    Zap,
    FileText,
    TrendingUp,
    Users,
    Award,
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import logo from "../../assets/images/logo.jpeg";
import landingBg from "../../assets/images/landing_bg_4.png";
import model1 from "../../assets/images/2d_model_1.jpg";
import model2 from "../../assets/images/2d_model_2.jpg";
import model3 from "../../assets/images/3d_model_1.jpg";
import model4 from "../../assets/images/3d_model_2.jpg";

export default function LandingPage() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            icon: FileText,
            title: "Smart Report Management",
            description:
                "Streamline pathology report creation and management with intelligent automation",
        },
        {
            icon: TrendingUp,
            title: "Advanced Analytics",
            description:
                "Gain insights from your lab data with powerful visualization tools",
        },
        {
            icon: Shield,
            title: "Secure & Compliant",
            description:
                "Enterprise-grade security ensuring your data remains protected",
        },
        {
            icon: Users,
            title: "Team Collaboration",
            description:
                "Seamless collaboration tools for your entire laboratory team",
        },
    ];

    const models = [
        {
            image: model1,
            title: "Model 1",
        },
        {
            image: model2,
            title: "Model 2",
        },
        {
            image: model3,
            title: "Model 3",
        },
        {
            image: model4,
            title: "Model 4",
        },
    ];

    return (
        <div className="min-h-screen transition-colors duration-500">
            {/* ================= HERO WRAPPER ================= */}
            <div className="relative overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${landingBg})`,
                        backgroundSize: "100% 100%",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                >
                    {/* <div className="absolute inset-0 backdrop-blur-md bg-white/10 dark:bg-gray-900/60" /> */}
                    <div className="absolute inset-0" />
                </div>

                {/* Theme Toggle */}
                <div className="absolute top-4 right-4 z-50 sm:top-6 sm:right-6">
                    <ThemeToggle variant="floating" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10">
                    {/* Navigation */}
                    <nav
                        className={`container mx-auto px-6 py-6 pr-16 sm:pr-20 transition-all duration-1000 ${isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 group cursor-pointer">
                                <div className="relative">
                                    <img
                                        src={logo}
                                        alt="B Positive Logo"
                                        className="w-12 h-12 rounded-lg object-cover shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-blue-400 dark:bg-blue-600 blur-xl opacity-0 group-hover:opacity-20 transition-opacity rounded-lg" />
                                </div>
                                <div>
                                    {/* <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"> */}
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-black to-gray-900 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        B Positive
                                    </h1>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Pathology Report Visualizer
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigate("/auth?mode=login")}
                                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate("/auth?mode=signup")}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                                >
                                    <span>Get Started</span>
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* Hero Section */}
                    <section className="container mx-auto px-6 py-24">
                        <div
                            className={`max-w-4xl transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                                }`}
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-700 mb-8 shadow-lg">
                                <Zap size={16} className="text-yellow-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Streamline Your Lab Operations
                                </span>
                            </div>

                            {/* Heading */}
                            {/* <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"> */}
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                                {/* <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                                    Transform Your
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    Pathology Workflow
                                </span> */}
                                <span className="bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Transform Your
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-black to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Pathology Workflow
                                </span>
                            </h2>

                            {/* Subheading */}
                            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl leading-relaxed">
                                The complete solution for managing pathology reports, billing, and laboratory operations with cutting-edge technology.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    onClick={() => navigate("/auth?mode=signup")}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-xl shadow-2xl hover:scale-105 transition"
                                >
                                    Start Free Trial
                                </button>

                                <button
                                    onClick={() => navigate("/demo")}
                                    className="px-8 py-4 border-2 border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl hover:scale-105 transition"
                                >
                                    Try Demo
                                </button>
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            {/* ================= FEATURES ================= */}
            <section className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {models.map((model, index) => (
                        <div
                            key={index}
                            className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:-translate-y-2 transition overflow-hidden"
                        >
                            <div className="w-full h-80 mb-4 rounded-xl overflow-hidden">
                                <img
                                    src={model.image}
                                    alt={model.title}
                                    className="w-full h-full object-cover transform hover:scale-110 transition duration-500"
                                />
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-center">{model.title}</h3>
                        </div>
                    ))}
                </div>
                <br />
                <br />
                <br />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:-translate-y-2 transition"
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                                <feature.icon size={28} className="text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>


                {/* ================= STATS ================= */}
                <div className="mt-24 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl p-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <Stat icon={Award} value="10,000+" label="Reports Processed" />
                        <Stat icon={Users} value="500+" label="Active Laboratories" />
                        <Stat icon={TrendingUp} value="99.9%" label="Uptime Guarantee" />
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="container mx-auto px-6 py-12 border-t border-gray-200 dark:border-gray-800">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    © 2025 B Positive. Demo application. Do not upload sensitive data.
                </p>
            </footer>
        </div>
    );
}

/* ---------- Helper ---------- */
function Stat({ icon: Icon, value, label }) {
    return (
        <div>
            <Icon className="mx-auto mb-3 text-blue-600 dark:text-blue-400" size={32} />
            <div className="text-4xl font-bold mb-2">{value}</div>
            <div className="text-gray-600 dark:text-gray-400">{label}</div>
        </div>
    );
}
