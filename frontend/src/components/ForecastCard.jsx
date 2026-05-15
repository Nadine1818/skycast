import React from 'react';
import { Cloud, ChevronRight } from 'lucide-react';
import { getWeatherIcon, formatTemp, formatDate } from '../utils/helpers';
import { Card } from './CommonComponents';

export const ForecastCard = ({ forecast }) => {
    if (!forecast || forecast.length === 0) return null;

    return (
        <Card className="mb-6">
            <div className="card-body">
                <h2 className="card-title flex items-center gap-2 mb-4">
                    <Cloud size={24} />
                    5-Day Forecast
                </h2>

                {/* Horizontal scroll for mobile, grid for desktop */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-2">
                    {forecast.slice(0, 5).map((day, index) => (
                        <ForecastItem key={index} day={day} />
                    ))}
                </div>
            </div>
        </Card>
    );
};

const ForecastItem = ({ day }) => {
    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 text-center flex-shrink-0 min-w-[150px] border border-slate-200 hover:shadow-md transition-shadow">
            <p className="font-semibold text-slate-700 mb-3">{formatDate(day.date)}</p>
            <div className="text-4xl mb-3 text-center">{getWeatherIcon(day.icon)}</div>
            <p className="text-sm text-slate-600 mb-3 capitalize">{day.weather}</p>
            <div className="flex justify-center gap-2">
                <div className="text-center">
                    <p className="text-xs text-slate-500">High</p>
                    <p className="font-bold text-slate-800">{formatTemp(day.tempMax)}°</p>
                </div>
                <div className="divider divider-horizontal mx-1"></div>
                <div className="text-center">
                    <p className="text-xs text-slate-500">Low</p>
                    <p className="font-bold text-slate-600">{formatTemp(day.tempMin)}°</p>
                </div>
            </div>
        </div>
    );
};
