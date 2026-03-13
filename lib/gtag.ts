declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function gtagEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
}
