"use client";

import { useState, useEffect } from 'react';
import LandingPage from '../components/pathology/LandingPage';
import Dashboard from '../components/pathology/Dashboard';
import { apiService } from '../components/pathology/services/api';

// LocalStorage keys
const LS_KEYS = {
  USERS: 'paatho_users',
  CURRENT: 'paatho_current',
  DOCS: (email) => `paatho_docs_${email}`,
  UI: (email) => `paatho_ui_${email}`,
  BALANCE: (email) => `paatho_bal_${email}`,
  TRIAL: (email) => `paatho_trial_${email}`,
  LETTERHEAD_META: (email) => `paatho_lh_meta_${email}`,
  BILLING: (email) => `paatho_billing_${email}`,
  ROLE: (email) => `paatho_role_${email}`
};

// Constants
const DB_NAME = 'paatho_db_pro';
const PER_CASE = 10;
const DOC_MAX = 100 * 1024 * 1024;
const LETTERHEAD_MAX = 5 * 1024 * 1024;
const LOGO_MAX = 5 * 1024 * 1024;

// Storage helpers
const saveLS = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const loadLS = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};
const rmLS = (key) => localStorage.removeItem(key);

export default function PathologyApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_data');
    const currentEmail = loadLS(LS_KEYS.CURRENT);

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        apiService.setToken(token);
        setCurrentUser(parsedUser.email || currentEmail);
        setUserData(parsedUser);
        console.log('✅ Session restored:', parsedUser);
      } catch (err) {
        console.error('Failed to restore session:', err);
        // Clear invalid data
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        rmLS(LS_KEYS.CURRENT);
      }
    }

    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    console.log('👋 Logging out...');

    // Clear state
    setCurrentUser(null);
    setUserData(null);

    // Clear storage
    rmLS(LS_KEYS.CURRENT);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    sessionStorage.clear();

    // Clear API token
    apiService.setToken(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E]">
      {currentUser && userData ? (
        <Dashboard
          currentUser={currentUser}
          userData={userData}
          onLogout={handleLogout}
          PER_CASE={PER_CASE}
          DOC_MAX={DOC_MAX}
        />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}