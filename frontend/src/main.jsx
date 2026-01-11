import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Hide Splash Screen Logic
const hideSplash = () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 500);
  }
};

// --- SERVICE WORKER & UPDATE LOGIC ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.warn('SW registration failed:', err);
    }).then(reg => {
      if (!reg) return;
      
      // Check for updates every time the app opens
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, trigger a custom event
            window.dispatchEvent(new CustomEvent('swUpdated'));
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        // Respond to any messages to prevent channel closure
        if (event.data && event.data.type) {
          console.log('SW Message:', event.data.type);
        }
      });
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App onReady={hideSplash} />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)