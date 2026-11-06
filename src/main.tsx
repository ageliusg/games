import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './ui/App';
import './index.css';

let mounted = false;

function mountApp() {
  if (mounted) return;
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    return;
  }
  mounted = true;
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Guarantee mounting in any context (file://, http://, deferred, inline)
if (document.getElementById('root')) {
  mountApp();
} else {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
  }
  window.addEventListener('load', mountApp);
}
