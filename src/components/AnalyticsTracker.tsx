import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.VITE_GA_MEASUREMENT_ID && typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
}
