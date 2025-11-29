// services/authService.js
import axios from 'axios';

// Configure your backend base URL here
const BASE_URL = 'http://127.0.0.1:8000';

const authAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 200000,
  // Don't set default Content-Type, let it be set per request
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // FIXED: Added backticks
  }
  return config;
});

// Add response interceptor for better error handling
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      // Throw the whole response so you can read err.response.data.detail
      return Promise.reject(error.response);
    } else if (error.request) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export const authService = {
  // Register user
  async register(userData) {
    const formData = new FormData();
    formData.append('lab', userData.lab);
    formData.append('owner', userData.owner);
    formData.append('email', userData.email);
    formData.append('phone', userData.phone);
    formData.append('password', userData.password);
    formData.append('address', userData.address);
    formData.append('city', userData.city);
    formData.append('state', userData.state);
    formData.append('role', 'Admin');
    
    if (userData.gst && userData.gst.trim()) {
      formData.append('gst', userData.gst);
    }
    if (userData.nabl && userData.nabl.trim()) {
      formData.append('nabl', userData.nabl);
    }
    if (userData.logo && userData.logo[0]) {
      formData.append('logo', userData.logo[0]);
    }

    console.log('Sending registration data:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Don't set Content-Type header, let browser set it with boundary
    const response = await authAPI.post('/register', formData, {
      headers: {
        // Browser will automatically set 'Content-Type': 'multipart/form-data; boundary=...'
      }
    });
    
    console.log('Registration response:', response.data);
    return response.data;
  },

  // Verify OTP
  async verifyOTP(email, otp) {
    const response = await authAPI.post('/verify-otp', {
      email,
      otp: parseInt(otp),
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  },

  // Login user
  async login(email, password) {
    const response = await authAPI.post('/login', {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  },

  // Logout user
  async logout() {
    const response = await authAPI.post('/logout', {}, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  },

  // Resend OTP - FIXED: Backend expects FormData, not JSON
  async resendOTP(email) {
    const formData = new FormData();
    formData.append('email', email);
    
    const response = await authAPI.post('/resend-otp', formData, {
      headers: {
        // Browser will automatically set Content-Type
      }
    });
    return response.data;
  },

  async requestAdminPasswordResetOTP(email) {
    const response = await authAPI.post('/admin/password-reset/request-otp', {
      email,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  },

  async verifyAdminOTPAndResetPassword(email, otp, newPassword) {
    const response = await authAPI.post('/admin/password-reset/verify-otp', {
      email,
      otp,
      new_password: newPassword,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  },

};

export default authService;