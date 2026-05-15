import React, { useState, useEffect } from 'react';
import { Cloud, Sun, AlertCircle, MapPin } from 'lucide-react';
import './App.css';
import { LocationSearch } from './components/LocationSearch';
import { DataExport } from './components/DataExport';
import { WeatherHistory } from './components/WeatherHistory';
import { GeolocationButton } from './components/GeolocationButton';
import { PMAcceleratorInfo } from './components/PMAcceleratorInfo';
import ExternalMedia from './components/ExternalMedia';
import { ErrorAlert, LoadingSpinner } from './components/CommonComponents';
import { useWeather, useGeolocation } from './hooks/useWeather';
import { getWeatherIcon, formatTemp, formatTime } from './utils/helpers';

function App() {
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [historyRefresh, setHistoryRefresh] = useState(0);
    const { loading, fetchWeather } = useWeather();
    const { coords, getCurrentLocation } = useGeolocation();

    // Handle location search
    const handleSearch = async (data) => {
        try {
            setError(null);
            const weatherData = await fetchWeather(data.location, data.startDate, data.endDate);
            setWeather(weatherData);
            setCurrentLocation(data.location);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle geolocation
    const handleGeolocation = async (coords) => {
        try {
            setError(null);
            const location = `${coords.latitude},${coords.longitude}`;
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const weatherData = await fetchWeather(
                location,
                today.toISOString().split('T')[0],
                tomorrow.toISOString().split('T')[0]
            );
            setWeather(weatherData);
            setCurrentLocation(weatherData.location);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleGeolocationError = (errorMsg) => {
        setError(errorMsg);
    };

    return (
        <div className="app-container">
            {/* Professional Header */}
            <header className="header-section">
                <div className="header-content">
                    <div className="header-left">
                        <Cloud size={32} style={{ color: '#3b82f6' }} />
                        <h1>Weather</h1>
                    </div>
                    <div className="header-right">
                        {weather && currentLocation && (
                            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                                {currentLocation}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-container">
                {/* Error Alert */}
                {error && (
                    <ErrorAlert error={error} onClose={() => setError(null)} />
                )}

                {/* Loading State */}
                {loading && <LoadingSpinner text="Fetching weather data..." />}

                {/* Weather Display - Professional Layout */}
                {!loading && weather ? (
                    <>
                        {/* Weather Hero + Search */}
                        <div className="weather-display animate-fade-in">
                            {/* Main Weather Hero */}
                            <div className="weather-hero">
                                <div className="temperature-display">
                                    <div className="temp-value">
                                        <div className="value">{formatTemp(weather.temperature.current)}</div>
                                        <div className="label">°C in {weather.location}</div>
                                    </div>
                                    <div className="weather-icon-display">
                                        {getWeatherIcon(weather.weather.icon)}
                                    </div>
                                </div>

                                <div className="weather-description">
                                    <div className="main">{weather.weather.main}</div>
                                    <div className="detail" style={{ textTransform: 'capitalize' }}>
                                        {weather.weather.description}
                                    </div>
                                </div>

                                <div className="feels-like">
                                    Feels like <strong>{formatTemp(weather.temperature?.feelsLike ?? weather.feelsLike)}°C</strong>
                                </div>
                            </div>

                            {/* Search Sidebar */}
                            <div className="search-sidebar animate-slide-in">
                                <LocationSearch onSearch={handleSearch} loading={loading} />
                                <GeolocationButton
                                    onLocationFound={handleGeolocation}
                                    onError={handleGeolocationError}
                                />
                            </div>
                        </div>

                        {/* Weather Details Grid */}
                        <div className="weather-details" style={{ marginTop: '2.5rem' }}>
                            <div className="detail-card">
                                <div className="label">🌡️ High / Low</div>
                                <div className="value">{weather.temperature?.max ? formatTemp(weather.temperature.max) : '--'}° / {weather.temperature?.min ? formatTemp(weather.temperature.min) : '--'}°</div>
                            </div>
                            <div className="detail-card">
                                <div className="label">💧 Humidity</div>
                                <div className="value">{weather.humidity || '--'}%</div>
                            </div>
                            <div className="detail-card">
                                <div className="label">💨 Wind</div>
                                <div className="value">{weather.windSpeed || '--'} m/s</div>
                            </div>
                            <div className="detail-card">
                                <div className="label">🌍 Pressure</div>
                                <div className="value">{weather.pressure || '--'} hPa</div>
                            </div>
                            <div className="detail-card">
                                <div className="label">👁️ Visibility</div>
                                <div className="value">{weather.visibility ? (weather.visibility / 1000).toFixed(1) : '--'} km</div>
                            </div>
                            <div className="detail-card">
                                <div className="label">🌅 Sunrise</div>
                                <div className="value" style={{ fontSize: '1.5rem' }}>{weather.sunrise ? formatTime(weather.sunrise) : '--'}</div>
                            </div>
                        </div>

                        {/* Forecast Section */}
                        {weather.forecast && weather.forecast.length > 0 && (
                            <div className="forecast-section">
                                <h2 className="section-title">5-Day Forecast</h2>
                                <div className="forecast-grid">
                                    {weather.forecast.slice(0, 5).map((day, index) => (
                                        <div key={index} className="forecast-card">
                                            <div className="day">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                            <div className="icon">{getWeatherIcon(day.icon)}</div>
                                            <div className="weather" style={{ textTransform: 'capitalize' }}>{day.weather}</div>
                                            <div className="temps">
                                                <span className="high">{formatTemp(day.tempMax)}°</span>
                                                <span className="low">{formatTemp(day.tempMin)}°</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Export Data */}
                        <div style={{ marginTop: '3rem' }}>
                            <DataExport location={weather.location} />
                        </div>

                        {/* External Media (Maps + YouTube) */}
                        <ExternalMedia location={currentLocation || weather.location} />

                        {/* Weather History */}
                        <div style={{ marginTop: '3rem' }}>
                            <WeatherHistory onRecordDeleted={() => setHistoryRefresh(prev => prev + 1)} />
                        </div>

                        {/* PM Accelerator Info */}
                        <div style={{ marginTop: '3rem' }}>
                            <PMAcceleratorInfo />
                        </div>
                    </>
                ) : (
                    /* Welcome State */
                    !loading && (
                        <div className="weather-hero weather-hero no-data">
                            <Sun size={100} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }} />
                            <div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>
                                    Welcome to Weather
                                </h2>
                                <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', maxWidth: '600px' }}>
                                    Get real-time weather data for any location worldwide
                                </p>
                                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
                                    <LocationSearch onSearch={handleSearch} loading={loading} />
                                </div>
                            </div>
                        </div>
                    )
                )}
            </main>

            {/* Footer */}
            <footer className="footer-section">
                <p>&copy; 2024 Weather App. Powered by OpenWeatherMap API</p>
            </footer>
        </div>
    );
}

export default App;
