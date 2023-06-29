import ReactGA from 'react-ga';

export const initGA = () => {
  ReactGA.initialize('G-7XX2SXRZ8Y');
};

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};
