const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const { fetchYouTubeVideos, fetchMapData } = require('../utils/externalApi');

// GET /api/external/videos?location=...
exports.getVideosForLocation = async (req, res, next) => {
    try {
        const { location } = req.query;
        if (!location) return res.status(400).json({ success: false, error: 'location query required' });

        const items = await fetchYouTubeVideos(location, 6);
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

// GET /api/external/maps?location=...
exports.getMapForLocation = async (req, res, next) => {
    try {
        const { location } = req.query;
        if (!location) return res.status(400).json({ success: false, error: 'location query required' });

        const data = await fetchMapData(location);
        if (!data) return res.status(404).json({ success: false, error: 'Map data not available' });
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
