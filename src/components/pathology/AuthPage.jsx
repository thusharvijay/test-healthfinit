"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Building, Upload, Eye, EyeOff, Activity, Shield, UserCheck, RefreshCw } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import indiaData from "../../data/india-states-cities.json";
import { authService } from './services/authService';
import { apiService } from './services/api';
import OTPVerification from './views/OTPVerification';
import ForgotPasswordFlow from './views/ForgotPasswordFlow';

export default function AuthPage({ onLogin, LOGO_MAX, initialMode }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);


  //states and city
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch Indian states on mount
  useEffect(() => {
    setStates(Object.keys(indiaData)); // load states from JSON
  }, []);

  // Login form hook
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm();

  // Register form hook
  const {
    register: regRegister,
    handleSubmit: handleRegisterSubmit,
    watch,
    setError: setRegError,
    clearErrors: clearRegErrors,
    formState: { errors: regErrors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      role: 'Admin'
    }
  });

  const password = watch('password');
  const logoFile = watch('logo');
  const selectedState = watch("state");

  // Fetch cities whenever state changes
  useEffect(() => {
    if (selectedState) {
      setCities(indiaData[selectedState]); // load cities of selected state
    } else {
      setCities([]);
    }
  }, [selectedState]);

  // Handle back to login
  const handleBackToLogin = () => {
    setIsLogin(true);
    setError('');
  };

  // Login handler
  const handleLogin = async (data) => {
    setLoading(true);
    setError('');

    try {
      const { email, password } = data;
      const response = await authService.login(email, password);

      // Login successful
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      localStorage.setItem('session_id', response.session_id);
      apiService.setToken(response.access_token);
      const savedTrialData = localStorage.getItem(`trial_${response.user.email}`);
      const hasSeenWelcome = savedTrialData ? JSON.parse(savedTrialData).seenWelcome : false;

      if (!hasSeenWelcome && response.user.trial_cases_left > 0) {
        sessionStorage.setItem('show_welcome_modal', 'true');  // ✅ Use sessionStorage
      }
      onLogin(response.user);

    } catch (err) {
      console.error('Login error:', err);

      const serverMessage = err.data?.detail || err.message;

      if (serverMessage === 'Please verify your email first') {
        // Send OTP automatically
        try {
          await authService.resendOTP(data.email);
          setRegistrationEmail(data.email);
          setShowOTPVerification(true); // ✅ show OTP UI
          setError('Please verify your email first. OTP has been sent.');
        } catch (otpErr) {
          console.error('Failed to resend OTP:', otpErr);
          setError('Failed to send OTP. Please try again.');
        }
      } else {
        setError(serverMessage);
      }
    } finally {
      setLoading(false);
    }
  };





  // Register handler
  const handleRegister = async (data) => {
    console.log('Form data being sent:', data);
    console.log('Form errors:', regErrors);
    console.log('Empty fields:', Object.keys(data).filter(key => !data[key] || data[key] === ''));

    setLoading(true);
    setError('');

    try {
      const { lab, owner, email, phone, password, address, city, state, gst, nabl, logo } = data;

      // ✅ Logo validation
      if (logo && logo[0]) {
        if (logo[0].size > LOGO_MAX) {
          setError('Logo file must be less than 5MB');
          return;
        }
        if (!['image/png', 'image/jpeg'].includes(logo[0].type)) {
          setError('Logo must be PNG or JPG format');
          return;
        }
      }

      console.log('Starting registration for:', email);

      const userData = {
        lab: lab?.trim(),
        owner: owner?.trim(),
        email: email?.trim()?.toLowerCase(),
        phone: phone?.trim(),
        password,
        address: address?.trim(),
        city: city?.trim(),
        state: state?.trim(),
        gst: gst?.trim() || undefined,
        nabl: nabl?.trim() || undefined,
        logo: logo?.length > 0 ? logo : undefined,
        role: 'Admin'
      };

      console.log('Backend is reachable, starting registration...');

      const response = await authService.register(userData);
      console.log('Registration response:', response);

      // ✅ Registration successful → OTP verification step
      setRegistrationEmail(email);
      setShowOTPVerification(true);

    } catch (err) {
      console.error('Registration error:', err);
      console.log('Error data:', err.data);

      let errorMessage = 'Registration failed';

      // ✅ FIXED: If email already registered, just show message - don't offer OTP
      if (err.data?.detail === 'Email already registered') {
        errorMessage = 'This email is already registered. Please login with your credentials.';
        setError(errorMessage);

        // Optionally switch to login view after a delay
        setTimeout(() => {
          setIsLogin(true);
          setError('');
        }, 2000);

      } else if (err.data?.detail) {
        errorMessage = err.data.detail;
        setError(errorMessage);
      } else if (err.detail) {
        errorMessage = err.detail;
        setError(errorMessage);
      } else if (err.message) {
        errorMessage = err.message;
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }

    } finally {
      setLoading(false);
    }
  };


  const handleOTPVerificationSuccess = () => {
    setShowOTPVerification(false);
    setIsLogin(true);
    setRegistrationEmail('');
    setError('Email verified successfully! Please login with your credentials.');
  };

  const handleBackToLoginFromOTP = () => {
    setShowOTPVerification(false);
    setIsLogin(true);
    setRegistrationEmail('');
    setError('');
  };

  return (
    <div className="min-h-screen flex relative bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="floating" />
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full h-full">
          <div className="flex items-center space-x-3 mb-8 pr-7">
            <Activity size={48} strokeWidth={1.6} className="rotate-45 text-white" />
            <div>
              <h1 className="text-4xl font-bold">B Positive</h1>
              <p className="text-blue-100">Pathology Report Visualizer</p>
            </div>
          </div>
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Streamline Your Lab Operations</h2>
            <p className="text-blue-100">
              Manage pathology reports, handle billing, and streamline your workflow with our comprehensive management system.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white bg-opacity-10 rounded-full transform translate-x-32 translate-y-32"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform -translate-x-16 -translate-y-16"></div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <Activity size={32} strokeWidth={1.6} className="rotate-45 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">B Positive</h1>
          </div>

          {/* Toggle Buttons - Only show if not in role selection or registration form */}
          {!showOTPVerification && (
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${isLogin
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${!isLogin
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                Register
              </button>
            </div>
          )}

          {error && (
            <div className={`mb-4 p-3 rounded-md border ${error.toLowerCase().includes('success') ||
                error.toLowerCase().includes('verified') ||
                error.toLowerCase().includes('please login')
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
              <p className={`text-sm ${error.toLowerCase().includes('success') ||
                  error.toLowerCase().includes('verified') ||
                  error.toLowerCase().includes('please login')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
                }`}>
                {error}
              </p>
            </div>
          )}

          {showOTPVerification ? (
            // OTP Verification Component
            <OTPVerification
              email={registrationEmail}
              onVerificationSuccess={handleOTPVerificationSuccess}
              onBackToLogin={handleBackToLoginFromOTP}
              setError={setError}
            />
          ) : showForgotPassword ? (
            // ✅ ADD THIS SECTION - Forgot Password Flow
            <ForgotPasswordFlow
              onBackToLogin={() => {
                setShowForgotPassword(false);
                setIsLogin(true);
                setError('');
              }}
              onSuccess={() => {
                setShowForgotPassword(false);
                setIsLogin(true);
                setError('Password reset successfully! Please login with your new password.');
              }}
            />
          ) : isLogin ? (
            // Login Form
            <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...loginRegister('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                </div>
                {loginErrors.email && <p className="text-xs text-red-500 dark:text-red-400">{loginErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...loginRegister('password', {
                      required: 'Password is required'
                    })}
                    className="w-full h-12 pl-10 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginErrors.password && <p className="text-xs text-red-500 dark:text-red-400">{loginErrors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Sign In'
                )}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (

            // Registration Form (shown after role selection)
            <div className="space-y-4 w-[600px] ml-[-75px]">
              <form onSubmit={handleRegisterSubmit(handleRegister)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lab Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...regRegister('lab', { required: 'Lab name is required' })}
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Lab name"
                      />
                      <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                    {regErrors.lab && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.lab.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Owner Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...regRegister('owner', { required: 'Owner name is required' })}
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Owner name"
                      />
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                    {regErrors.owner && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.owner.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        {...regRegister('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Email address"
                      />
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                    {regErrors.email && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...regRegister('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^(\+\d{1,3}[- ]?)?\d{10}$/,
                            message: 'Please enter a valid phone number'
                          }
                        })}
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Phone number"
                      />
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                    {regErrors.phone && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...regRegister('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        className="w-full h-12 pl-10 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Password"
                      />
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {regErrors.password && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...regRegister('confirmPassword', {
                          required: 'Confirm password is required',
                          validate: value => value === password || 'Passwords do not match'
                        })}
                        className="w-full h-12 pl-10 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Confirm password"
                      />
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {regErrors.confirmPassword && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.confirmPassword.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <textarea
                      {...regRegister('address', { required: 'Address is required' })}
                      className="w-full h-20 pl-10 pr-4 pt-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Lab address"
                    />
                    <MapPin size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                  </div>
                  {regErrors.address && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.address.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State *
                    </label>
                    <div className="relative">
                      <select
                        {...regRegister("state", { required: "State is required" })}
                        className="w-full h-12 border rounded-lg px-3 pl-8 bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">Select a state</option>
                        {states.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                    {regErrors.state && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      City *
                    </label>
                    <div className="relative">
                      <select
                        {...regRegister("city", { required: "City is required" })}
                        className="w-full h-12 border rounded-lg px-3 pl-8 bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                        disabled={!selectedState}
                      >
                        <option value="">Select a city</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    </div>
                    {regErrors.city && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.city.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      {...regRegister('gst')}
                      className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="GST number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      NABL No (Optional)
                    </label>
                    <input
                      type="text"
                      {...regRegister('nabl')}
                      className="w-full h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="NABL number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lab Logo (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      {...regRegister('logo', {
                        validate: fileList => {
                          if (!fileList || fileList.length === 0) return true; // Optional
                          const file = fileList[0];
                          if (file.size > LOGO_MAX) return 'Logo file must be less than 5MB';
                          if (!['image/png', 'image/jpeg'].includes(file.type)) return 'Logo must be PNG or JPG format';
                          return true;
                        }
                      })}
                      accept="image/png,image/jpeg"
                      className="w-full h-12 pl-10 py-2 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent file:border-0 file:bg-transparent file:text-gray-600 dark:file:text-gray-400 transition-colors"
                    />
                    <Upload size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG or JPG, max 5MB</p>
                  {regErrors.logo && <p className="text-xs text-red-500 dark:text-red-400">{regErrors.logo.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    `Create Account`
                  )}
                </button>
                {/* Button to switch back to Login */}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Already have an account? Login
                </button>
              </form>
            </div>
          )}

          <div className="mt-8 w-[500px] text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing up, you agree to our Terms of Service and Privacy Policy.
              This is a demo application - do not upload sensitive data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}