const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

async function fetchYouTubeVideos(location, maxResults = 6) {
    const items = [];
    if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'your_youtube_api_key') {
        const url = 'https://www.googleapis.com/youtube/v3/search';
        const resp = await axios.get(url, {
            params: {
                part: 'snippet',
                q: location,
                type: 'video',
                maxResults,
                key: YOUTUBE_API_KEY,
            },
        });

        (resp.data.items || []).forEach((it) => {
            items.push({
                videoId: it.id.videoId,
                title: it.snippet.title,
                description: it.snippet.description,
                thumbnail: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url,
                channelTitle: it.snippet.channelTitle,
            });
        });
    } else {
        // Fallback scraping + oEmbed
        try {
            const q = encodeURIComponent(location);
            const htmlResp = await axios.get(`https://www.youtube.com/results?search_query=${q}`);
            const html = htmlResp.data || '';

            const idSet = new Set();
            const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
            let match;
            while ((match = regex.exec(html)) && idSet.size < (maxResults + 2)) {
                idSet.add(match[1]);
            }

            for (const vid of Array.from(idSet).slice(0, maxResults)) {
                let title = null;
                let author = null;
                try {
                    const oembed = await axios.get('https://www.youtube.com/oembed', {
                        params: { url: `https://www.youtube.com/watch?v=${vid}`, format: 'json' },
                    });
                    title = oembed.data.title;
                    author = oembed.data.author_name;
                } catch (err) {
                    // ignore
                }

                items.push({
                    videoId: vid,
                    title: title || `YouTube Video ${vid}`,
                    description: '',
                    thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
                    channelTitle: author || '',
                });
            }
        } catch (err) {
            // ignore
        }
    }

    return items;
}

async function fetchMapData(location) {
    if (!location) return null;
    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'your_google_maps_api_key') {
        const q = encodeURIComponent(location);
        const embedUrl = `https://www.google.com/maps?q=${q}&output=embed`;
        return { embedUrl, note: 'No API key provided; returning search embed URL' };
    }

    try {
        const resp = await axios.get(geocodeUrl, { params: { address: location, key: GOOGLE_MAPS_API_KEY } });
        if (!resp.data || resp.data.status !== 'OK' || !resp.data.results || resp.data.results.length === 0) {
            return null;
        }
        const result = resp.data.results[0];
        const { lat, lng } = result.geometry.location;
        const formatted = result.formatted_address;
        const embedUrl = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${lat},${lng}&zoom=12`;
        return { lat, lng, formatted, embedUrl };
    } catch (err) {
        return null;
    }
}

module.exports = { fetchYouTubeVideos, fetchMapData };
