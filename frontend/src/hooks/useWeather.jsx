import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../config';

const readErrorMessage = async (response) => {
    try {
        const data = await response.json();
        return data?.message || data?.error || `API error: ${response.status}`;
    } catch (err) {
        return `API error: ${response.status}`;
    }
};

export const useWeather = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchWeather = useCallback(async (location, startDate, endDate) => {
        setLoading(true);
        setError(null);
        try {
            // Create weather record
            const response = await fetch(`${API_BASE_URL}/weather`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location,
                    startDate,
                    endDate,
                }),
            });

            if (!response.ok) {
                throw new Error(await readErrorMessage(response));
            }

            const data = await response.json();

            if (!data.success || !data.data) {
                throw new Error(data.message || data.error || 'Failed to fetch weather data');
            }

            // Ensure temperature is a valid number
            const weatherData = data.data;
            if (!weatherData.temperature || typeof weatherData.temperature.current !== 'number') {
                throw new Error('Invalid temperature data received');
            }

            return {
                location: weatherData.location,
                temperature: {
                    current: weatherData.temperature.current || 0,
                    min: weatherData.temperature.min || 0,
                    max: weatherData.temperature.max || 0,
                },
                weather: {
                    main: weatherData.weather.main,
                    description: weatherData.weather.description,
                    icon: weatherData.weather.icon,
                },
                humidity: weatherData.humidity || 0,
                windSpeed: weatherData.windSpeed || 0,
                pressure: weatherData.pressure || 0,
                visibility: weatherData.visibility || 0,
                feelsLike: weatherData.feelsLike || weatherData.temperature.current,
                sunrise: weatherData.sunrise,
                sunset: weatherData.sunset,
                forecast: weatherData.forecast || [],
                id: weatherData._id,
            };
        } catch (err) {
            const message = err.message || 'Failed to fetch weather data';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, fetchWeather };
};

export const useGeolocation = () => {
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState(null);

    const getCurrentLocation = useCallback(() => {
        setError(null);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                setError(err.message);
            }
        );
    }, []);

    return { coords, error, getCurrentLocation };
};

export const useWeatherHistory = (location) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        if (!location) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/weather/location/${location}`);
            const data = await response.json();

            if (data.success) {
                setHistory(data.data);
            } else {
                setError(data.message || data.error || 'Failed to fetch history');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch history');
        } finally {
            setLoading(false);
        }
    }, [location]);

    return { history, loading, error, fetchHistory };
};

export const useExportData = () => {
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState(null);

    const exportData = useCallback(async (location, format = 'json') => {
        setExporting(true);
        setError(null);
        try {
            const query = new URLSearchParams();
            if (location) query.append('location', location);
            query.append('format', format);

            const response = await fetch(`${API_BASE_URL}/export/weather?${query}`);

            if (!response.ok) {
                throw new Error(await readErrorMessage(response));
            }

            // Determine filename based on format
            const filename = `weather_data.${format === 'markdown' ? 'md' : format}`;

            // Create blob and download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return true;
        } catch (err) {
            const message = err.message || 'Export failed';
            setError(message);
            throw new Error(message);
        } finally {
            setExporting(false);
        }
    }, []);

    return { exporting, error, exportData };
};
