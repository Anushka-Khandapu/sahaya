import { useEffect, useState } from 'react';

export type NetworkStatus = 'online' | 'limited' | 'offline';

export function useOnlineStatus() {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    if (typeof navigator === 'undefined') return 'online';
    return navigator.onLine ? 'online' : 'offline';
  });

  const [wasOffline, setWasOffline] = useState(false);
  const [justRestored, setJustRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      // Test real connection to distinguish captive portal or dead cellular edge
      setStatus('online');
      if (wasOffline) {
        setJustRestored(true);
        setTimeout(() => setJustRestored(false), 5000);
      }
    };

    const handleOffline = () => {
      setStatus('offline');
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Optional Network Information API check for slow 2G / poor connection
    const navConn = (navigator as unknown as { connection?: { effectiveType?: string; addEventListener: (t: string, cb: () => void) => void } }).connection;
    if (navConn) {
      const checkSpeed = () => {
        if (!navigator.onLine) {
          setStatus('offline');
        } else if (navConn.effectiveType === 'slow-2g' || navConn.effectiveType === '2g') {
          setStatus('limited');
        } else {
          setStatus('online');
        }
      };
      navConn.addEventListener('change', checkSpeed);
      checkSpeed();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return {
    status,
    isOnline: status === 'online',
    isOffline: status === 'offline',
    isLimited: status === 'limited',
    justRestored,
    dismissRestored: () => setJustRestored(false),
  };
}
