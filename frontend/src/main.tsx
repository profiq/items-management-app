import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@profiq/ui/index.css';
import './index.css';
import App from './App.tsx';

// Apply the persisted/preferred theme before first paint to avoid a flash.
(() => {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = stored ? stored === 'dark' : prefersDark;
  document.documentElement.classList.add(dark ? 'profiq-dark' : 'profiq');
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
