import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-7XX2SXRZ8Y');
  console.log('Initialized G4');
};

export const logPageView = () => {
  ReactGA.send({
    hitType: 'pageview',
    page: window.location.pathname,
    title: 'Path',
  });
  console.log('Sent path:', window.location.pathname);
};

export const TrackGoogleAnalyticsEvent = (category, action, label) => {
  console.log('GA event:', category, ':', action, ':', label);
  // Send GA4 Event
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
};

export const TrackGoogleAnalyticsEventVal = (
  category,
  action,
  label,
  value
) => {
  console.log('GA event:', category, ':', action, ':', label, ':', value);
  // Send GA4 Event
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value,
  });
};
