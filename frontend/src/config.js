// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const WEATHER_TIMEOUT = 10000; // 10 seconds

// Feature Flags
export const FEATURES = {
    GEOLOCATION: true,
    DATA_EXPORT: true,
    HISTORY: true,
    FORECAST: true,
    PM_ACCELERATOR: true,
};

// Export Formats
export const EXPORT_FORMATS = ['json', 'csv', 'xml', 'pdf', 'markdown'];

// API Endpoints
export const ENDPOINTS = {
    WEATHER: '/weather',
    EXPORT: '/export/weather',
    HISTORY: '/weather/location',
};
