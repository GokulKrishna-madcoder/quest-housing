import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
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
    supabase.from('user_events').insert({
      session_id: getSessionId(),
      event_name: eventName,
      event_data: data,
    }).then(() => {});

    captureEvent(eventName, {
      ...data,
      session_id: getSessionId(),
    });
  }, []);

  return { trackEvent };
}
