import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Weather CRUD Operations
export const weatherAPI = {
    // CREATE
    createWeatherRecord: (data) => api.post('/weather', data),

    // READ
    getAllRecords: (params) => api.get('/weather', { params }),
    getRecordById: (id) => api.get(`/weather/${id}`),
    getByLocation: (location) => api.get(`/weather/location/${location}`),
    // Geocode / validate a location string
    resolveLocation: (location) => api.get('/geo', { params: { location } }),

    // UPDATE
    updateRecord: (id, data) => api.put(`/weather/${id}`, data),

    // DELETE
    deleteRecord: (id) => api.delete(`/weather/${id}`),
    deleteMultiple: (ids) => api.delete('/weather/batch/delete', { data: { ids } }),

    // EXPORT
    exportData: (format, location) =>
        api.get('/export/weather', {
            params: { format, location },
            responseType: format === 'pdf' ? 'blob' : 'arraybuffer',
        }),
};

export default api;
