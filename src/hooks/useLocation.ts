import { useEffect, useState, useCallback } from 'react';
import { LocationState } from '../types';

const LAST_KNOWN_LOC_KEY = 'sahaya_last_known_location';

export function useLocation() {
  const [location, setLocation] = useState<LocationState>(() => {
    try {
      const saved = localStorage.getItem(LAST_KNOWN_LOC_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isWatching: false,
          error: null,
        };
      }
    } catch {}
    return {
      latitude: null,
      longitude: null,
      accuracy: null,
      altitude: null,
      speed: null,
      heading: null,
      timestamp: null,
      error: null,
      isWatching: false,
    };
  });

  const [isLoading, setIsLoading] = useState(false);

  const saveLocationLocally = useCallback((loc: Partial<LocationState>) => {
    try {
      const toSave = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        altitude: loc.altitude,
        speed: loc.speed,
        heading: loc.heading,
        timestamp: loc.timestamp || Date.now(),
      };
      localStorage.setItem(LAST_KNOWN_LOC_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Could not save location to local storage', e);
    }
  }, []);

  const refreshLocation = useCallback((): Promise<LocationState> => {
    setIsLoading(true);
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const errState: LocationState = {
          ...location,
          error: 'Geolocation is not supported by this browser.',
          isWatching: false,
        };
        setLocation(errState);
        setIsLoading(false);
        resolve(errState);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newState: LocationState = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
            error: null,
            isWatching: false,
          };
          setLocation(newState);
          saveLocationLocally(newState);
          setIsLoading(false);
          resolve(newState);
        },
        (err) => {
          let msg = 'Failed to acquire location.';
          if (err.code === err.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please allow GPS access in browser settings.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'GPS signal unavailable or obstructed.';
          } else if (err.code === err.TIMEOUT) {
            msg = 'GPS request timed out. Trying to use last known position.';
          }
          const errState: LocationState = {
            ...location,
            error: msg,
            isWatching: false,
          };
          setLocation(errState);
          setIsLoading(false);
          resolve(errState);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }, [location, saveLocationLocally]);

  // Start continuous watch during active emergency or journey
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return () => {};

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newState: LocationState = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
          heading: pos.coords.heading,
          timestamp: pos.timestamp,
          error: null,
          isWatching: true,
        };
        setLocation(newState);
        saveLocationLocally(newState);
      },
      (err) => {
        console.warn('Geolocation watch error', err);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setLocation((prev) => ({ ...prev, isWatching: false }));
    };
  }, [saveLocationLocally]);

  useEffect(() => {
    // Initial silent check
    if (location.latitude === null) {
      refreshLocation();
    }
  }, [location.latitude, refreshLocation]);

  return {
    location,
    isLoading,
    refreshLocation,
    startWatching,
  };
}
