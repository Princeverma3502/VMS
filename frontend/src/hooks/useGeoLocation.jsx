import { useState, useCallback } from 'react';

const useGeoLocation = () => {
  const [location, setLocation] = useState(null); // { latitude, longitude }
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // We use useCallback so this function reference doesn't change on every render
  const getLocation = useCallback(() => {
    setIsLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        switch(err.code) {
          case err.PERMISSION_DENIED:
            setError("User denied the request for Geolocation.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case err.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          default:
            setError("An unknown error occurred.");
            break;
        }
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return { location, error, isLoading, getLocation };
};

export default useGeoLocation;