import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/responsive.css';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Start fresh at the top on page load; in-page navigation still works afterward.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
if (window.location.pathname === '/' && window.location.hash) {
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
}
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
