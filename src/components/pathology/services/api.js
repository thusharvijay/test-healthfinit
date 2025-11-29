// services/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  removeToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async login(email, password) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    return this.request('/login', {
      method: 'POST',
      body: formData,
    });
  }

  // Session Management
  async logout() {
    return this.request('/logout', {
      method: 'POST',
    });
  }

  async getUserSessions(status = null, userId = null, limit = 50) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (userId) params.append('user_id', userId);
    if (limit) params.append('limit', limit);
    
    return this.request(`/sessions${params.toString() ? '?' + params.toString() : ''}`);
  }

  async getSessionStats() {
    return this.request('/sessions/stats');
  }

  async getMySessions(limit = 10) {
    return this.request(`/sessions/my-sessions?limit=${limit}`);
  }

  async markDisconnectedSessions() {
    return this.request('/sessions/mark-disconnected', {
      method: 'POST',
    });
  }

  async deleteSession(sessionId) {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard & Trial
  async getDashboardStats() {
    return this.request('/dashboard-stats');
  }

  async getTrialStatus() {
    return this.request('/trial-status');
  }

  // Document Management
  async uploadPathologyReport(file, letterheadPreference = 'Without Letter Head', selectedModel = null, selectedLanguage = 'hi') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('letterhead_preference', letterheadPreference);
    if (selectedModel) {
      formData.append('selected_model', selectedModel);
    }
    
    // FIX: Ensure we're sending the code, not the object
    const langCode = typeof selectedLanguage === 'string' ? selectedLanguage : selectedLanguage?.code || 'hi';
    formData.append('selected_language', langCode);
    
    console.log('Uploading with language:', langCode); // Add logging
    
    return this.request('/upload-pathology-report', {
      method: 'POST',
      body: formData,
    });
  }

  async getPathologyReports() {
    return this.request('/pathology-reports');
  }

  async approveReport(reportId) {
    return this.request(`/approve-report/${reportId}`, {
      method: 'PUT',
    });
  }

  async deleteReport(reportId) {
    return this.request(`/pathology-report/${reportId}`, {
      method: 'DELETE',
    });
  }

  async downloadReport(reportId) {
    const token = this.getToken();
    const url = `${API_BASE_URL}/download-report/${reportId}`;
    
    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Download failed: ${response.status} ${text}`);
    }

    // ✅ Parse JSON response instead of blob
    const data = await response.json();
    return data; // Returns { download_url: "...", status: "...", message: "..." }
  }

  async getReportProcessingStatus(reportId) {
    return this.request(`/report-processing-status/${reportId}`);
  }

  // Letterhead Management
  async uploadLetterhead(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload-letterhead', {
      method: 'POST',
      body: formData,
    });
  }

  async getLetterhead() {
    return this.request('/letterhead');
  }

  async deleteLetterhead() {
    return this.request('/letterhead', {
      method: 'DELETE',
    });
  }

  async downloadLetterhead(letterheadId) {
    const token = this.getToken();
    const url = `${API_BASE_URL}/download-letterhead/${letterheadId}`;
    
    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }

  // Wallet Management
  async getWalletInfo() {
    return this.request('/wallet');
  }

  async rechargeWallet(amount, paymentMethod = 'demo', paymentId = null) {
    return this.request('/wallet/recharge', {
      method: 'POST',
      // ❌ REMOVE THIS LINE: headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount,
        payment_method: paymentMethod,
        payment_id: paymentId
      }),
    });
  }

  async generateBill(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const queryString = params.toString();
    return this.request(`/generate-bill${queryString ? '?' + queryString : ''}`);
  }

  async exportBillingCsv() {
    return this.request('/export-billing-csv');
  }

  async exportDocumentsCsv() {
    return this.request('/export-documents-csv');
  }

  async downloadGstInvoicePdf(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const token = this.getToken();
    const url = `${API_BASE_URL}/download-gst-invoice-pdf${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }

    return response.blob();
  }

  // Branch Management
  async getBranches() {
    return this.request('/branches');
  }

  async createBranch(branchData) {
    return this.request('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  }

  async updateBranch(branchId, updateData) {
    return this.request(`/branches/${branchId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteBranch(branchId) {
    return this.request(`/branches/${branchId}`, {
      method: 'DELETE',
    });
  }

  // User Management (Admin only)
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, updateData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async toggleUserStatus(userId) {
    return this.request(`/users/${userId}/toggle-status`, {
      method: 'PUT',
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async requestPasswordReset(reason) {
    return this.request('/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getPasswordResetRequests() {
    return this.request('/password-reset/requests');
  }

  async adminResetPassword(requestId, newPassword) {
    return this.request(`/password-reset/admin-reset/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
  }

  async rejectPasswordReset(requestId) {
    return this.request(`/password-reset/reject/${requestId}`, {
      method: 'POST',
    });
  }

  async cancelMyPasswordResetRequest() {
    return this.request('/password-reset/cancel-my-request', {
      method: 'DELETE',
    });
  }

  async adminRequestPasswordResetOTP(email) {
    return this.request('/admin/password-reset/request-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async adminVerifyOTPAndResetPassword(email, otp, newPassword) {
    return this.request('/admin/password-reset/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email,
        otp,
        new_password: newPassword
      }),
    });
  }
}

export const apiService = new ApiService();