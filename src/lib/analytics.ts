// Google Analytics integration
// This file handles Google Analytics tracking

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export function initGA(measurementId: string) {
  if (typeof window === 'undefined') return;

  // Load Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer?.push(args);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    page_path: window.location.pathname,
  });
}

// Track page views
export function trackPageView(url: string) {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
    page_path: url,
  });
}

// Track events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

// Track resume generation
export function trackResumeGeneration(tier: string, template: string) {
  trackEvent('resume_generated', 'Resume', `${tier}_${template}`);
}

// Track resume download
export function trackResumeDownload(template: string) {
  trackEvent('resume_downloaded', 'Resume', template);
}

// Track subscription upgrade
export function trackSubscriptionUpgrade(tier: string) {
  trackEvent('subscription_upgraded', 'Subscription', tier);
}

// Track user signup
export function trackSignup(method: string) {
  trackEvent('sign_up', 'User', method);
}

// Track user login
export function trackLogin(method: string) {
  trackEvent('login', 'User', method);
}

