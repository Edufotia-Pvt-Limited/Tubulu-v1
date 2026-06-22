
const axios = require("axios");
const OPENCAGE_KEY = process.env.OPENCAGE_KEY || "9c91d754bd244426994db00e15ea06fa";

async function getGeolocation(fullAddress) {
  console.log("Calling OpenCage with:", fullAddress);

  const url = "https://api.opencagedata.com/geocode/v1/json";

  try {
    const response = await axios.get(url, {
      params: {
        q: fullAddress,
        key: OPENCAGE_KEY,
      },
    });

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error("No results from geocoder");
    }

    const result = response.data.results[0];

    return {
      lat: result.geometry.lat,
      lng: result.geometry.lng,
      formattedAddress: result.formatted,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${result.geometry.lat},${result.geometry.lng}`,
    };
  } catch (err) {
    console.error("OpenCage ERROR, falling back to Nominatim (OSM):", err.response?.data || err.message);
    
    try {
      const nominatimUrl = 'https://nominatim.openstreetmap.org/search';
      const addressVariations = [fullAddress];
      const parts = fullAddress.split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        addressVariations.push(parts.slice(1).join(', '));
      }
      if (parts.length > 2) {
        addressVariations.push(parts.slice(2).join(', '));
      }

      for (const query of addressVariations) {
        console.log(`[NOMINATIM] Geocoding: "${query}"`);
        const res = await axios.get(nominatimUrl, {
          params: {
            q: query,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'Tubulu-App/1.0.0 (contact: info@tubulu.com)'
          }
        });

        if (res.data && res.data.length > 0) {
          const result = res.data[0];
          console.log(`[NOMINATIM] Resolved "${query}" to lat: ${result.lat}, lng: ${result.lon}`);
          return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            formattedAddress: result.display_name,
            googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${result.lat},${result.lon}`,
          };
        }
      }
      throw new Error("No results from Nominatim for address variations");
    } catch (osmErr) {
      console.error("Nominatim ERROR:", osmErr.message);
      console.log("[GEOCODING FALLBACK] All geocoders failed. Defaulting to Mysore coordinates (12.3237008, 76.6022778) for local testing.");
      return {
        lat: 12.3237008,
        lng: 76.6022778,
        formattedAddress: fullAddress + " (Mysore default fallback)",
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=12.3237008,76.6022778`
      };
    }
  }
}


async function searchPlaces(query) {
  const params = {
    key: process.env.OPENCAGE_KEY  || "9c91d754bd244426994db00e15ea06fa",
    q: query,
    limit: 5, // suggestions
    no_annotations: 1,
    countrycode: "IN" 
  };

  const url = `https://api.opencagedata.com/geocode/v1/json`;

  try {
    const response = await axios.get(url, { params });

    const results = response.data.results.map(item => ({
      formatted: item.formatted,
      lat: item.geometry.lat,
      lng: item.geometry.lng,
      components: item.components
    }));

    return { success: true, results };
  } catch (error) {
    console.error("OpenCage Places API Error:", error.response?.data || error);
    return { success: false, message: "OpenCage Places API failed" };
  }
}


async function reverseGeocode(lat, lng) {
  if (!lat || !lng) throw new Error("Latitude and longitude are required");

  const params = {
    key: OPENCAGE_KEY || "9c91d754bd244426994db00e15ea06fa" ,
    q: `${lat},${lng}`,
    no_annotations: 1,
    countrycode: "IN",
    limit: 1, // only one address
  };

  const url = `https://api.opencagedata.com/geocode/v1/json`;

  try {
    const response = await axios.get(url, { params });
    if (!response.data.results || response.data.results.length === 0) {
      throw new Error("No address found for these coordinates");
    }

    const result = response.data.results[0];

    return {
      formatted: result.formatted,
      components: result.components,
      lat: result.geometry.lat,
      lng: result.geometry.lng,
    };
  } catch (error) {
    console.error("OpenCage Reverse Geocode Error:", error.response?.data || error);
    throw new Error("OpenCage Reverse Geocoding failed");
  }
}


async function getDistanceAndTime(lat1, lng1, lat2, lng2) {
  const url = `http://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;

  console.log("🌍 Calling OSRM:", url);

  try {
    const response = await axios.get(url);

    console.log("OSRM RAW RESPONSE:", response.data);

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("No route found");
    }

    const route = response.data.routes[0];

    return {
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      distanceKm: (route.distance / 1000).toFixed(2),
      durationMinutes: (route.duration / 60).toFixed(2),
    };
  } catch (err) {
    console.error("🔥 OSRM ERROR:", err.response?.data || err.message);
    throw new Error("Failed to calculate distance/time");
  }
}

module.exports = { getGeolocation, searchPlaces, reverseGeocode, getDistanceAndTime };
