"use client";

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthPage from '../../components/pathology/AuthPage';
import { apiService } from '../../components/pathology/services/api';

const LOGO_MAX = 5 * 1024 * 1024;

export default function AuthRoute() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode'); // 'login' or 'signup'

    const handleLogin = (userDataFromLogin) => {
        console.log('🔐 Login successful from auth route:', userDataFromLogin);

        // Save to localStorage
        localStorage.setItem('paatho_current', JSON.stringify(userDataFromLogin.email));
        localStorage.setItem('user_data', JSON.stringify(userDataFromLogin));

        // Token should already be set by AuthPage
        const token = localStorage.getItem('access_token');
        if (token) {
            apiService.setToken(token);
        }

        // Redirect to main app
        navigate('/');
    };

    return (
        <AuthPage
            onLogin={handleLogin}
            LOGO_MAX={LOGO_MAX}
            initialMode={mode} // Pass mode to determine initial view
        />
    );
}
