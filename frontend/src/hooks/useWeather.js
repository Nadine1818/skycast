import { useState, useEffect } from 'react';
import { weatherAPI } from '../utils/api';

export const useWeather = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [weather, setWeather] = useState(null);

    const fetchWeather = async (location, startDate, endDate) => {
        setLoading(true);
        setError(null);
        try {
            const response = await weatherAPI.createWeatherRecord({
                location,
                startDate,
                endDate,
            });

            const weatherData = response.data.data;
            // Normalize feelsLike into temperature object for frontend compatibility
            const normalized = {
                ...weatherData,
                temperature: {
                    ...(weatherData.temperature || {}),
                    feelsLike:
                        weatherData.temperature?.feelsLike ??
                        weatherData.feelsLike ??
                        weatherData.rawApiData?.main?.feels_like,
                },
            };

            setWeather(normalized);
            return normalized;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch weather data';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return { weather, loading, error, fetchWeather };
};

export const useWeatherRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getRecords = async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await weatherAPI.getAllRecords(params);
            setRecords(response.data.data);
            return response.data.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const deleteRecord = async (id) => {
        try {
            await weatherAPI.deleteRecord(id);
            setRecords(records.filter((r) => r._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || err.message);
        }
    };

    return { records, loading, error, getRecords, deleteRecord };
};

export const useGeolocation = () => {
    const [coords, setCoords] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCurrentLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLoading(false);
            },
            (err) => {
                let errorMsg = 'Unable to get location';
                if (err.code === 1) {
                    errorMsg = 'Location permission denied. Please allow geolocation access.';
                } else if (err.code === 2) {
                    errorMsg = 'Location unavailable. Please try again.';
                } else if (err.code === 3) {
                    errorMsg = 'Location request timed out. Please try again.';
                } else {
                    errorMsg = err.message || errorMsg;
                }
                setError(errorMsg);
                setLoading(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return { coords, loading, error, getCurrentLocation };
};
