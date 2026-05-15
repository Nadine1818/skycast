import React, { useEffect, useState } from 'react';

export const ExternalMedia = ({ location }) => {
    const [videos, setVideos] = useState([]);
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!location) return;
        setLoading(true);

        const fetchAll = async () => {
            try {
                const vRes = await fetch(`/api/external/videos?location=${encodeURIComponent(location)}`);
                const vJson = await vRes.json();
                setVideos(vJson.data || []);

                const mRes = await fetch(`/api/external/maps?location=${encodeURIComponent(location)}`);
                const mJson = await mRes.json();
                setMapData(mJson.data || null);
            } catch (err) {
                console.error('External fetch error', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [location]);

    if (!location) return null;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Location Media</h3>

            {/* Map */}
            {mapData ? (
                <div style={{ width: '100%', height: 300, marginBottom: '1rem' }}>
                    <iframe
                        title="map"
                        src={mapData.embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
            ) : (
                <div style={{ height: 300, marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {loading ? 'Loading map...' : 'Map not available'}
                </div>
            )}

            {/* Videos */}
            <div>
                <h4>Related Videos</h4>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                    {videos.length > 0 ? videos.map(v => (
                        <a key={v.videoId} href={`https://www.youtube.com/watch?v=${v.videoId}`} target="_blank" rel="noreferrer" style={{ minWidth: 220, display: 'block', color: 'inherit', textDecoration: 'none' }}>
                            <div style={{ width: 220 }}>
                                <img src={v.thumbnail} alt={v.title} style={{ width: '100%', borderRadius: 6 }} />
                                <div style={{ fontSize: 13, marginTop: 6 }}>{v.title}</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{v.channelTitle}</div>
                            </div>
                        </a>
                    )) : (
                        <div>No videos available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExternalMedia;
