import posthog from 'posthog-js';

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY;
  const host = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';
  if (!key) return;
  posthog.init(key, {
    api_host: host,
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: { password: true },
    },
    capture_pageview: false,
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.opt_out_capturing();
    },
  });
}

export function captureEvent(eventName: string, properties?: Record<string, any>) {
  try {
    posthog.capture(eventName, properties);
  } catch {
    /* silent fail in dev */
  }
}

export function identifyUser(distinctId: string, traits?: Record<string, any>) {
  try {
    posthog.identify(distinctId, traits);
  } catch {
    /* silent fail */
  }
}
