import { X } from "lucide-react";
import { useState } from "react";

export function WalletModal({ show, onClose, wallet, onRechargeSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!show) return null;

    const handleRecharge = async (amount) => {
        setIsLoading(true);
        setError('');
        
        try {
            await onRechargeSuccess(amount);
        } catch (err) {
            setError(err.message || 'Failed to recharge wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomAdd = async (e) => {
        const input = e.currentTarget.previousElementSibling;
        const amount = parseInt(input.value, 10);
        if (!isNaN(amount) && amount > 0) {
            await handleRecharge(amount);
            input.value = "";
        }
    };

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            const amount = parseInt(e.currentTarget.value, 10);
            if (!isNaN(amount) && amount > 0) {
                await handleRecharge(amount);
                e.currentTarget.value = "";
            }
        }
    };

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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
                                Add Money to Wallet
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mb-4">
                            Current balance: ₹{wallet}
                        </p>
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {[100, 500, 1000, 2000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handleRecharge(amount)}
                                    disabled={isLoading}
                                    className="p-4 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                                >
                                    <div className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
                                        ₹{amount}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex space-x-3">
                            <input
                                type="number"
                                placeholder="Custom amount"
                                className="flex-1 h-12 px-4 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB]"
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                onClick={handleCustomAdd}
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                            >
                                {isLoading ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
