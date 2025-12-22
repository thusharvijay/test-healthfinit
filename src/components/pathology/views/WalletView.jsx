import { Wallet, Plus, Tag, CreditCard, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export function WalletView({ wallet, onAddMoney, applyCoupon }) {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Store previous wallet value
    const prevWallet = sessionStorage.getItem('prevWallet');
    
    if (prevWallet && parseFloat(prevWallet) < wallet) {
      // Wallet increased, show celebration
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    
    // Update stored wallet value
    sessionStorage.setItem('prevWallet', wallet.toString());
  }, [wallet]);

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    const applied = await applyCoupon(couponCode.trim());
    if (applied) {
      setCouponCode('');
    } else {
      setCouponError('Invalid or expired coupon code');
    }
  };

  return (
    <div className="p-4 lg:p-8">
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {/* Confetti particles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5],
                left: `${Math.random() * 100}%`,
                top: '50%',
                animation: `confetti ${1 + Math.random()}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.3}s`
              }}
            />
          ))}
          
          {/* Success message */}
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl p-6 animate-[celebrate_0.5s_ease-in-out]">
            <div className="text-center">
              <div className="text-5xl mb-2">🎉</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                Wallet Recharged!
              </div>
              <div className="text-sm text-[#8F94A3] dark:text-[#9CA3AF] mt-1">
                🪙{wallet} available
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB] mb-2">
          Wallet
        </h2>
        <p className="text-[#8F94A3] dark:text-[#9CA3AF]">
          Manage your wallet balance and apply coupons
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Coin Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <TrendingUp size={20} className="opacity-80" />
          </div>
          <div className="mb-2">
            <div className="text-sm opacity-80">Coin Balance</div>
            <div className="text-3xl font-bold">🪙{wallet}</div>
          </div>
          <button
            onClick={onAddMoney}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Add Coins</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={onAddMoney}
              className="w-full flex items-center space-x-3 px-4 py-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Plus size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB]">
                  Add Coins
                </div>
                <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                  Top up your wallet balance
                </div>
              </div>
            </button>

            <div className="w-full flex items-center space-x-3 px-4 py-3 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <CreditCard size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-[#151515] dark:text-[#F9FAFB]">
                  Per-Case Rate
                </div>
                <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                  1 🪙 per document after trial
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-white dark:bg-[#1E1E1E] border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Tag size={20} className="text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-[#151515] dark:text-[#F9FAFB]">
            Apply Coupon
          </h3>
        </div>
        
        <form onSubmit={handleCouponSubmit} className="flex space-x-3 mb-4">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 h-12 px-4 border border-[#E6E8F0] dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#1E1E1E] text-[#151515] dark:text-[#F9FAFB] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Apply
          </button>
        </form>
        
        {couponError && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{couponError}</p>
        )}

        {/* Available Coupons */}
        <div className="bg-gray-50 dark:bg-[#262626] rounded-lg p-4">
          <h4 className="text-sm font-semibold text-[#151515] dark:text-[#F9FAFB] mb-3">
            Available Demo Coupons:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-[#1E1E1E] border-2 border-blue-300 dark:border-blue-600 rounded animate-pulse-slow shadow-lg">
              <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 animate-pulse">ADD100</div>
              <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">Add 🪙100 credit</div>
            </div>
            <div className="p-3 bg-white dark:bg-[#1E1E1E] border-2 border-green-300 dark:border-green-600 rounded animate-pulse-slow shadow-lg" style={{ animationDelay: '0.2s' }}>
              <div className="font-mono text-sm font-bold text-green-600 dark:text-green-400 animate-pulse" style={{ animationDelay: '0.2s' }}>CASEFREE1</div>
              <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">Next case free</div>
            </div>
            <div className="p-3 bg-white dark:bg-[#1E1E1E] border-2 border-orange-300 dark:border-orange-600 rounded animate-pulse-slow shadow-lg" style={{ animationDelay: '0.4s' }}>
              <div className="font-mono text-sm font-bold text-orange-600 dark:text-orange-400 animate-pulse" style={{ animationDelay: '0.4s' }}>BULK50</div>
              <div className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">10 cases @ 🪙5 each</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Usage Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          💡 Wallet Usage Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Your first 7 document uploads are completely free</li>
          <li>• After the trial, each document upload costs 1 🪙</li>
          <li>• Admin uploads are charged immediately upon upload</li>
          <li>• Technician uploads are charged only after admin approval</li>
          <li>• Use coupons to save money on bulk document processing</li>
          <li>• Keep a minimum balance to avoid upload interruptions</li>
        </ul>
      </div>
    </div>
  );
}