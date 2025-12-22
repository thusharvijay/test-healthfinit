import { Activity } from "lucide-react";
import { useState, useEffect } from "react";

export function TrialModal({ show, onClose, trial = { left: 7 } }) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (show) {
            setShouldRender(true);
            // Use a longer timeout to ensure DOM renders first
            setTimeout(() => setIsVisible(true), 20);
        } else {
            setIsVisible(false);
            setTimeout(() => setShouldRender(false), 500);
        }
    }, [show]);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className={`fixed inset-0 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className={`inline-block align-bottom bg-white dark:bg-[#1E1E1E] rounded-lg text-left overflow-hidden shadow-xl transform transition-all duration-500 sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                    <div className="p-6">
                        <div className={`flex flex-col items-center text-center space-y-3 mb-4 transform transition-all duration-500 delay-100 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Activity
                                    size={24}
                                    className="text-blue-600 dark:text-blue-400"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
                                    Welcome to Pathology Pro.<br />
                                    Ab Report Hoga Smart!
                                </h3>
                                <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                                    You have 7 free trial cases
                                </p>
                            </div>
                        </div>
                        <div className={`mb-6 transform transition-all duration-500 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                                <div className="text-center">
                                    <div className={`text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 transform transition-all duration-700 delay-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                                        {trial.left}
                                    </div>
                                    <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                                        Free cases remaining
                                    </p>
                                </div>
                            </div>
                        </div>
                        <ul className={`space-y-2 mb-6 text-sm text-[#8F94A3] dark:text-[#9CA3AF] transform transition-all duration-500 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                            <li className={`transform transition-all duration-300 delay-400 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`}>✓ Upload PDF pathology reports</li>
                            <li className={`transform transition-all duration-300 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`}>✓ Add custom letterheads</li>
                            <li className={`transform transition-all duration-300 delay-600 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`}>✓ Approval workflow for technicians</li>
                            <li className={`transform transition-all duration-300 delay-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`}>✓ Generate invoices and export data</li>
                        </ul>
                        <button
                            onClick={onClose}
                            className={`w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-500 delay-500 hover:scale-105 active:scale-95 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}