/**
 * main.jsx — React Application Entry Point
 *
 * Mounts the React tree into #root with:
 * - StrictMode: double-renders in dev to catch side effects
 * - Redux Provider: makes the store available to all components
 * - BrowserRouter: enables React Router navigation
 * - ToastContainer: global toast notifications
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import store from '@/app/store';
import SkipLink from '@/components/common/SkipLink';
import App from './App.jsx';

// Global styles — must come before App to apply base reset
import '@/styles/index.css';
import 'react-toastify/dist/ReactToastify.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found. Check public/index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <SkipLink />
        <App />
        {/* ToastContainer is placed here so toasts render above all other content */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          role="alert"
          aria-live="polite"
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
