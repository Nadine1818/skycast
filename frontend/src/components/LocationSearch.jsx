import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';

export const LocationSearch = ({ onSearch, loading }) => {
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (location && startDate && endDate) {
            onSearch({ location, startDate, endDate });
        }
    };

    // Set default dates
    useEffect(() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
            {/* Location Input */}
            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
                    <MapPin size={16} />
                    Location
                </label>
                <input
                    type="text"
                    placeholder="City, ZIP, or coordinates"
                    className="input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: '100%' }}
                />
                <small style={{ display: 'block', marginTop: '0.375rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                    London, 90210, or 40.71,-74.00
                </small>
            </div>

            {/* Date Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '0.375rem' }}>
                        <Calendar size={14} />
                        Start
                    </label>
                    <input
                        type="date"
                        className="input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ width: '100%', fontSize: '0.875rem' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '0.375rem' }}>
                        <Calendar size={14} />
                        End
                    </label>
                    <input
                        type="date"
                        className="input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ width: '100%', fontSize: '0.875rem' }}
                    />
                </div>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="btn"
                style={{ width: '100%' }}
            >
                <Search size={18} />
                Search
            </button>
        </form>
    );
};
