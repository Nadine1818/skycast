const axios = require('axios');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const OPEN_METEO_GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const API_TIMEOUT = parseInt(process.env.WEATHER_API_TIMEOUT_MS || '10000', 10);

// Get weather data from OpenWeatherMap
const getWeatherByCoordinates = async (lat, lon) => {
    try {
        const response = await axios.get(`${WEATHER_API_URL}/weather`, {
            timeout: API_TIMEOUT,
            params: {
                lat,
                lon,
                appid: WEATHER_API_KEY,
                units: 'metric',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Weather API Error: ${error.message}`);
    }
};

// Get 5-day forecast
const getForecastByCoordinates = async (lat, lon) => {
    try {
        const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
            timeout: API_TIMEOUT,
            params: {
                lat,
                lon,
                appid: WEATHER_API_KEY,
                units: 'metric',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Forecast API Error: ${error.message}`);
    }
};

// Get historical weather for a specific unix timestamp (dt) using One Call timemachine
const getHistoricalByCoordinates = async (lat, lon, dt) => {
    try {
        const response = await axios.get(`${ONECALL_URL}/timemachine`, {
            timeout: API_TIMEOUT,
            params: {
                lat,
                lon,
                dt,
                appid: WEATHER_API_KEY,
                units: 'metric',
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(`Historical API Error: ${error.message}`);
    }
};

// Check if location string is in coordinate format (lat,lon)
const isCoordinateFormat = (location) => {
    if (!location || typeof location !== 'string') return false;
    const parts = location.split(',');
    if (parts.length !== 2) return false;
    const lat = parseFloat(parts[0].trim());
    const lon = parseFloat(parts[1].trim());
    return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

// Parse coordinate format (lat,lon)
const parseCoordinates = (location) => {
    const parts = location.split(',');
    return {
        lat: parseFloat(parts[0].trim()),
        lon: parseFloat(parts[1].trim()),
    };
};

const LOCATION_ALIAS_FALLBACKS = {
    alexandria: { lat: 31.2001, lon: 29.9187, name: 'Alexandria, EG', country: 'EG' },
};

const isRetryableNetworkError = (err) => {
    const retryableCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET'];
    return retryableCodes.includes(err?.code) || (!err?.response && !!err?.message);
};

// Retry helper with exponential backoff (retries only network/transient failures)
const retryWithBackoff = async (fn, maxRetries = 2, initialDelayMs = 400) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === maxRetries - 1 || !isRetryableNetworkError(err)) throw err;
            const delayMs = initialDelayMs * Math.pow(2, i);
            console.log(`Retry ${i + 1}/${maxRetries} after ${delayMs}ms`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
};

const geocodeWithOpenMeteo = async (location) => {
    const response = await axios.get(OPEN_METEO_GEO_URL, {
        timeout: Math.min(API_TIMEOUT, 8000),
        params: {
            name: location,
            count: 1,
            language: 'en',
            format: 'json',
        },
    });

    const first = response?.data?.results?.[0];
    if (!first) return null;

    const country = first.country_code || first.country || '';
    return {
        lat: first.latitude,
        lon: first.longitude,
        name: `${first.name}${first.admin1 ? ', ' + first.admin1 : ''}${country ? ', ' + country : ''}`,
        country,
    };
};

// Geocode location to get coordinates (supports direct and reverse geocoding)
const geocodeLocation = async (location) => {
    try {
        const normalizedLocation = String(location || '').trim();
        const alias = LOCATION_ALIAS_FALLBACKS[normalizedLocation.toLowerCase()];

        if (isCoordinateFormat(location)) {
            const coords = parseCoordinates(location);
            try {
                const response = await retryWithBackoff(() =>
                    axios.get(`${GEO_API_URL}/reverse`, {
                        timeout: API_TIMEOUT,
                        params: {
                            lat: coords.lat,
                            lon: coords.lon,
                            limit: 1,
                            appid: WEATHER_API_KEY,
                        },
                    })
                );
                const first = Array.isArray(response.data) ? response.data[0] : null;
                return {
                    lat: coords.lat,
                    lon: coords.lon,
                    name: first ? `${first.name}${first.state ? ', ' + first.state : ''}${first.country ? ', ' + first.country : ''}` : `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`,
                    country: first?.country || '',
                };
            } catch (err) {
                return {
                    lat: coords.lat,
                    lon: coords.lon,
                    name: `${coords.lat.toFixed(2)}, ${coords.lon.toFixed(2)}`,
                    country: '',
                };
            }
        }

        // Direct geocoding (fuzzy match) with retry
        try {
            const resp = await retryWithBackoff(() =>
                axios.get(`${GEO_API_URL}/direct`, {
                    timeout: API_TIMEOUT,
                    params: {
                        q: normalizedLocation,
                        limit: 1,
                        appid: WEATHER_API_KEY,
                    },
                })
            );
            if (Array.isArray(resp.data) && resp.data.length > 0) {
                const r = resp.data[0];
                return {
                    lat: r.lat,
                    lon: r.lon,
                    name: `${r.name}${r.state ? ', ' + r.state : ''}${r.country ? ', ' + r.country : ''}`,
                    country: r.country || '',
                };
            }
        } catch (err) {
            console.warn(`Direct geocoding failed: ${err.message}`);
            // fall through to weather endpoint
        }

        // Fallback 1: query OpenWeather weather endpoint to obtain coords
        try {
            const response = await retryWithBackoff(() =>
                axios.get(`${WEATHER_API_URL}/weather`, {
                    timeout: API_TIMEOUT,
                    params: {
                        q: normalizedLocation,
                        appid: WEATHER_API_KEY,
                        units: 'metric',
                    },
                })
            );
            return {
                lat: response.data.coord.lat,
                lon: response.data.coord.lon,
                name: response.data.name,
                country: response.data.sys?.country || '',
            };
        } catch (err) {
            console.warn(`OpenWeather weather fallback failed: ${err.message}`);
        }

        // Fallback 2: Open-Meteo free geocoder
        try {
            const fallbackResult = await retryWithBackoff(() => geocodeWithOpenMeteo(normalizedLocation), 2, 300);
            if (fallbackResult) return fallbackResult;
        } catch (err) {
            console.warn(`Open-Meteo geocoding fallback failed: ${err.message}`);
        }

        // Fallback 3: known location aliases
        if (alias) return alias;

        throw new Error(`Unable to geocode location: ${normalizedLocation}`);
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error(`Location not found: ${location}`);
        }
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new Error(`Geocoding timed out for ${location} after multiple retries`);
        }
        throw new Error(`Geocoding Error: ${error.message}`);
    }
};

// Validate date range
const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date');
    }
    if (start > end) throw new Error('Start date must be before end date');
    return { start, end };
};

module.exports = {
    getWeatherByCoordinates,
    getForecastByCoordinates,
    getHistoricalByCoordinates,
    geocodeLocation,
    isCoordinateFormat,
    parseCoordinates,
    validateDateRange,
};
