/**
 * Triggers a short haptic vibration
 * @param {string} type - 'success', 'warning', or 'error'
 */
export const triggerHaptic = (type = 'success') => {
  // Check if the browser/device supports vibration
  if (!window.navigator.vibrate) return;

  switch (type) {
    case 'success':
      window.navigator.vibrate(40); // One short pulse
      break;
    case 'warning':
      window.navigator.vibrate([50, 30, 50]); // Pulse, pause, pulse
      break;
    case 'error':
      window.navigator.vibrate([100, 50, 100]); // Heavy pulses
      break;
    default:
      window.navigator.vibrate(50);
  }
};