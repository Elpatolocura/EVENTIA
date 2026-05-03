import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') return;

    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/' || location.pathname === '/welcome') {
        // If we are on the home page or welcome page, minimize the app
        CapacitorApp.exitApp();
      } else if (canGoBack) {
        window.history.back();
      } else {
        navigate('/');
      }
    });

    return () => {
      backButtonListener.then(l => l.remove());
    };
  }, [location, navigate]);

  return null;
};

export default BackButtonHandler;
