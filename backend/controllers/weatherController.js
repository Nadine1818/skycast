const WeatherData = require('../models/WeatherData');
const {
    getWeatherByCoordinates,
    getForecastByCoordinates,
    geocodeLocation,
    getHistoricalByCoordinates,
    validateDateRange,
} = require('../utils/weatherApi');
const {
    exportToJSON,
    exportToCSV,
    exportToXML,
    exportToPDF,
    exportToMarkdown,
} = require('../utils/exportData');

// CREATE - Store weather data for a location and date range
exports.createWeatherRecord = async (req, res, next) => {
    try {
        const { location, startDate, endDate } = req.body;

        if (!location || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Location, startDate, and endDate are required',
            });
        }

        validateDateRange(startDate, endDate);
        const coordinates = await geocodeLocation(location);

        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        const msInDay = 24 * 60 * 60 * 1000;
        const rangeDays = Math.round((end - start) / msInDay) + 1;
        const isPastRange = end < now;

        let weatherData = null;
        let forecastData = null;
        let dailyForecast = [];
        let dailyTemps = [];

        if (isPastRange && (now - end) / msInDay <= 5) {
            const histResults = await Promise.all(
                Array.from({ length: rangeDays }).map(async (_, index) => {
                    const day = new Date(start.getTime() + index * msInDay);
                    const dt = Math.floor(day.getTime() / 1000);

                    try {
                        const hist = await getHistoricalByCoordinates(coordinates.lat, coordinates.lon, dt);
                        const hours = hist.hourly || [];
                        if (hours.length === 0) return null;

                        const temps = hours.map((hour) => hour.temp);
                        const descriptions = hours
                            .map((hour) => hour.weather?.[0]?.description)
                            .filter(Boolean);

                        return {
                            date: day,
                            avg: temps.reduce((a, b) => a + b, 0) / temps.length,
                            min: Math.min(...temps),
                            max: Math.max(...temps),
                            description: descriptions[0] || 'N/A',
                        };
                    } catch (err) {
                        return null;
                    }
                })
            );

            const histTemps = histResults.filter(Boolean);

            if (histTemps.length > 0) {
                const descriptionCounts = histTemps.reduce((acc, day) => {
                    acc[day.description] = (acc[day.description] || 0) + 1;
                    return acc;
                }, {});

                const topDescription = Object.keys(descriptionCounts).length
                    ? Object.keys(descriptionCounts).reduce((a, b) => (descriptionCounts[a] > descriptionCounts[b] ? a : b))
                    : 'N/A';

                weatherData = {
                    main: {
                        temp: histTemps.reduce((sum, day) => sum + day.avg, 0) / histTemps.length,
                        temp_min: Math.min(...histTemps.map((day) => day.min)),
                        temp_max: Math.max(...histTemps.map((day) => day.max)),
                        feels_like: histTemps.reduce((sum, day) => sum + day.avg, 0) / histTemps.length,
                        humidity: null,
                        pressure: null,
                    },
                    weather: [{ main: topDescription, description: topDescription, icon: '' }],
                    wind: { speed: null },
                    visibility: null,
                    sys: {
                        sunrise: Math.floor(start.getTime() / 1000),
                        sunset: Math.floor(end.getTime() / 1000),
                    },
                };

                dailyTemps = histTemps.map((day) => ({
                    date: day.date,
                    avg: day.avg,
                    min: day.min,
                    max: day.max,
                }));
            }
        }

        if (!weatherData) {
            // fetch current weather first, then try forecast (forecast can timeout; tolerate failures)
            weatherData = await getWeatherByCoordinates(coordinates.lat, coordinates.lon);
            try {
                forecastData = await getForecastByCoordinates(coordinates.lat, coordinates.lon);
                dailyForecast = processForecast(forecastData.list);
                dailyTemps = dailyForecast
                    .map((day) => ({
                        date: day.date,
                        avg: (day.tempMax + day.tempMin) / 2,
                        min: day.tempMin,
                        max: day.tempMax,
                    }))
                    .filter((day) => day.date >= start && day.date <= end);
            } catch (err) {
                // Log forecast failure but continue with available weatherData
                console.warn('Forecast fetch failed:', err.message || err);
                dailyForecast = [];
                dailyTemps = [];
            }
        }

        const newRecord = new WeatherData({
            location: coordinates.name,
            latitude: coordinates.lat,
            longitude: coordinates.lon,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            temperature: {
                current: weatherData.main.temp,
                min: weatherData.main.temp_min,
                max: weatherData.main.temp_max,
            },
            weather: {
                main: weatherData.weather[0].main,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
            },
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed,
            pressure: weatherData.main.pressure,
            visibility: weatherData.visibility,
            feelsLike: weatherData.main.feels_like,
            sunrise: new Date(weatherData.sys.sunrise * 1000),
            sunset: new Date(weatherData.sys.sunset * 1000),
            forecast: dailyForecast,
            dailyTemps,
            rawApiData: weatherData,
            external: {},
        });

        await newRecord.save();

        res.status(201).json({
            success: true,
            data: newRecord,
        });
    } catch (error) {
        next(error);
    }
};

