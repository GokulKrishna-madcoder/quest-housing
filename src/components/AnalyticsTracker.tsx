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
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        path: location.pathname,
        session_id: sessionStorage.getItem('qh_session') || crypto.randomUUID(),
      }),
    }).catch(() => {});
  }, [location]);

  return null;
}
