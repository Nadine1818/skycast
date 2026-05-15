const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema(
    {
        location: {
            type: String,
            required: true,
            trim: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        temperature: {
            current: Number,
            min: Number,
            max: Number,
        },
        weather: {
            description: String,
            icon: String,
            main: String,
        },
        humidity: Number,
        windSpeed: Number,
        pressure: Number,
        visibility: Number,
        feelsLike: Number,
        sunrise: Date,
        sunset: Date,
        forecast: [
            {
                date: Date,
                tempMax: Number,
                tempMin: Number,
                weather: String,
                icon: String,
            },
        ],
        dailyTemps: [
            {
                date: Date,
                avg: Number,
                min: Number,
                max: Number,
            },
        ],
        rawApiData: mongoose.Schema.Types.Mixed,
        external: {
            videos: [mongoose.Schema.Types.Mixed],
            map: mongoose.Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
weatherDataSchema.index({ location: 1 });
weatherDataSchema.index({ createdAt: -1 });

module.exports = mongoose.model('WeatherData', weatherDataSchema);
