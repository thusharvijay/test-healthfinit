"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Download, ArrowRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import logo from '../../assets/images/logo.jpeg';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const DEMO_USED_KEY = 'paatho_demo_used';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DemoPage() {
    const navigate = useNavigate();
    const [demoUsed, setDemoUsed] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        // Check if demo was already used
        const used = localStorage.getItem(DEMO_USED_KEY);
        if (used === 'true') {
            setDemoUsed(true);
        }
    }, []);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        setError('');

        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setProcessing(true);
        setError('');
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Upload to backend demo endpoint
            const response = await fetch(`${API_BASE_URL}/demo/process-report`, {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                throw new Error('Failed to process report');
            }

            const blob = await response.blob();
            const pdfUrl = URL.createObjectURL(blob);

            setGeneratedPdfUrl(pdfUrl);
            setUploading(false);
            setProcessing(false);

            // Mark demo as used
            localStorage.setItem(DEMO_USED_KEY, 'true');
            setDemoUsed(true);

        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to process the report. Please try again.');
            setUploading(false);
            setProcessing(false);
            setUploadProgress(0);
        }
    };

    const handleDownload = () => {
        if (!generatedPdfUrl) return;

        const link = document.createElement('a');
        link.href = generatedPdfUrl;
        link.download = `pathology-report-${Date.now()}.pdf`;
        link.click();
    };

    const handleReset = () => {
        setSelectedFile(null);
        setError('');
        setUploadProgress(0);
    };

    const handleSignUp = () => {
        navigate('/auth?mode=signup&from=demo');
    };

    if (demoUsed && generatedPdfUrl) {
        // Show success with signup prompt
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
                <div className="absolute top-4 right-4 z-50">
                    <ThemeToggle variant="floating" />
                </div>

                <div className="min-h-screen flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                            <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />

                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                                Demo Complete!
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                You've successfully generated your free report. Download it below or sign up to process unlimited reports!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    <Download size={20} />
                                    <span>Download Report</span>
                                </button>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    Want to process more reports?
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Sign up now to access all premium features!
                                </p>
                                <button
                                    onClick={handleSignUp}
                                    className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
                                >
                                    <span>Sign Up Now</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            >
                                ← Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (demoUsed && !generatedPdfUrl) {
        // Demo already used, show signup prompt
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
                <div className="absolute top-4 right-4 z-50">
                    <ThemeToggle variant="floating" />
                </div>

                <div className="min-h-screen flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                            <AlertCircle size={64} className="mx-auto text-amber-500 mb-6" />

                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                                Demo Limit Reached
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                You've already used your free demo report. Sign up to process unlimited pathology reports and access all features!
                            </p>

                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    Get Full Access
                                </h3>
                                <ul className="text-left text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                                    {/* <li className="flex items-center space-x-2">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Unlimited report processing</span>
                                    </li> */}
                                    <li className="flex items-center space-x-2">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Advanced analytics and insights</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Secure cloud storage</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <CheckCircle size={18} className="text-green-500" />
                                        <span>Priority support</span>
                                    </li>
                                </ul>
                                <button
                                    onClick={handleSignUp}
                                    className="w-full group px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                                >
                                    <span>Sign Up Now</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                            >
                                ← Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main demo upload interface
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle variant="floating" />
            </div>

            <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
                <div className="max-w-3xl w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <img src={logo} alt="B Positive Logo" className="w-12 h-12 rounded-lg object-cover shadow-lg" />
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                Try Our Demo
                            </h1>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Upload one pathology report to see how our system works
                        </p>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                        {!generatedPdfUrl ? (
                            <div>
                                {/* File Upload Area */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Upload Pathology Report (PDF)
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handleFileSelect}
                                            disabled={processing}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${selectedFile
                                                ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-900/50'
                                                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {selectedFile ? (
                                                <div className="text-center">
                                                    <FileText size={48} className="mx-auto text-green-500 mb-3" />
                                                    <p className="text-gray-900 dark:text-white font-medium mb-1">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                    {!processing && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleReset();
                                                            }}
                                                            className="mt-3 text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-medium flex items-center space-x-1 mx-auto"
                                                        >
                                                            <X size={16} />
                                                            <span>Remove</span>
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                                                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        PDF files only, max 10MB
                                                    </p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                {processing && (
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <span>Processing...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
                                            <AlertCircle size={18} />
                                            <span>{error}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || processing}
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={20} />
                                                <span>Generate Report</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => navigate('/')}
                                        disabled={processing}
                                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {/* Info Note */}
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong className="text-gray-900 dark:text-white">Note:</strong> This is a demo version. You can process one free report. Sign up to process unlimited reports and access all features.
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
