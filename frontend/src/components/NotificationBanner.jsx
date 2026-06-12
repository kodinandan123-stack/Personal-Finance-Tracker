import { useEffect, useState } from 'react';

/**
 * Variant configuration: maps a variant name to its Tailwind classes and icon.
 */
const VARIANT_STYLES = {
  success: {
    wrapper: 'bg-green-50 border border-green-200 text-green-700',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  error: {
    wrapper: 'bg-red-50 border border-red-200 text-red-700',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  },
  warning: {
    wrapper: 'bg-yellow-50 border border-yellow-200 text-yellow-700',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    wrapper: 'bg-blue-50 border border-blue-200 text-blue-700',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  },
};

/**
 * NotificationBanner component
 *
 * Props:
 *  - message    {string}  – The text to display
 *  - variant    {string}  – 'success' | 'error' | 'warning' | 'info' (default: 'info')
 *  - dismissible {bool}  – Show a close button (default: true)
 *  - autoDismiss {number} – Auto-hide after N milliseconds. 0 = never (default: 0)
 *  - onDismiss  {func}   – Callback fired when the banner is dismissed
 *
 * Usage:
 *   <NotificationBanner message="Saved!" variant="success" autoDismiss={3000} />
 */
export default function NotificationBanner({
  message,
  variant = 'info',
  dismissible = true,
  autoDismiss = 0,
  onDismiss,
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true); // Reset when message changes
  }, [message]);

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss, message]);

  if (!visible || !message) return null;

  const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${styles.wrapper}`}
    >
      {styles.icon}
      <p className="flex-1 leading-snug">{message}</p>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="ml-auto -mt-0.5 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
}
