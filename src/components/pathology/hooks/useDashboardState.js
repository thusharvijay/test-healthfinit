"use client";
import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api";
import { notificationService } from "../services/notificationService";

export function useDashboardState({
  currentUser,
  userData,
  LS_KEYS,
  saveLS,
  loadLS,
  PER_CASE,
  DOC_MAX,
}) {
  const [currentView, setCurrentView] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("Admin");
  const [userDataState, setUserDataState] = useState(userData);
  const [branches, setBranches] = useState([]);
  const [docs, setDocs] = useState([]);
  const [billing, setBilling] = useState([]);
  const [users, setUsers] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [trial, setTrial] = useState({ left: 7, used: 0, seenWelcome: false });
  const [letterheadMeta, setLetterheadMeta] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [uiPrefs, setUiPrefs] = useState({
    search: "",
    head: "all",
    date: "all",
    status: "all",
    letterhead: null,
    prompt: "",
  });

  const [couponState, setCouponState] = useState({
    waiveLeft: 0,
    rate: PER_CASE,
    countLeft: 0,
  });

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState({ name: "", url: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        apiService.setToken(token);
      }

      const storedUserData = localStorage.getItem('user_data');
      const currentUserData = storedUserData ? JSON.parse(storedUserData) : userData;
      setUserDataState(userData);
      setUserRole(userData?.role || "Admin");
      setLoading(true);

      // Load dashboard stats

      const dashboardStats = await apiService.getDashboardStats();

      const savedTrialData = loadLS(LS_KEYS.TRIAL(currentUser));
      const hasSeenWelcome = savedTrialData?.seenWelcome || false;
      const trialLeft = dashboardStats.trial_cases_left ?? 7;  // ✅ Use nullish coalescing

      setTrial({
        left: trialLeft,
        used: 7 - trialLeft,
        seenWelcome: hasSeenWelcome,
      });

      // ✅ Save the updated trial data to localStorage
      saveLS(LS_KEYS.TRIAL(currentUser), {
        left: trialLeft,
        used: 7 - trialLeft,
        seenWelcome: hasSeenWelcome,
      });

      if (!hasSeenWelcome && trialLeft > 0) {
        setShowTrialModal(true);
      }
      setWallet(dashboardStats.coin_balance);

      // Load documents (no per-doc download calls anymore 🚀)
      const apiDocs = await apiService.getPathologyReports();
      const docsWithUrls = apiDocs.map((doc) => ({
        id: doc.id,
        name: doc.file_name,
        size: doc.file_size,
        dateISO: doc.uploaded_at,
        head: doc.letterhead_preference,
        status: doc.status,
        fileUrl: doc.file_url,
        uploader_name: doc.uploader_name,
        uploader_role: doc.uploader_role
      }));
      setDocs(docsWithUrls);

      // Load letterhead
      try {
        const letterhead = await apiService.getLetterhead();
        if (letterhead) {
          setLetterheadMeta({
            hasLogo: true,
            fileName: letterhead.file_name,
            id: letterhead.id,
            fileUrl: letterhead.file_url
          });
        } else {
          setLetterheadMeta({ hasLogo: false });
        }
      } catch {
        setLetterheadMeta({ hasLogo: false });
      }

      try {
        const walletInfo = await apiService.getWalletInfo();
        setWallet(walletInfo.coin_balance);
        
        // Transform transactions to billing format expected by UI
        const billingData = walletInfo.recent_transactions
          .filter(t => t.transaction_type === 'debit')
          .map(t => {
            // Use backend-provided filename directly
            const fileName = t.file_name || 'Unknown Document';
            
            return {
              time: t.created_at,
              docId: t.reference_id ? t.reference_id.substring(0, 6).toUpperCase() : 'N/A',
              fileName: fileName,
              mode: t.description && t.description.includes('Trial') ? 'Trial' : 'Wallet',
              charge: Math.abs(t.amount),
              balanceAfter: t.balance_after,
              uploaderName: t.uploader_name,
              uploaderRole: t.uploader_role
            };
          });
                
        setBilling(billingData);
      } catch (err) {
        console.warn("Could not load wallet info:", err);
      }

      // Load technicians if admin
      if ((userData?.role || "Admin") === "Admin") {
        // Load branches
        try {
          const branchesData = await apiService.getBranches();
          setBranches(branchesData);
        } catch (err) {
          console.warn("Could not load branches:", err);
        }
        
        // Load users
        try {
          const users = await apiService.getUsers();
          setUsers(users);
        } catch (err) {
          console.warn("Could not load users:", err);
        }

        // Load sessions for admin
        try {
          const sessionsData = await apiService.getUserSessions();
          setSessions(sessionsData);
          
          const stats = await apiService.getSessionStats();
          setSessionStats(stats);
        } catch (err) {
          console.warn("Could not load sessions:", err);
        }
        
        // Load password reset requests (non-blocking)
        try {
          // Clear old password reset notifications to avoid duplicates
          notificationService.clearNotificationsByType('password_reset');
          
          const resetRequests = await apiService.getPasswordResetRequests();
          
          // For each request, create a notification (only if it doesn't exist)
          resetRequests.forEach(request => {
            // Check if notification already exists for this request
            if (!notificationService.hasNotificationWithRequestId(request.id)) {
              notificationService.addNotification(
                'warning',
                'Password Reset Request',
                `${request.user_name} (${request.user_email}) has requested a password reset`,
                {
                  type: 'password_reset',
                  request_id: request.id,
                  user_id: request.user_id,
                  user_name: request.user_name,
                  user_email: request.user_email,
                  reason: request.reason
                }
              );
            }
          });
        } catch (err) {
          console.debug("Password reset requests not available:", err.message);
        }
      }

      // UI prefs
      const userUiPrefs = loadLS(LS_KEYS.UI(currentUser)) || {
        search: "",
        head: "all",
        date: "all",
        status: "all",
        letterhead: null,
        prompt: "",
      };
      setUiPrefs(userUiPrefs);
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, [currentUser, LS_KEYS, loadLS, userData]);

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call logout endpoint to end session
      try {
        await apiService.logout();
      } catch (err) {
        console.warn('Logout API call failed:', err);
        // Continue with local cleanup even if API fails
      }
      
      // Clear all local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('session_id');
      apiService.removeToken();
      
      // Redirect to login or refresh page
      window.location.href = '/'; // or however you handle navigation
      
    } catch (err) {
      console.error('Logout error:', err);
      // Force logout even on error
      localStorage.clear();
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const users = await apiService.getUsers();
      setUsers(users);
    } catch (err) {
      console.warn("Could not load users:", err);
    }
  }, []);

  const addBill = useCallback(
    (charge, docId, fileName, modeLabel) => {
      const newBill = {
        time: new Date().toISOString(),
        docId,
        fileName,
        mode: modeLabel,
        charge,
        balanceAfter: wallet - charge,
      };

      const newBilling = [newBill, ...billing];
      setBilling(newBilling);
      saveLS(LS_KEYS.BILLING(currentUser), newBilling);
    },
    [billing, wallet, currentUser, LS_KEYS, saveLS],
  );

  const computeCharge = useCallback(() => {
    if (trial.left > 0) return 0;
    if (couponState.waiveLeft > 0) return 0;
    return couponState.countLeft > 0 ? couponState.rate : PER_CASE;
  }, [trial, couponState, PER_CASE]);

  const applyCharge = useCallback(
    (charge, docId, fileName, modeLabel) => {
      if (charge > 0 && wallet < charge) {
        setShowPaywallModal(true);
        return false;
      }

      if (charge > 0) {
        const newBalance = wallet - charge;
        setWallet(newBalance);
        saveLS(LS_KEYS.BALANCE(currentUser), newBalance);
      }

      addBill(charge, docId, fileName, modeLabel);
      return true;
    },
    [wallet, addBill, currentUser, LS_KEYS, saveLS],
  );

  const handleFileUpload = useCallback(
    async (file, letterheadPref, selectedModel, selectedLanguage) => {
      if (!file) return;

      if (file.size > DOC_MAX) {
        setError("File size must be less than 100MB");
        return;
      }

      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }

      setLoading(true);
      setError("");

      try {

        console.log('Selected language object:', selectedLanguage); // Add logging
        console.log('Language code being sent:', selectedLanguage?.code); // Add logging
        
        const response = await apiService.uploadPathologyReport(
          file, 
          letterheadPref,
          selectedModel?.id,
          selectedLanguage?.code
        );
        
        // Create blob URL for immediate preview
        const blobUrl = URL.createObjectURL(file);
        const newDoc = {
          id: response.file_id,
          name: file.name,
          size: file.size,
          dateISO: new Date().toISOString(),
          head: letterheadPref,
          status: response.status,
          blobUrl: blobUrl,
          model: selectedModel?.name,
          language: selectedLanguage?.name,
          uploader_name: userData?.owner_name || userData?.name || 'Unknown',
          uploader_role: userRole || userData?.role || 'Unknown'
        };

        const newDocs = [newDoc, ...docs];
        setDocs(newDocs);

        // Update trial count
        setTrial(prev => ({
          ...prev,
          left: response.trial_cases_left,  // ✅ Backend returns trial_cases_left
          used: 7 - response.trial_cases_left
        }));

        if (response.status === 'Pending') {
          notificationService.addNotification(
            'info',
            'Awaiting Approval',
            `${file.name} has been uploaded and sent to admin for approval`
          );
        } else {
          notificationService.addNotification(
            'success',
            'Document Uploaded',
            `${file.name} has been uploaded and is being processed`
          );
        }
        //setSuccess("Document uploaded successfully!");
        
        try {
          const walletInfo = await apiService.getWalletInfo();
          setWallet(walletInfo.coin_balance);
          
          // Transform and update billing
          const billingData = walletInfo.recent_transactions
            .filter(t => t.transaction_type === 'debit')
            .map(t => {
              const fileName = t.file_name || 'Unknown Document';
              
              return {
                time: t.created_at,
                docId: t.reference_id ? t.reference_id.substring(0, 6).toUpperCase() : 'N/A',
                fileName: fileName,
                mode: t.description && t.description.includes('Trial') ? 'Trial' : 'Wallet',
                charge: Math.abs(t.amount),
                balanceAfter: t.balance_after,
                uploaderName: t.uploader_name,
                uploaderRole: t.uploader_role
              };
            });
          
          setBilling(billingData);
        } catch (err) {
          console.warn("Could not reload wallet info:", err);
        }
      } catch (err) {
        console.error("Upload error:", err);
        
        // ✅ FIXED: Proper error extraction
        let errorMessage = 'Failed to upload document';
        
        // Check different error structures
        if (err?.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err?.detail) {
          errorMessage = err.detail;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        notificationService.addNotification(
          'error',
          'Upload Failed',
          errorMessage
        );
      } finally {
        setLoading(false);
      }
    },
    [docs, DOC_MAX]
  );

  const addWalletBalance = async (amount) => {
    try {
      const tokenFromStorage = localStorage.getItem('access_token');
      
      if (tokenFromStorage) {
        apiService.setToken(tokenFromStorage);
      } else {
        console.error('NO TOKEN IN LOCALSTORAGE!');
      }
      
      const response = await apiService.rechargeWallet(amount, 'demo');
      
      // ✅ FIXED: Reload wallet info from the same endpoint used in loadUserData
      const walletInfo = await apiService.getWalletInfo();
      setWallet(walletInfo.coin_balance); // This matches what loadUserData does

      notificationService.addNotification(
        'success',
        'Wallet Recharged',
        `₹${amount} has been added to your wallet. New balance: ${walletInfo.coin_balance} coins`
      );

      setShowWalletModal(false);
      setShowPaywallModal(false);
    } catch (error) {
      console.error('ADD WALLET ERROR:', error);
      setError(error.message || 'Failed to recharge wallet');

      notificationService.addNotification(
        'error',
        'Recharge Failed',
        error.message || 'Failed to recharge wallet. Please try again.'
      );

      throw error;
    }
  };

  const handleSeenWelcome = () => {
    setShowTrialModal(false);
    const newTrial = { ...trial, seenWelcome: true };
    setTrial(newTrial);
    saveLS(LS_KEYS.TRIAL(currentUser), newTrial);
  };

  const handleApproveDocument = useCallback(
    async (docId) => {
      const doc = docs.find((d) => d.id === docId);
      if (!doc || doc.status === "Approved") return;

      setLoading(true);
      try {
        await apiService.approveReport(docId);

        // Update document status locally
        const updatedDocs = docs.map((d) =>
          d.id === docId ? { ...d, status: "Approved" } : d
        );
        setDocs(updatedDocs);

        notificationService.addNotification(
          'success',
          'Document Approved',
          `Document has been approved successfully`
        );
        //setSuccess("Document approved successfully!");
      } catch (err) {
        console.error("Approve error:", err);
        notificationService.addNotification(
          'error',
          'Approval Failed',
          err.message || 'Failed to approve document'
        );
        //setError(err.message || "Failed to approve document");
      } finally {
        setLoading(false);
      }
    },
    [docs]
  );

  const handleDeleteDocument = useCallback(
    async (docId) => {
      try {
        // Optimistically remove from UI first
        const updatedDocs = docs.filter((d) => d.id !== docId);
        setDocs(updatedDocs);

        // Then delete from backend
        await apiService.deleteReport(docId);

        // Revoke blob URL if exists
        const docToRemove = docs.find((d) => d.id === docId);
        if (docToRemove?.blobUrl) {
          URL.revokeObjectURL(docToRemove.blobUrl);
        }

        notificationService.addNotification(
          'info',
          'Document Deleted',
          'Document has been removed from the system'
        );
      } catch (err) {
        console.error("Delete error:", err);
        
        // Restore document on error by reloading
        try {
          const apiDocs = await apiService.getPathologyReports();
          const docsWithUrls = apiDocs.map((doc) => ({
            id: doc.id,
            name: doc.file_name,
            size: doc.file_size,
            dateISO: doc.uploaded_at,
            head: doc.letterhead_preference,
            status: doc.status,
            fileUrl: doc.file_url,
            uploader_name: doc.uploader_name,
            uploader_role: doc.uploader_role
          }));
          setDocs(docsWithUrls);
        } catch (reloadErr) {
          console.error("Failed to reload docs:", reloadErr);
        }
        
        notificationService.addNotification(
          'error',
          'Deletion Failed',
          err.message || 'Failed to delete document'
        );
      }
    },
    [docs]
  );

  const handleAddUser = useCallback(async (userData) => {
    try {
      setLoading(true);

      if (!userData.branch_id) {
        setError("Please select a branch for this user");
        return;
      }
      
      // Create payload matching backend UserCreate model
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password, // Now required from UI
        role: userData.role,
        phone: userData.phone || null,
        state: userData.state || null,
        address: userData.address || null,
        district: userData.district || null,
        branch_id: userData.branch_id
      };
      
      const response = await apiService.createUser(payload);
      
      // Reload users list
      const updatedUsers = await apiService.getUsers();
      setUsers(updatedUsers);
      notificationService.addNotification(
        'success',
        'User Added',
        `${userData.name} has been added as ${userData.role}`
      );
      //setSuccess(response.message || "User added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add user");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateUser = useCallback(async (userId, updateData) => {
    try {
      setLoading(true);
      
      // Create payload matching backend UserUpdate model
      const payload = {
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone || null,
        state: updateData.state || null,
        address: updateData.address || null,
        district: updateData.district || null,
        role: updateData.role,
        status: updateData.status // Backend converts this to is_active
      };
      
      await apiService.updateUser(userId, payload);

      // Handle password reset if provided
      if (updateData.newPassword && updateData.newPassword.trim()) {
        try {
          // If there's a password reset request ID, approve it
          if (updateData.passwordResetRequestId) {
            await apiService.adminResetPassword(
              updateData.passwordResetRequestId, 
              updateData.newPassword
            );
            notificationService.addNotification(
              'success',
              'Password Reset',
              `Password updated successfully for ${updateData.name}`
            );
          }
        } catch (err) {
          console.error('Password reset error:', err);
          notificationService.addNotification(
            'error',
            'Password Reset Failed',
            err.message || 'Failed to reset password'
          );
        }
      }
      
      // Reload users list
      const updatedUsers = await apiService.getUsers();
      setUsers(updatedUsers);
      
      setSuccess("User updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleUserStatus = useCallback(async (userId) => {
    try {
      await apiService.toggleUserStatus(userId);
      
      // Reload users list
      const updatedUsers = await apiService.getUsers();
      setUsers(updatedUsers);
      
      setSuccess("User status updated!");
    } catch (err) {
      setError(err.message || "Failed to update status");
    }
  }, []);

  const handleDeleteUser = useCallback(async (userId) => {
    try {
      await apiService.deleteUser(userId);
      
      // Reload users list  
      const updatedUsers = await apiService.getUsers();
      setUsers(updatedUsers);
      
      setSuccess("User deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  }, []);

  const handlePasswordResetRequest = useCallback(async (reason) => {
    try {
      const response = await apiService.requestPasswordReset(reason);
      // Use different type for technician's own notification
      notificationService.addNotification(
        'success',
        'Request Submitted',
        'Your password reset request has been sent to your admin',
        {
          type: 'password_reset_submitted', // Different type than admin notifications
          user_specific: true
        }
      );
      return response;
    } catch (err) {
      notificationService.addNotification(
        'error',
        'Request Failed',
        err.message || 'Failed to submit password reset request',
        {
          type: 'password_reset_error',
          user_specific: true
        }
      );
      throw err;
    }
  }, []);

  const handleRejectPasswordReset = useCallback(async (requestId) => {
    try {
      await apiService.rejectPasswordReset(requestId);
      notificationService.addNotification(
        'info',
        'Request Rejected',
        'Password reset request has been rejected'
      );
    } catch (err) {
      notificationService.addNotification(
        'error',
        'Rejection Failed',
        err.message || 'Failed to reject password reset request'
      );
      throw err;
    }
  }, []);

  const handleAddBranch = useCallback(async (branchData) => {
    try {
      setLoading(true);
      await apiService.createBranch(branchData);
      
      // Reload branches
      const updatedBranches = await apiService.getBranches();
      setBranches(updatedBranches);
      
      setSuccess("Branch added successfully!");
    } catch (err) {
      setError(err.message || "Failed to add branch");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateBranch = useCallback(async (branchId, updateData) => {
    try {
      setLoading(true);
      await apiService.updateBranch(branchId, updateData);
      
      // Reload branches
      const updatedBranches = await apiService.getBranches();
      setBranches(updatedBranches);

      if (updateData.is_active !== undefined) {
        const updatedUsers = await apiService.getUsers();
        setUsers(updatedUsers);
      }
      
      setSuccess("Branch updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update branch");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteBranch = useCallback(async (branchId) => {
    try {
      setLoading(true);
      await apiService.deleteBranch(branchId);
      
      // Reload branches
      const updatedBranches = await apiService.getBranches();
      setBranches(updatedBranches);
      
      setSuccess("Branch deleted successfully!");
    } catch (err) {
      setError(err.message || "Failed to delete branch");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUploadLetterhead = useCallback(async (file) => {
    try {
      setLoading(true);
      const response = await apiService.uploadLetterhead(file);
      
      // Reload letterhead
      const letterhead = await apiService.getLetterhead();
      if (letterhead) {
        setLetterheadMeta({
          hasLogo: true,
          fileName: letterhead.file_name,
          id: letterhead.id,
          fileUrl: letterhead.file_url
        });
        notificationService.addNotification(
          'success',
          'Letterhead Uploaded',
          'Your letterhead has been uploaded successfully'
        );
      }
    } catch (err) {
      notificationService.addNotification(
        'error',
        'Upload Failed',
        err.message || 'Failed to upload letterhead'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownloadLetterhead = useCallback(async () => {
    if (!letterheadMeta?.id) return;
    
    try {
      const blob = await apiService.downloadLetterhead(letterheadMeta.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = letterheadMeta.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download letterhead");
    }
  }, [letterheadMeta]);

  const refreshSessions = useCallback(async () => {
    if (userRole !== 'Admin') return;
    
    try {
      setLoading(true);
      const sessionsData = await apiService.getUserSessions();
      setSessions(sessionsData);
      
      const stats = await apiService.getSessionStats();
      setSessionStats(stats);
      
      notificationService.addNotification(
        'success',
        'Sessions Refreshed',
        'Session data has been updated'
      );
    } catch (err) {
      notificationService.addNotification(
        'error',
        'Refresh Failed',
        err.message || 'Failed to refresh sessions'
      );
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  const handleDeleteSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      await apiService.deleteSession(sessionId);
      
      // Refresh sessions after delete
      const sessionsData = await apiService.getUserSessions();
      setSessions(sessionsData);
      
      const stats = await apiService.getSessionStats();
      setSessionStats(stats);
      
      notificationService.addNotification(
        'success',
        'Session Deleted',
        'Session has been removed'
      );
    } catch (err) {
      notificationService.addNotification(
        'error',
        'Delete Failed',
        err.message || 'Failed to delete session'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const openPreview = useCallback((name, url) => {
    setPreviewData({ name, url });
    setShowPreviewModal(true);
  }, []);

  const applyCoupon = useCallback(
    async (code) => {
      const upperCode = code.toUpperCase();
      let applied = false;

      // For successful coupon
      switch (upperCode) {
        case "ADD100":
          await addWalletBalance(100);
          notificationService.addNotification('success', 'Coupon Applied', '₹100 added to wallet');
          applied = true;
          break;
        case "CASEFREE1":
          setCouponState((prev) => ({ ...prev, waiveLeft: prev.waiveLeft + 1 }));
          notificationService.addNotification('success', 'Coupon Applied', 'Next case will be free!');
          applied = true;
          break;
        case "BULK50":
          setCouponState((prev) => ({ ...prev, rate: 5, countLeft: prev.countLeft + 10 }));
          notificationService.addNotification('success', 'Coupon Applied', 'Next 10 cases at ₹5 each!');
          applied = true;
          break;
        default:
          notificationService.addNotification('error', 'Invalid Coupon', 'The coupon code you entered is not valid');
      }

      return applied;
    },
    [addWalletBalance],
  );

  const downloadCsv = useCallback((data, filename) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportBillingCsv = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.exportBillingCsv();
      
      // Create and download CSV
      const blob = new Blob([response.csv_data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing_${currentUser}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess("Billing data exported!");
    } catch (err) {
      setError(err.message || "Failed to export billing data");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const exportDocsCsv = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.exportDocumentsCsv();
      
      // Create and download CSV
      const blob = new Blob([response.csv_data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documents_${currentUser}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess("Documents data exported!");
    } catch (err) {
      setError(err.message || "Failed to export documents");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);


  const generateInvoice = useCallback(async (month) => {
    try {
      setLoading(true);
      
      // Calculate date range for the selected month
      const startDate = new Date(month);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      
      // Format dates without timezone suffix (remove 'Z')
      const formatDateForBackend = (date) => {
        return date.toISOString().replace('Z', '');
      };
      
      // Download PDF invoice from backend
      const blob = await apiService.downloadGstInvoicePdf(
        formatDateForBackend(startDate),  // ✅ Removes 'Z'
        formatDateForBackend(endDate)     // ✅ Removes 'Z'
      );
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GST_Invoice_${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      notificationService.addNotification(
        'success',
        'Invoice Generated',
        'Your GST invoice has been downloaded successfully'
      );
      //setSuccess("Invoice generated successfully!");
    } catch (err) {
      notificationService.addNotification(
        'error',
        'Invoice Generation Failed',
        err.message || 'Failed to generate invoice'
      );
      //setError(err.message || "Failed to generate invoice");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const shouldShowWelcome = sessionStorage.getItem('show_welcome_modal');
    
    if (shouldShowWelcome === 'true' && !loading) {
      sessionStorage.removeItem('show_welcome_modal');  // ✅ Clear flag
      const timer = setTimeout(() => {
        setShowTrialModal(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  return {
    currentView,
    setCurrentView,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    userData: userDataState,
    userRole,
    docs,
    billing,
    wallet,
    trial,
    letterheadMeta,
    uiPrefs,
    setUiPrefs,
    branches,  
    sessions,
    sessionStats,
    handleAddBranch, 
    handleUpdateBranch,  
    handleDeleteBranch,
    users, // Technicians list
    showWalletModal,
    setShowWalletModal,
    showTrialModal,
    setShowTrialModal,
    showPaywallModal,
    setShowPaywallModal,
    showPreviewModal,
    setShowPreviewModal,
    previewData,
    setPreviewData,
    loading,
    error,
    success,
    handleFileUpload,
    addWalletBalance,
    computeCharge,
    handleSeenWelcome,
    handleApproveDocument,
    handleDeleteDocument,
    openPreview,
    applyCoupon,
    exportBillingCsv,
    exportDocsCsv,
    generateInvoice,
    handleLogout,
    handleAddUser,
    handleUpdateUser,
    handleToggleUserStatus,
    handleDeleteUser,
    handleUploadLetterhead,
    handleDownloadLetterhead,
    fetchUsers, 
    refreshSessions,
    handleDeleteSession,
    handlePasswordResetRequest,
    handleRejectPasswordReset, 
    handlePasswordResetRequest,  
    handleRejectPasswordReset,
  };
}
