const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const externalController = require('../controllers/externalController');

// CREATE - Add new weather record
router.post('/weather', weatherController.createWeatherRecord);

// READ - Get all weather records with pagination and filtering
router.get('/weather', weatherController.getAllWeatherRecords);

// READ - Get specific weather record
router.get('/weather/:id', weatherController.getWeatherRecordById);

// READ - Get weather by location name
router.get('/weather/location/:location', weatherController.getWeatherByLocation);

// Geocode/validate location
router.get('/geo', weatherController.resolveLocation);

// UPDATE - Update weather record
router.put('/weather/:id', weatherController.updateWeatherRecord);

// DELETE - Delete specific weather record
router.delete('/weather/:id', weatherController.deleteWeatherRecord);

// DELETE - Delete multiple records
router.delete('/weather/batch/delete', weatherController.deleteMultipleRecords);

// EXPORT - Export weather data in various formats
router.get('/export/weather', weatherController.exportWeatherData);

// EXTERNAL - YouTube and Maps integration
router.get('/external/videos', externalController.getVideosForLocation);
router.get('/external/maps', externalController.getMapForLocation);

module.exports = router;
