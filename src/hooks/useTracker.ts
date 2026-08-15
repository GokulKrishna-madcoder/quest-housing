import { useCallback } from 'react';
import { captureEvent } from '../lib/posthog';

const getSessionId = () => {
  let id = sessionStorage.getItem('qh_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('qh_session', id);
  }
  return id;
};

export function useTracker() {
  const trackEvent = useCallback((eventName: string, data: Record<string, any> = {}) => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventName,
        path: window.location.pathname,
        property_id: data.property_id || null,
        session_id: getSessionId(),
      }),
    }).catch(() => {});

    captureEvent(eventName, {
      ...data,
      session_id: getSessionId(),
    });
  }, []);

  return { trackEvent };
}
