import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Play } from 'lucide-react';

// Tour steps configuration
const TOUR_STEPS = {
  Admin: [
    {
      id: 'welcome',
      title: 'Welcome to Your Lab Dashboard! 👋',
      description: 'Let\'s take a quick tour of the key features. This will only take 2 minutes.',
      target: null,
      position: 'center'
    },
    {
      id: 'sidebar-navigation',
      title: 'Navigation Menu',
      description: 'Access all sections from here: Dashboard, Documents, Upload, Wallet, Billing, and Settings.',
      target: '[data-tour="sidebar"]',
      position: 'right',
      highlight: true
    },
    {
      id: 'dashboard-stats',
      title: 'Quick Overview',
      description: 'Monitor your trial cases, uploaded documents, wallet balance, and plan status at a glance.',
      target: '[data-tour="stats-cards"]',
      position: 'bottom',
      highlight: true
    },
    {
      id: 'upload-button',
      title: 'Upload Documents',
      description: 'Click here to upload pathology reports. You can choose letterhead preferences and AI models during upload.',
      target: '[data-tour="upload-nav"]',
      position: 'right',
      highlight: true
    },
    {
      id: 'wallet',
      title: 'Manage Your Wallet',
      description: 'Add funds to your wallet for processing documents after your trial ends. ₹10 per case.',
      target: '[data-tour="wallet-nav"]',
      position: 'right',
      highlight: true
    },
    {
      id: 'settings',
      title: 'Settings & User Management',
      description: 'Add technicians, manage branches, upload letterhead, and configure your lab settings here.',
      target: '[data-tour="settings-nav"]',
      position: 'right',
      highlight: true
    },
    {
      id: 'notifications',
      title: 'Stay Updated',
      description: 'Check notifications for upload status, approval requests, and password reset requests from technicians.',
      target: '[data-tour="notifications"]',
      position: 'bottom-left',
      highlight: true
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🎉',
      description: 'You can restart this tour anytime from Settings. Ready to start uploading documents?',
      target: null,
      position: 'center'
    }
  ],
  Technician: [
    {
      id: 'welcome',
      title: 'Welcome to Your Dashboard! 👋',
      description: 'Let\'s quickly show you how to upload and manage pathology reports.',
      target: null,
      position: 'center'
    },
    {
      id: 'sidebar-navigation',
      title: 'Navigation Menu',
      description: 'Access Dashboard, Documents, and Upload sections from here.',
      target: '[data-tour="sidebar"]',
      position: 'right',
      highlight: true
    },
    {
      id: 'dashboard-stats',
      title: 'Your Overview',
      description: 'See how many trial cases are left and total documents you\'ve uploaded.',
      target: '[data-tour="stats-cards"]',
      position: 'bottom',
      highlight: true
    },
    {
      id: 'upload-button',
      title: 'Upload Documents',
      description: 'Click here to upload pathology reports. Your uploads will need admin approval before processing.',
      target: '[data-tour="upload-nav"]',
      position: 'right',
      highlight: true
    },
    {
      id: 'documents',
      title: 'View Your Documents',
      description: 'Check the status of your uploaded documents here - pending approval or approved.',
      target: '[data-tour="documents-nav"]',
      position: 'right',
      highlight: true
    },
    {
      id: 'notifications',
      title: 'Stay Updated',
      description: 'Get notified when your documents are approved or if there are any issues.',
      target: '[data-tour="notifications"]',
      position: 'bottom-left',
      highlight: true
    },
    {
      id: 'complete',
      title: 'You\'re Ready! 🎉',
      description: 'Start uploading documents and your admin will approve them. Happy reporting!',
      target: null,
      position: 'center'
    }
  ]
};

export function DashboardTour({ userRole, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);

  const steps = TOUR_STEPS[userRole] || TOUR_STEPS.Admin;
  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (!step.target || !isVisible) return;

    const calculatePosition = () => {
      const targetElement = document.querySelector(step.target);
      if (!targetElement || !tooltipRef.current) return;

      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const padding = 20;

      let top = 0;
      let left = 0;

      switch (step.position) {
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + padding;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - padding;
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        case 'bottom-left':
          top = targetRect.bottom + padding;
          left = targetRect.left - tooltipRect.width + targetRect.width;
          break;
        case 'top':
          top = targetRect.top - tooltipRect.height - padding;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          break;
        default:
          break;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < padding) left = padding;
      if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > viewportHeight - padding) {
        top = viewportHeight - tooltipRect.height - padding;
      }

      setTooltipPosition({ top, left });
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
    };
  }, [step, isVisible]);

  useEffect(() => {
    if (!step.target) return;

    const targetElement = document.querySelector(step.target);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  if (!isVisible) return null;

  if (!step.target || step.position === 'center') {
    return (
      <>
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[9998] animate-in fade-in duration-300" />
        
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-blue-500">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                {isLastStep ? (
                  <Check size={32} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <Play size={32} className="text-blue-600 dark:text-blue-400" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-[#151515] dark:text-[#F9FAFB] mb-3">
                {step.title}
              </h2>
              
              <p className="text-[#6E7380] dark:text-[#9CA3AF] mb-6 text-base leading-relaxed">
                {step.description}
              </p>

              <div className="flex items-center justify-center gap-2 mb-6">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-blue-600'
                        : index < currentStep
                        ? 'w-2 bg-blue-400'
                        : 'w-2 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {!isLastStep && (
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-4 py-3 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#6E7380] dark:text-[#9CA3AF] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors font-medium"
                  >
                    Skip Tour
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isLastStep ? 'Get Started' : 'Start Tour'}
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        {step.highlight && step.target && (
          <div
            className="absolute animate-pulse"
            style={{
              top: `${document.querySelector(step.target)?.getBoundingClientRect().top - 8}px`,
              left: `${document.querySelector(step.target)?.getBoundingClientRect().left - 8}px`,
              width: `${document.querySelector(step.target)?.getBoundingClientRect().width + 16}px`,
              height: `${document.querySelector(step.target)?.getBoundingClientRect().height + 16}px`,
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>

      <div
        ref={tooltipRef}
        className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-300"
        style={{ top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }}
      >
        <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl max-w-sm p-6 border-2 border-blue-500">
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
          >
            <X size={18} className="text-[#6E7380] dark:text-[#9CA3AF]" />
          </button>

          <div className="pr-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {currentStep + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#151515] dark:text-[#F9FAFB]">
                {step.title}
              </h3>
            </div>
            
            <p className="text-[#6E7380] dark:text-[#9CA3AF] mb-4 text-sm leading-relaxed">
              {step.description}
            </p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#8F94A3] dark:text-[#9CA3AF]">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="flex gap-1">
                {steps.slice(1, -1).map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 px-4 py-2 border border-[#E6E8F0] dark:border-[#2A2A2A] text-[#6E7380] dark:text-[#9CA3AF] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className={`${isFirstStep ? 'flex-1' : 'flex-1'} px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1`}
              >
                {isLastStep ? 'Finish' : 'Next'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}