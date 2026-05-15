// Get weather icon based on condition
export const getWeatherIcon = (iconCode) => {
    const iconMap = {
        '01d': '☀️', // clear sky day
        '01n': '🌙', // clear sky night
        '02d': '⛅', // few clouds day
        '02n': '🌙', // few clouds night
        '03d': '☁️', // scattered clouds
        '03n': '☁️',
        '04d': '☁️', // broken clouds
        '04n': '☁️',
        '09d': '🌧️', // shower rain
        '09n': '🌧️',
        '10d': '🌦️', // rain
        '10n': '🌧️',
        '11d': '⛈️', // thunderstorm
        '11n': '⛈️',
        '13d': '❄️', // snow
        '13n': '❄️',
        '50d': '🌫️', // mist
        '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌤️';
};

// Format temperature
export const formatTemp = (temp) => {
    if (temp === null || temp === undefined || isNaN(temp)) {
        return '--';
    }
    return Math.round(temp);
};

// Download file helper - properly handles different MIME types
export const downloadFile = (data, filename, mimeType) => {
    try {
        let blob;

        // Handle different data types
        if (data instanceof Blob) {
            blob = data;
        } else if (typeof data === 'string') {
            // Convert string to blob based on MIME type
            blob = new Blob([data], { type: mimeType || 'text/plain' });
        } else {
            // For objects (like JSON), stringify and create blob
            blob = new Blob([JSON.stringify(data, null, 2)], { type: mimeType || 'application/json' });
        }

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        throw new Error(`Failed to download file: ${error.message}`);
    }
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
};

// Format time
export const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

// Capitalize string
export const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

