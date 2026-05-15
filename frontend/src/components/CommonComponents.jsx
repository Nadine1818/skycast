import React from 'react';
import { Cloud, AlertCircle, X } from 'lucide-react';

export const ErrorAlert = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <div className="alert" style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <AlertCircle size={24} style={{ color: '#ef4444', flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                    <h3 style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>Error</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>{error}</p>
                </div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        color: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};

export const LoadingSpinner = ({ text = 'Loading...' }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '4rem',
            paddingBottom: '4rem'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1.5rem'
            }}></div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '1rem', marginBottom: '1rem' }}>
                {text}
            </p>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
                <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    background: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    background: 'rgba(59,130,246,0.7)',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: '0.2s'
                }}></div>
                <div style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    background: 'rgba(59,130,246,0.4)',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: '0.4s'
                }}></div>
            </div>
        </div>
    );
};

export const Card = ({ children, className = '' }) => (
    <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1.5rem',
        padding: '2rem',
        backdropFilter: 'blur(20px)'
    }} className={className}>
        {children}
    </div>
);

export const Button = ({
    children,
    variant = 'primary',
    loading = false,
    ...props
}) => {
    return (
        <button
            className="btn"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
            {...props}
        >
            {loading && (
                <span style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#ffffff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }}></span>
            )}
            {children}
        </button>
    );
};
