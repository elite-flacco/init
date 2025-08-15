declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | object,
      config?: object
    ) => void;
  }
}

// Google Analytics measurement ID - should be set as environment variable
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Check if GA is enabled
export const isGAEnabled = () => {
  return GA_MEASUREMENT_ID && typeof window !== 'undefined';
};

// Initialize Google Analytics
export const initGA = () => {
  if (!isGAEnabled()) return;

  // Create script element for gtag
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag function
  window.gtag = function(...args: unknown[]) {
    // Initialize dataLayer if it doesn't exist
    if (!(window as typeof window & { dataLayer?: unknown[] }).dataLayer) {
      (window as typeof window & { dataLayer?: unknown[] }).dataLayer = [];
    }
    (window as typeof window & { dataLayer: unknown[] }).dataLayer.push(args);
  };

  // Configure gtag
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!isGAEnabled()) return;

  window.gtag('config', GA_MEASUREMENT_ID!, {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (!isGAEnabled()) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track travel-specific events
export const trackTravelEvent = {
  // Track when user selects traveler type
  selectTravelerType: (travelerType: string) => {
    trackEvent('select_traveler_type', 'travel_flow', travelerType);
  },

  // Track destination knowledge selection
  selectDestinationKnowledge: (knowledge: string) => {
    trackEvent('select_destination_knowledge', 'travel_flow', knowledge);
  },

  // Track when user inputs destination manually
  inputDestination: (destination: string) => {
    trackEvent('input_destination', 'travel_flow', destination);
  },

  // Track when user completes destination preferences
  completeDestinationPreferences: (preferences: object) => {
    trackEvent('complete_destination_preferences', 'travel_flow', JSON.stringify(preferences));
  },

  // Track when user selects a destination
  selectDestination: (destination: string) => {
    trackEvent('select_destination', 'travel_flow', destination);
  },

  // Track when user completes trip planning
  completeTripPlanning: () => {
    trackEvent('complete_trip_planning', 'travel_flow');
  },

  // Track when user views final plan
  viewTravelPlan: (destination: string) => {
    trackEvent('view_travel_plan', 'travel_flow', destination);
  },

  // Track when user regenerates plan
  regeneratePlan: () => {
    trackEvent('regenerate_plan', 'travel_flow');
  },

  // Track when user shares plan
  sharePlan: (method: string) => {
    trackEvent('share_plan', 'engagement', method);
  },

  // Track when user exports plan
  exportPlan: (format: string) => {
    trackEvent('export_plan', 'engagement', format);
  },

  // Track AI recommendation requests
  requestAIRecommendations: (type: 'destinations' | 'trip_plan') => {
    trackEvent('request_ai_recommendations', 'ai_usage', type);
  },

  // Track step navigation
  navigateStep: (fromStep: string, toStep: string) => {
    trackEvent('navigate_step', 'navigation', `${fromStep}_to_${toStep}`);
  },

  // Track errors
  error: (errorType: string, errorMessage?: string) => {
    trackEvent('error', 'errors', errorType, errorMessage ? 1 : 0);
  },
};