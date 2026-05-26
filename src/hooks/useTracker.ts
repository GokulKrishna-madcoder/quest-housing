import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

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
    // Fire and forget — never await this
    supabase.from('user_events').insert({
      session_id: getSessionId(),
      event_name: eventName,
      event_data: data,
    }).then(() => {}).catch(() => {});
  }, []);

  return { trackEvent };
}
