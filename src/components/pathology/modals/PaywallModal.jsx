import { AlertCircle } from "lucide-react";

export function PaywallModal({ show, onClose, wallet, computeCharge, onAddMoney }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <div className="inline-block align-bottom bg-white dark:bg-[#1E1E1E] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <AlertCircle
                                    size={24}
                                    className="text-red-600 dark:text-red-400"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
                                    Insufficient Balance
                                </h3>
                                <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                                    Please add money to continue
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#262626] p-4 rounded-lg mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                                    Required:
                                </span>
                                <span className="font-medium text-[#151515] dark:text-[#F9FAFB]">
                                    ₹{computeCharge()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[#8F94A3] dark:text-[#9CA3AF]">
                                    Current Balance:
                                </span>
                                <span className="font-medium text-[#151515] dark:text-[#F9FAFB]">
                                    ₹{wallet}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="flex-1 h-12 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#151515] dark:text-[#F9FAFB] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onAddMoney}
                                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                            >
                                Add Money
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