// READ - Get all weather records
exports.getAllWeatherRecords = async (req, res, next) => {
    try {
        const { location, sortBy = '-createdAt', limit = 50, skip = 0, startDate, endDate } = req.query;

        let query = {};
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by date range overlap if provided
        if (startDate && endDate) {
            const s = new Date(startDate);
            const e = new Date(endDate);
            query.startDate = { $lte: e };
            query.endDate = { $gte: s };
        }

        const records = await WeatherData.find(query)
            .sort(sortBy)
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await WeatherData.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            data: records,
        });
    } catch (error) {
        next(error);
    }
};

// READ - Get specific weather record by ID
exports.getWeatherRecordById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const record = await WeatherData.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Weather record not found',
            });
        }

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

// READ - Get weather records by location
exports.getWeatherByLocation = async (req, res, next) => {
    try {
        const { location } = req.params;

        const records = await WeatherData.find({
            location: { $regex: location, $options: 'i' },
        }).sort('-createdAt');

        if (records.length === 0) {
            return res.status(404).json({
                success: false,
                error: `No weather records found for location: ${location}`,
            });
        }

        res.status(200).json({
            success: true,
            data: records,
        });
    } catch (error) {
        next(error);
    }
};

// GEO - validate or resolve a location string to coordinates
exports.resolveLocation = async (req, res, next) => {
    try {
        const { location } = req.query;
        if (!location) return res.status(400).json({ success: false, error: 'location query required' });

        const coords = await geocodeLocation(location);
        res.status(200).json({ success: true, data: coords });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// UPDATE - Update weather record
exports.updateWeatherRecord = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { location, startDate, endDate } = req.body;

        const record = await WeatherData.findById(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Weather record not found',
            });
        }

        // Handle date updates (allow partial updates)
        if (startDate || endDate) {
            const newStart = startDate ? new Date(startDate) : record.startDate;
            const newEnd = endDate ? new Date(endDate) : record.endDate;
            validateDateRange(newStart.toISOString(), newEnd.toISOString());
            record.startDate = newStart;
            record.endDate = newEnd;

            // If dates updated, recompute dailyTemps for the new range
            try {
                const s = newStart;
                const e = newEnd;
                const now = new Date();
                const msInDay = 24 * 60 * 60 * 1000;
                const rangeDays = Math.round((e - s) / msInDay) + 1;

                if (e < now && (now - e) / msInDay <= 5) {
                    // historical
                    const histTemps = [];
                    for (let i = 0; i < rangeDays; i++) {
                        const d = new Date(s.getTime() + i * msInDay);
                        const dt = Math.floor(d.getTime() / 1000);
                        try {
                            const hist = await getHistoricalByCoordinates(record.latitude, record.longitude, dt);
                            const hours = hist.hourly || [];
                            if (hours.length > 0) {
                                const temps = hours.map(h => h.temp);
                                const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
                                histTemps.push({ date: d, avg, min: Math.min(...temps), max: Math.max(...temps) });
                            }
                        } catch (err) {
                            // ignore per-day failures
                        }
                    }
                    record.dailyTemps = histTemps;
                } else {
                    // use forecast (tolerate forecast failures)
                    try {
                        const forecastData = await getForecastByCoordinates(record.latitude, record.longitude);
                        const dailyForecast = processForecast(forecastData.list);
                        record.dailyTemps = dailyForecast.map(d => ({ date: d.date, avg: ((d.tempMax + d.tempMin) / 2), min: d.tempMin, max: d.tempMax })).filter(d => d.date >= s && d.date <= e);
                    } catch (err) {
                        console.warn('Forecast fetch during update failed:', err.message || err);
                        // leave dailyTemps unchanged if forecast can't be fetched
                    }
                }
            } catch (err) {
                // ignore recompute errors
            }
        }

        // Re-fetch weather if location is being updated
        if (location && location !== record.location) {
            const coordinates = await geocodeLocation(location);
            // fetch current weather first and tolerate forecast failures
            const weatherData = await getWeatherByCoordinates(coordinates.lat, coordinates.lon);
            let forecastData = null;
            try {
                forecastData = await getForecastByCoordinates(coordinates.lat, coordinates.lon);
            } catch (err) {
                console.warn('Forecast fetch on location update failed:', err.message || err);
            }

            record.location = coordinates.name;
            record.latitude = coordinates.lat;
            record.longitude = coordinates.lon;
            record.temperature = {
                current: weatherData.main.temp,
                min: weatherData.main.temp_min,
                max: weatherData.main.temp_max,
            };
            record.weather = {
                main: weatherData.weather[0].main,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
            };
            record.humidity = weatherData.main.humidity;
            record.windSpeed = weatherData.wind.speed;
            record.forecast = forecastData ? processForecast(forecastData.list) : record.forecast || [];
            // update dailyTemps based on new forecast if available
            if (forecastData) {
                record.dailyTemps = record.forecast.map(d => ({ date: d.date, avg: ((d.tempMax + d.tempMin) / 2), min: d.tempMin, max: d.tempMax }));
            }
        }

        await record.save();

        res.status(200).json({
            success: true,
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE - Delete weather record
exports.deleteWeatherRecord = async (req, res, next) => {
    try {
        const { id } = req.params;

        const record = await WeatherData.findByIdAndDelete(id);

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Weather record not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Weather record deleted successfully',
            data: record,
        });
    } catch (error) {
        next(error);
    }
};

