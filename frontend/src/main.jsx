import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Initialize PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content downloaded! Click OK to restart and update.')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work completely offline.');
  },
})

// Hide Splash Screen Logic
const hideSplash = () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    console.log('🟢 Hiding splash screen');
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 500);
  }
};

console.log('🟢 main.jsx: Starting React app initialization');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App onReady={hideSplash} />
  </React.StrictMode>
)