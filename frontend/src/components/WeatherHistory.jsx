import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Archive, CalendarDays, Edit3, MapPin, PencilLine, RefreshCw, Trash2, X } from 'lucide-react';
import { weatherAPI } from '../utils/api';
import { formatDate, formatTemp } from '../utils/helpers';

const emptyEditForm = {
    location: '',
    startDate: '',
    endDate: '',
};

const fieldStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '1rem',
    color: '#fff',
    padding: '0.9rem 1rem',
    fontSize: '0.98rem',
    outline: 'none',
};

const modalInputStyle = {
    ...fieldStyle,
    background: 'rgba(10, 14, 39, 0.6)',
};

const buttonBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '0.9rem',
    padding: '0.7rem 1rem',
    border: '1px solid transparent',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
};

export const WeatherHistory = ({ onRecordDeleted }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editRecord, setEditRecord] = useState(null);
    const [deleteRecord, setDeleteRecord] = useState(null);
    const [editSaving, setEditSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [editForm, setEditForm] = useState(emptyEditForm);

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        if (editRecord) {
            setEditForm({
                location: editRecord.location || '',
                startDate: editRecord.startDate ? new Date(editRecord.startDate).toISOString().split('T')[0] : '',
                endDate: editRecord.endDate ? new Date(editRecord.endDate).toISOString().split('T')[0] : '',
            });
            setFormError(null);
        }
    }, [editRecord]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const response = await weatherAPI.getAllRecords({ limit: 20 });
            setRecords(response.data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteRecord) return;

        try {
            await weatherAPI.deleteRecord(deleteRecord._id);
            setRecords((current) => current.filter((record) => record._id !== deleteRecord._id));
            onRecordDeleted?.();
            setDeleteRecord(null);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || err.message);
        }
    };

    const handleSaveEdit = async (event) => {
        event.preventDefault();
        setFormError(null);

        if (!editForm.location.trim() || !editForm.startDate || !editForm.endDate) {
            setFormError('Location, start date, and end date are required.');
            return;
        }

        if (new Date(editForm.startDate) > new Date(editForm.endDate)) {
            setFormError('Start date must be before end date.');
            return;
        }

        setEditSaving(true);
        try {
            await weatherAPI.resolveLocation(editForm.location.trim());
            const response = await weatherAPI.updateRecord(editRecord._id, editForm);
            setRecords((current) =>
                current.map((record) => (record._id === editRecord._id ? response.data.data : record))
            );
            setEditRecord(null);
            onRecordDeleted?.();
        } catch (err) {
            setFormError(err.response?.data?.error || err.response?.data?.message || err.message || 'Unable to update record.');
        } finally {
            setEditSaving(false);
        }
    };

    const groupedRecords = useMemo(() => records, [records]);

    if (records.length === 0 && !loading) {
        return null;
    }

    return (
        <div style={{
            background: 'linear-gradient(180deg, rgba(12, 18, 48, 0.92) 0%, rgba(12, 18, 48, 0.82) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '2rem',
            padding: 'clamp(1rem, 3vw, 1.5rem)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
            backdropFilter: 'blur(20px)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(0.75rem, 2vw, 1rem)', marginBottom: 'clamp(0.75rem, 2vw, 1.25rem)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.6rem, 2vw, 0.9rem)', minWidth: 0 }}>
                    <div style={{
                        width: 'clamp(2.5rem, 8vw, 3rem)',
                        height: 'clamp(2.5rem, 8vw, 3rem)',
                        borderRadius: '1rem',
                        display: 'grid',
                        placeItems: 'center',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.22) 0%, rgba(14,165,233,0.14) 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0
                    }}>
                        <Archive size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.35rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>Recent Searches</h2>
                        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(0.8rem, 2vw, 0.9rem)' }}>Review, update, or remove saved weather snapshots</div>
                    </div>
                </div>

                <button
                    onClick={fetchRecords}
                    disabled={loading}
                    style={{
                        ...buttonBase,
                        background: 'rgba(255,255,255,0.06)',
                        color: '#dbeafe',
                        borderColor: 'rgba(255,255,255,0.12)',
                        opacity: loading ? 0.6 : 1,
                        whiteSpace: 'nowrap',
                        padding: 'clamp(0.5rem, 1.5vw, 0.7rem) clamp(0.75rem, 2vw, 1rem)',
                        fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                    }}
                >
                    <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <span>{error}</span>
                </div>
            )}

            {loading && (
                <div style={{ display: 'grid', placeItems: 'center', padding: '2.5rem 0' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        border: '3px solid rgba(255,255,255,0.08)',
                        borderTopColor: '#60a5fa',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                    }} />
                </div>
            )}

            {!loading && groupedRecords.length > 0 && (
                <div style={{ display: 'grid', gap: 'clamp(0.75rem, 2vw, 1rem)' }}>
                    {groupedRecords.map((record) => (
                        <div
                            key={record._id}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
                                border: '1px solid rgba(255,255,255,0.09)',
                                borderRadius: '1.5rem',
                                padding: 'clamp(0.8rem, 2vw, 1.1rem)',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                '@media (max-width: 768px)': {
                                    gridTemplateColumns: '1fr',
                                },
                                gap: 'clamp(0.8rem, 2vw, 1rem)',
                                alignItems: 'start',
                                transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease',
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 1.5vw, 0.7rem)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 1.5vw, 0.7rem)', flexWrap: 'wrap' }}>
                                    <div style={{ fontSize: 'clamp(0.95rem, 3vw, 1.05rem)', fontWeight: 800, color: '#fff' }}>{record.location}</div>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)',
                                        padding: 'clamp(0.25rem, 1vw, 0.35rem) clamp(0.4rem, 1.5vw, 0.6rem)',
                                        borderRadius: '999px',
                                        background: 'rgba(59,130,246,0.14)',
                                        border: '1px solid rgba(59,130,246,0.24)',
                                        color: '#bfdbfe',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        <CalendarDays size={12} />
                                        {formatDate(record.startDate)} - {formatDate(record.endDate)}
                                    </span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize', lineHeight: 1.5, fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}>
                                    {record.weather?.description || 'Weather details unavailable'}
                                </div>
                                {record.dailyTemps && record.dailyTemps.length > 0 && (
                                    <div style={{ display: 'flex', gap: 'clamp(0.4rem, 1.5vw, 0.6rem)', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                                        {record.dailyTemps.slice(0, 5).map((d, idx) => (
                                            <div key={idx} style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.04)',
                                                padding: 'clamp(0.25rem, 1vw, 0.35rem) clamp(0.4rem, 1.5vw, 0.6rem)',
                                                borderRadius: '0.6rem',
                                                fontSize: 'clamp(0.75rem, 1.5vw, 0.82rem)',
                                                color: '#e6eef8',
                                                display: 'inline-flex',
                                                gap: '0.45rem',
                                                alignItems: 'center',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <span style={{ opacity: 0.9 }}>{formatDate(d.date)}</span>
                                                <strong style={{ marginLeft: '0.25rem' }}>{formatTemp(d.avg)}°</strong>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 'clamp(0.6rem, 2vw, 0.85rem)', flexWrap: 'wrap', color: 'rgba(255,255,255,0.62)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
                                        <MapPin size={14} />
                                        {record.latitude?.toFixed?.(2) ?? '--'}, {record.longitude?.toFixed?.(2) ?? '--'}
                                    </span>
                                    <span>Saved {new Date(record.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                            }}>
                                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '1rem', padding: 'clamp(0.6rem, 2vw, 0.85rem)' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 'clamp(0.65rem, 1.5vw, 0.74rem)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current</div>
                                    <div style={{ color: '#fff', fontSize: 'clamp(1.3rem, 4vw, 1.7rem)', fontWeight: 800, lineHeight: 1.1 }}>{formatTemp(record.temperature?.current)}°</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: 'clamp(0.6rem, 2vw, 0.85rem)' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 'clamp(0.65rem, 1.5vw, 0.74rem)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Range</div>
                                    <div style={{ color: '#fff', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', fontWeight: 700 }}>{formatTemp(record.temperature?.min)}° / {formatTemp(record.temperature?.max)}°</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 1.5vw, 0.65rem)', alignItems: 'stretch' }}>
                                <button
                                    onClick={() => setEditRecord(record)}
                                    style={{
                                        ...buttonBase,
                                        background: 'linear-gradient(135deg, rgba(59,130,246,0.92) 0%, rgba(37,99,235,0.92) 100%)',
                                        color: '#fff',
                                        boxShadow: '0 12px 24px rgba(37,99,235,0.24)',
                                        padding: 'clamp(0.6rem, 1.5vw, 0.7rem) clamp(0.9rem, 2vw, 1rem)',
                                        fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                                    }}
                                >
                                    <PencilLine size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteRecord(record)}
                                    style={{
                                        ...buttonBase,
                                        background: 'rgba(239,68,68,0.11)',
                                        color: '#fecaca',
                                        borderColor: 'rgba(239,68,68,0.2)',
                                        padding: 'clamp(0.6rem, 1.5vw, 0.7rem) clamp(0.9rem, 2vw, 1rem)',
                                        fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && groupedRecords.length === 0 && (
                <div style={{
                    display: 'grid',
                    placeItems: 'center',
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.65)',
                }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>No saved weather history yet</div>
                    <div>Search a location to start building your history.</div>
                </div>
            )}

            {editRecord && (
                <div style={overlayStyle} onClick={() => !editSaving && setEditRecord(null)}>
                    <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: '999px', background: 'rgba(59,130,246,0.14)', color: '#bfdbfe', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                                    <Edit3 size={12} />
                                    Update Record
                                </div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>{editRecord.location}</h3>
                                <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: '0.35rem' }}>Edit the saved location or date range. The app re-validates the location before saving.</p>
                            </div>
                            <button
                                onClick={() => !editSaving && setEditRecord(null)}
                                style={{
                                    ...buttonBase,
                                    padding: '0.55rem',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {formError && (
                            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                                <AlertTriangle size={16} />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: '1rem' }}>
                            <label style={{ display: 'grid', gap: '0.5rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600 }}>Location</span>
                                <input
                                    value={editForm.location}
                                    onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))}
                                    placeholder="City, country, or coordinates"
                                    style={modalInputStyle}
                                />
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
                                <label style={{ display: 'grid', gap: '0.5rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600 }}>Start Date</span>
                                    <input
                                        type="date"
                                        value={editForm.startDate}
                                        onChange={(event) => setEditForm((current) => ({ ...current, startDate: event.target.value }))}
                                        style={modalInputStyle}
                                    />
                                </label>
                                <label style={{ display: 'grid', gap: '0.5rem' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600 }}>End Date</span>
                                    <input
                                        type="date"
                                        value={editForm.endDate}
                                        onChange={(event) => setEditForm((current) => ({ ...current, endDate: event.target.value }))}
                                        style={modalInputStyle}
                                    />
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => !editSaving && setEditRecord(null)}
                                    style={{
                                        ...buttonBase,
                                        background: 'rgba(255,255,255,0.06)',
                                        color: '#e2e8f0',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSaving}
                                    style={{
                                        ...buttonBase,
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                        color: '#fff',
                                        boxShadow: '0 12px 24px rgba(37,99,235,0.24)',
                                        opacity: editSaving ? 0.7 : 1,
                                    }}
                                >
                                    {editSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteRecord && (
                <div style={overlayStyle} onClick={() => setDeleteRecord(null)}>
                    <div style={{ ...modalStyle, maxWidth: '520px' }} onClick={(event) => event.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', borderRadius: '999px', background: 'rgba(239,68,68,0.14)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                                    <AlertTriangle size={12} />
                                    Confirm Delete
                                </div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>Delete this record?</h3>
                                <p style={{ color: 'rgba(255,255,255,0.65)', marginTop: '0.35rem' }}>
                                    {deleteRecord.location} • {formatDate(deleteRecord.startDate)} to {formatDate(deleteRecord.endDate)}
                                </p>
                            </div>
                            <button
                                onClick={() => setDeleteRecord(null)}
                                style={{
                                    ...buttonBase,
                                    padding: '0.55rem',
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#fff',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.14)',
                            borderRadius: '1rem',
                            padding: '1rem',
                            color: '#fecaca',
                            lineHeight: 1.6,
                            marginBottom: '1.25rem',
                        }}>
                            This action removes the saved weather snapshot from your database and cannot be undone.
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={() => setDeleteRecord(null)}
                                style={{
                                    ...buttonBase,
                                    background: 'rgba(255,255,255,0.06)',
                                    color: '#e2e8f0',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                style={{
                                    ...buttonBase,
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: '#fff',
                                    boxShadow: '0 12px 24px rgba(220,38,38,0.25)',
                                }}
                            >
                                Delete Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(2, 6, 23, 0.72)',
    backdropFilter: 'blur(10px)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 80,
    padding: '1rem',
};

const modalStyle = {
    width: '100%',
    maxWidth: '640px',
    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 14, 39, 0.98) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.75rem',
    padding: '1.25rem',
    boxShadow: '0 28px 100px rgba(0,0,0,0.45)',
};
