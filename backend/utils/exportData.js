const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const builder = require('xmlbuilder');

const exportToJSON = (data) => {
    return JSON.stringify(data, null, 2);
};

const exportToCSV = (data) => {
    try {
        const fields = [
            'location',
            'latitude',
            'longitude',
            'startDate',
            'endDate',
            'temperature.current',
            'temperature.min',
            'temperature.max',
            'weather.main',
            'weather.description',
            'humidity',
            'windSpeed',
            'pressure',
            'createdAt',
        ];

        const parser = new Parser({ fields });
        return parser.parse(data);
    } catch (error) {
        throw new Error(`CSV Export Error: ${error.message}`);
    }
};

const exportToXML = (data) => {
    try {
        if (!Array.isArray(data)) {
            data = [data];
        }
        // Build XML manually to avoid xmlbuilder compatibility issues
        const escapeXml = (unsafe) => {
            if (unsafe === undefined || unsafe === null) return '';
            return String(unsafe)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<WeatherData>\n';

        data.forEach((item, index) => {
            xml += `  <Record${index + 1}>\n`;
            xml += `    <location>${escapeXml(item.location)}</location>\n`;
            xml += `    <latitude>${escapeXml(item.latitude)}</latitude>\n`;
            xml += `    <longitude>${escapeXml(item.longitude)}</longitude>\n`;
            xml += `    <temperature>${escapeXml(item.temperature?.current ?? '')}</temperature>\n`;
            xml += `    <weather>${escapeXml(item.weather?.description ?? '')}</weather>\n`;
            xml += `    <startDate>${escapeXml(item.startDate)}</startDate>\n`;
            xml += `    <endDate>${escapeXml(item.endDate)}</endDate>\n`;
            xml += `  </Record${index + 1}>\n`;
        });

        xml += '</WeatherData>';
        return xml;
    } catch (error) {
        throw new Error(`XML Export Error: ${error.message}`);
    }
};

const exportToPDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            if (!Array.isArray(data)) {
                data = [data];
            }

            const doc = new PDFDocument();
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            doc.fontSize(20).text('Weather Data Report', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10);

            data.forEach((item, index) => {
                doc.fontSize(12).text(`Record ${index + 1}`, { underline: true });
                doc.fontSize(10);
                doc.text(`Location: ${item.location}`);
                doc.text(`Latitude: ${item.latitude}, Longitude: ${item.longitude}`);
                doc.text(`Temperature: ${item.temperature.current}°C`);
                doc.text(`Weather: ${item.weather.description}`);
                doc.text(`Date Range: ${item.startDate} to ${item.endDate}`);
                doc.text(`Humidity: ${item.humidity}%`);
                doc.text(`Wind Speed: ${item.windSpeed} m/s`);
                doc.moveDown();
            });

            doc.end();
        } catch (error) {
            reject(new Error(`PDF Export Error: ${error.message}`));
        }
    });
};

const exportToMarkdown = (data) => {
    try {
        if (!Array.isArray(data)) {
            data = [data];
        }

        let markdown = '# Weather Data Report\n\n';

        data.forEach((item, index) => {
            markdown += `## Record ${index + 1}\n\n`;
            markdown += `- **Location**: ${item.location}\n`;
            markdown += `- **Coordinates**: ${item.latitude}, ${item.longitude}\n`;
            markdown += `- **Temperature**: ${item.temperature.current}°C (Min: ${item.temperature.min}°C, Max: ${item.temperature.max}°C)\n`;
            markdown += `- **Weather**: ${item.weather.main} - ${item.weather.description}\n`;
            markdown += `- **Humidity**: ${item.humidity}%\n`;
            markdown += `- **Wind Speed**: ${item.windSpeed} m/s\n`;
            markdown += `- **Pressure**: ${item.pressure} hPa\n`;
            markdown += `- **Date Range**: ${new Date(item.startDate).toLocaleDateString()} to ${new Date(item.endDate).toLocaleDateString()}\n`;
            markdown += `- **Recorded**: ${new Date(item.createdAt).toLocaleString()}\n\n`;
        });

        return markdown;
    } catch (error) {
        throw new Error(`Markdown Export Error: ${error.message}`);
    }
};

module.exports = {
    exportToJSON,
    exportToCSV,
    exportToXML,
    exportToPDF,
    exportToMarkdown,
};
