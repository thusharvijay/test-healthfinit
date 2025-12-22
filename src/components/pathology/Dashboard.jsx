// Dashboard.jsx - Updated component
"use client";

import { useDashboardState } from "./hooks/useDashboardState";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Notifications } from "./common/Notifications";
import { DashboardView } from "./views/DashboardView";
import { UploadView } from "./views/UploadView";
import { DocumentsView } from "./views/DocumentsView";
import { SettingsView } from "./views/SettingsView";
import { WalletView } from "./views/WalletView";
import { BillingView } from "./views/BillingView";
import { WalletModal } from "./modals/WalletModal";
import { TrialModal } from "./modals/TrialModal";
import { PaywallModal } from "./modals/PaywallModal";
import { PreviewModal } from "./modals/PreviewModal";
import { useState, useEffect, useRef } from "react";
import { DashboardTour } from "./DashboardTour";
import { useDashboardTour } from "./hooks/useDashboardTour";

export default function Dashboard({
  currentUser,
  userData,
  onLogout,
  PER_CASE = 10,
  DOC_MAX = 100 * 1024 * 1024,
}) {
  // ✅ ADD: Ref to trigger user edit from notifications
  const settingsViewRef = useRef(null);

  const LS_KEYS = {
    UI: (user) => `ui_prefs_${user}`,
    TRIAL: (user) => `trial_${user}`,
  };

  const saveLS = (key, data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const loadLS = (key) => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    }
    return null;
  };

  const state = useDashboardState({
    currentUser,
    userData,
    LS_KEYS,
    saveLS,
    loadLS,
    PER_CASE,
    DOC_MAX,
  });

  // ✅ ADD: Handler to open user edit from notification
  const handleOpenUserEditFromNotification = (userId, requestId) => {
    // Switch to settings view
    state.setCurrentView('settings');
    
    // Wait for settings view to mount, then trigger edit
    setTimeout(() => {
      if (settingsViewRef.current && settingsViewRef.current.openEditModal) {
        settingsViewRef.current.openEditModal(userId, requestId);
      }
    }, 100);
  };

  const renderContent = () => {
    switch (state.currentView) {
      case "dashboard":
        return (
          <DashboardView
            trial={state.trial}
            docs={state.docs}
            wallet={state.wallet}
            billing={state.billing}
            setShowWalletModal={state.setShowWalletModal}
            setCurrentView={state.setCurrentView}
            userRole={state.userRole}
          />
        );
      case "documents":
        return (
          <DocumentsView
            docs={state.docs}
            uiPrefs={state.uiPrefs}
            setUiPrefs={state.setUiPrefs}
            userRole={state.userRole}
            onPreview={state.openPreview}
            onDelete={state.handleDeleteDocument}
            onApprove={state.handleApproveDocument}
            saveLS={saveLS}
            LS_KEYS={LS_KEYS}
            currentUser={currentUser}
            loading={state.loading}
          />
        );
      case "upload":
        return (
          <UploadView
            handleFileUpload={state.handleFileUpload}
            uiPrefs={state.uiPrefs}
            setUiPrefs={state.setUiPrefs}
            letterheadMeta={state.letterheadMeta}
          />
        );
      case "settings":
        return (
          <SettingsView
            ref={settingsViewRef} // ✅ ADD: Pass ref to SettingsView
            userRole={state.userRole}
            users={state.users}
            branches={state.branches}
            sessions={state.sessions}        
            sessionStats={state.sessionStats} 
            onRefreshSessions={state.refreshSessions}  
            onDeleteSession={state.handleDeleteSession}
            onAddUser={state.handleAddUser}
            onUpdateUser={state.handleUpdateUser}
            onDeleteUser={state.handleDeleteUser}
            onToggleUserStatus={state.handleToggleUserStatus}
            onAddBranch={state.handleAddBranch}      
            onUpdateBranch={state.handleUpdateBranch} 
            onDeleteBranch={state.handleDeleteBranch}
            letterheadMeta={state.letterheadMeta}
            onUploadLetterhead={state.handleUploadLetterhead}
            onDownloadLetterhead={state.handleDownloadLetterhead}
            onRefreshUsers={state.fetchUsers} // ✅ ADD: Pass fetchUsers
            loading={state.loading}
            onRestartTour={restartTour}
          />
        );
      case "wallet":
        return (
          <WalletView
            wallet={state.wallet}
            onAddMoney={() => state.setShowWalletModal(true)}
            applyCoupon={state.applyCoupon}
          />
        );
      case "billing":
        return (
          <BillingView
            billing={state.billing}
            onExportBilling={state.exportBillingCsv}
            onExportDocs={state.exportDocsCsv}
            onGenerateInvoice={state.generateInvoice}
          />
        );
      default:
        return null;
    }
  };

  const { showTour, completeTour, skipTour, restartTour } = useDashboardTour(
    currentUser,
    state.userRole
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] flex">
      <Sidebar
        isMobileMenuOpen={state.isMobileMenuOpen}
        setIsMobileMenuOpen={state.setIsMobileMenuOpen}
        currentView={state.currentView}
        setCurrentView={state.setCurrentView}
        userData={state.userData}
        userRole={state.userRole}
        onLogout={state.handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={state.currentView}
          setIsMobileMenuOpen={state.setIsMobileMenuOpen}
          userData={state.userData}
          userRole={state.userRole}
          // ✅ ADD: Pass password reset handlers to Header
          onOpenUserEditFromNotification={handleOpenUserEditFromNotification}
          onRejectPasswordReset={state.handleRejectPasswordReset}
        />

        <main className="flex-1 overflow-y-auto">
          <Notifications error={state.error} success={state.success} />
          {renderContent()}
        </main>
      </div>

      <WalletModal
        show={state.showWalletModal}
        onClose={() => state.setShowWalletModal(false)}
        wallet={state.wallet}
        onRechargeSuccess={state.addWalletBalance}
      />

      <TrialModal
        show={state.showTrialModal}
        onClose={state.handleSeenWelcome}
        trial={{ left: state.trial.left || state.trial.trial_cases_left || 7 }}
      />

      <PaywallModal
        show={state.showPaywallModal}
        onClose={() => state.setShowPaywallModal(false)}
        wallet={state.wallet}
        computeCharge={state.computeCharge}
        onAddMoney={() => {
          state.setShowPaywallModal(false);
          state.setShowWalletModal(true);
        }}
      />

      <PreviewModal
        show={state.showPreviewModal}
        onClose={() => state.setShowPreviewModal(false)}
        name={state.previewData.name}
        url={state.previewData.url}
      />

      {showTour && (
        <DashboardTour
          userRole={state.userRole}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}
    </div>
  );
}