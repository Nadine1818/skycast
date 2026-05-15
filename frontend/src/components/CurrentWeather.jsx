import React from 'react';
import { Cloud, Droplets, Wind, Eye, Gauge, Eye as EyeIcon } from 'lucide-react';
import { getWeatherIcon, formatTemp, formatTime } from '../utils/helpers';
import { Card } from './CommonComponents';

export const CurrentWeather = ({ weather }) => {
    if (!weather) return null;

    return (
        <Card className="mb-6 bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-2xl">
            <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="card-title text-3xl font-bold">
                            {weather.location}
                        </h2>
                        <p className="text-blue-100">
                            {new Date(weather.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-6xl text-center">
                        {getWeatherIcon(weather.weather.icon)}
                    </div>
                </div>

                {/* Main temperature */}
                <div className="mb-6">
                    <div className="text-5xl font-bold mb-2">
                        {formatTemp(weather.temperature.current)}°C
                    </div>
                    <p className="text-xl capitalize text-blue-100">
                        {weather.weather.main} - {weather.weather.description}
                    </p>
                    <p className="text-blue-100 mt-2">
                        Feels like {formatTemp(weather.temperature?.feelsLike ?? weather.feelsLike)}°C
                    </p>
                </div>

                {/* Temperature range */}
                <div className="divider my-3"></div>
                <div className="flex justify-between mb-6 text-sm">
                    <div>
                        <p className="text-blue-100">High</p>
                        <p className="text-2xl font-semibold">
                            {formatTemp(weather.temperature.max)}°C
                        </p>
                    </div>
                    <div>
                        <p className="text-blue-100">Low</p>
                        <p className="text-2xl font-semibold">
                            {formatTemp(weather.temperature.min)}°C
                        </p>
                    </div>
                </div>

                {/* Weather details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    <DetailItem
                        icon={<Droplets size={20} />}
                        label="Humidity"
                        value={`${weather.humidity}%`}
                    />
                    <DetailItem
                        icon={<Wind size={20} />}
                        label="Wind Speed"
                        value={`${weather.windSpeed} m/s`}
                    />
                    <DetailItem
                        icon={<Gauge size={20} />}
                        label="Pressure"
                        value={`${weather.pressure} hPa`}
                    />
                    <DetailItem
                        icon={<EyeIcon size={20} />}
                        label="Visibility"
                        value={weather.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : '--'}
                    />
                </div>

                {/* Sun times */}
                <div className="divider my-3"></div>
                <div className="flex justify-between text-sm">
                    <div>
                        <p className="text-blue-100">Sunrise</p>
                        <p className="font-semibold">{formatTime(weather.sunrise)}</p>
                    </div>
                    <div>
                        <p className="text-blue-100">Sunset</p>
                        <p className="font-semibold">{formatTime(weather.sunset)}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const DetailItem = ({ icon, label, value }) => (
    <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
        <div className="flex justify-center mb-2">{icon}</div>
        <p className="text-xs text-blue-100 mb-1">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
    </div>
);
