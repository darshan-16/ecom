import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-7XX2SXRZ8Y');
  console.log('Initialized G4');
};

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};
