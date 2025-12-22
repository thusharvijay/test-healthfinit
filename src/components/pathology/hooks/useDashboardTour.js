import { useState, useEffect } from 'react';

export function useDashboardTour(userId, userRole) {
  const [showTour, setShowTour] = useState(false);
  const TOUR_KEY = `dashboard_tour_completed_${userId}`;

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(TOUR_KEY);
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [TOUR_KEY]);

  const completeTour = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setShowTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setShowTour(false);
  };

  const restartTour = () => {
    setShowTour(true);
  };

  return {
    showTour,
    completeTour,
    skipTour,
    restartTour
  };
}