// DELETE - Delete multiple records
exports.deleteMultipleRecords = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of IDs to delete',
            });
        }

        const result = await WeatherData.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} records deleted successfully`,
        });
    } catch (error) {
        next(error);
    }
};

// EXPORT - Export data in various formats
exports.exportWeatherData = async (req, res, next) => {
    try {
        const { format = 'json', location } = req.query;

        let query = {};
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const data = await WeatherData.find(query);

        if (data.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No data to export',
            });
        }

        let exportedData;
        let contentType;
        let filename;

        switch (format.toLowerCase()) {
            case 'csv':
                exportedData = exportToCSV(data);
                contentType = 'text/csv';
                filename = 'weather_data.csv';
                break;
            case 'xml':
                exportedData = exportToXML(data);
                contentType = 'application/xml';
                filename = 'weather_data.xml';
                break;
            case 'pdf':
                exportedData = await exportToPDF(data);
                contentType = 'application/pdf';
                filename = 'weather_data.pdf';
                break;
            case 'markdown':
            case 'md':
                exportedData = exportToMarkdown(data);
                contentType = 'text/markdown';
                filename = 'weather_data.md';
                break;
            case 'json':
            default:
                exportedData = exportToJSON(data);
                contentType = 'application/json';
                filename = 'weather_data.json';
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(exportedData);
    } catch (error) {
        next(error);
    }
};

// Helper function to process forecast data
const processForecast = (forecastList) => {
    const dailyForecast = {};

    forecastList.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();

        if (!dailyForecast[date]) {
            dailyForecast[date] = {
                date: new Date(item.dt * 1000),
                tempMax: item.main.temp_max,
                tempMin: item.main.temp_min,
                weather: item.weather[0].main,
                icon: item.weather[0].icon,
            };
        } else {
            dailyForecast[date].tempMax = Math.max(
                dailyForecast[date].tempMax,
                item.main.temp_max
            );
            dailyForecast[date].tempMin = Math.min(
                dailyForecast[date].tempMin,
                item.main.temp_min
            );
        }
    });

    return Object.values(dailyForecast).slice(0, 5);
};
