/**
 * Calculates the distance between two points on Earth in meters.
 * Uses the Haversine formula.
 * * @param {number|string} lat1 - Latitude of point 1 (User)
 * @param {number|string} lon1 - Longitude of point 1 (User)
 * @param {number|string} lat2 - Latitude of point 2 (Event Venue)
 * @param {number|string} lon2 - Longitude of point 2 (Event Venue)
 * @returns {number} Distance in meters
 * @throws {Error} If coordinates are invalid
 */
export const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  // 1. Parse and Validate Inputs
  const [l1, lo1, l2, lo2] = [lat1, lon1, lat2, lon2].map(Number);

  if ([l1, lo1, l2, lo2].some(isNaN)) {
    throw new Error('Invalid coordinates: Inputs must be numbers.');
  }

  // Basic Lat/Lon validation
  if (Math.abs(l1) > 90 || Math.abs(l2) > 90 || Math.abs(lo1) > 180 || Math.abs(lo2) > 180) {
    throw new Error('Invalid coordinates: Latitude must be between -90/90 and Longitude between -180/180.');
  }

  const R = 6371e3; // Radius of the earth in meters
  const dLat = deg2rad(l2 - l1);
  const dLon = deg2rad(lo2 - lo1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(l1)) * Math.cos(deg2rad(l2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Return rounded integer for cleaner UI usage, or keep float if precision needed
  return Math.round(R * c); 
};

// Helper function to convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};