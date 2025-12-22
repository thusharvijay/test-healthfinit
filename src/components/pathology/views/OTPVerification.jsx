// components/OTPVerification.jsx
import { useState, useEffect } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';

export default function OTPVerification({ 
  email, 
  onVerificationSuccess, 
  onBackToLogin, 
  setError 
}) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await authService.verifyOTP(email, otp);
      onVerificationSuccess();
    } catch (err) {
      const errorMessage = err.detail || err.message || 'OTP verification failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      await authService.resendOTP(email);
      setTimer(60);
      setCanResend(false);
      setError(''); // Clear errors
      // Optional: you could set a success state here to show "OTP resent!"
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to resend OTP';
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
          <Mail size={32} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          We've sent a 6-digit OTP to<br />
          <span className="font-medium text-gray-900 dark:text-white">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full h-12 px-4 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="000000"
            maxLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>

      <div className="text-center">
        {!canResend ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code? Resend in {timer}s
          </p>
        ) : (
          <button
            onClick={handleResendOTP}
            disabled={resendLoading}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
          >
            {resendLoading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Resend OTP
              </>
            )}
          </button>
        )}
      </div>

      <button
        onClick={onBackToLogin}
        className="w-full py-2 px-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        ← Back to Login
      </button>
    </div>
  );
}