import React, { useState } from 'react';
import { Download, FileJson, FileText, File } from 'lucide-react';
import { weatherAPI } from '../utils/api';
import { downloadFile } from '../utils/helpers';

export const DataExport = ({ location }) => {
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState(null);
    const [exportSuccess, setExportSuccess] = useState(false);

    const formats = [
        { name: 'JSON', value: 'json', icon: FileJson, color: '#3b82f6' },
        { name: 'CSV', value: 'csv', icon: FileText, color: '#10b981' },
        { name: 'XML', value: 'xml', icon: File, color: '#8b5cf6' },
        { name: 'PDF', value: 'pdf', icon: FileText, color: '#ef4444' },
        { name: 'Markdown', value: 'markdown', icon: FileText, color: '#f59e0b' },
    ];

    const handleExport = async (format) => {
        setExporting(true);
        setExportError(null);
        setExportSuccess(false);
        try {
            if (!location) {
                setExportError('Please search for a location first');
                setExporting(false);
                return;
            }

            const response = await weatherAPI.exportData(format, location);
            const filename = `weather_data_${new Date().getTime()}.${format === 'markdown' ? 'md' : format}`;
            const mimeType = response.headers['content-type'] || 'text/plain';

            // Convert arraybuffer to blob if needed
            let dataToDownload = response.data;
            if (response.data instanceof ArrayBuffer) {
                dataToDownload = new Blob([response.data], { type: mimeType });
            }

            downloadFile(dataToDownload, filename, mimeType);
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message || 'Export failed';
            setExportError(errorMsg);
            console.error('Export error:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1.5rem',
            padding: '2rem',
            backdropFilter: 'blur(20px)'
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Download size={24} />
                Export Data
            </h2>

            {exportError && (
                <div className="alert" style={{ marginBottom: '1rem' }}>
                    <span style={{ color: '#ffffff' }}>{exportError}</span>
                </div>
            )}

            {exportSuccess && (
                <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    color: '#10b981',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                }}>
                    ✓ File downloaded successfully!
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem' }}>
                {formats.map((format) => {
                    const Icon = format.icon;
                    return (
                        <button
                            key={format.value}
                            onClick={() => handleExport(format.value)}
                            disabled={exporting}
                            style={{
                                background: format.color,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '1rem',
                                padding: '1rem 0.75rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                opacity: exporting ? 0.5 : 1,
                                transform: exporting ? 'scale(1)' : 'scale(1)',
                                boxShadow: `0 4px 15px ${format.color}40`
                            }}
                            onMouseEnter={(e) => {
                                if (!exporting) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = `0 8px 25px ${format.color}60`;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!exporting) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = `0 4px 15px ${format.color}40`;
                                }
                            }}
                        >
                            {exporting ? (
                                <span style={{
                                    display: 'inline-block',
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#ffffff',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }}></span>
                            ) : (
                                <Icon size={20} />
                            )}
                            <span>{format.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
