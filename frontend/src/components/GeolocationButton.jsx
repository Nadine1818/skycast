import React, { useState, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { useGeolocation } from '../hooks/useWeather';

export const GeolocationButton = ({ onLocationFound, onError }) => {
    const { coords, loading, error, getCurrentLocation } = useGeolocation();

    useEffect(() => {
        if (coords) {
            onLocationFound(coords);
        }
    }, [coords, onLocationFound]);

    useEffect(() => {
        if (error) {
            onError(error);
        }
    }, [error, onError]);

    return (
        <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="btn"
            style={{ width: '100%' }}
        >
            {loading ? (
                <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Getting Location...
                </>
            ) : (
                <>
                    <MapPin size={18} />
                    Current Location
                </>
            )}
        </button>
    );
};
