import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initPostHog, captureEvent } from '../lib/posthog';

export default function PostHogPageTracker() {
  const location = useLocation();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    // Track page views on route change
    captureEvent('$pageview', {
      $current_url: window.location.href,
      path: location.pathname,
    });
  }, [location.pathname]);

  return null;
}
