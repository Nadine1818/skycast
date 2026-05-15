import React from 'react';
import { Award } from 'lucide-react';

export const PMAcceleratorInfo = () => {
    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '1.5rem',
            padding: '2rem',
            backdropFilter: 'blur(20px)'
        }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={24} style={{ color: '#8b5cf6' }} />
                About PM Accelerator
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', marginBottom: '1.5rem' }}>
                Presented by Nadine Mohamed
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                <p style={{ fontSize: 'clamp(0.875rem, 2vw, 0.95rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                    PM Accelerator helps product professionals at every stage — from entry-level to executives — with hands-on programs, mentorship, and career services.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(0.75rem, 2vw, 1rem)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'clamp(0.7rem, 2vw, 0.8rem) clamp(0.9rem, 3vw, 1rem)', borderRadius: '0.6rem' }}>
                        <strong style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>PMA Pro</strong><div style={{ fontSize: 'clamp(0.78rem, 1.5vw, 0.82rem)', color: 'rgba(255,255,255,0.75)', marginTop: '0.3rem' }}>Job search, mock interviews, referrals</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'clamp(0.7rem, 2vw, 0.8rem) clamp(0.9rem, 3vw, 1rem)', borderRadius: '0.6rem' }}>
                        <strong style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>AI PM Bootcamp</strong><div style={{ fontSize: 'clamp(0.78rem, 1.5vw, 0.82rem)', color: 'rgba(255,255,255,0.75)', marginTop: '0.3rem' }}>Build and launch AI products</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'clamp(0.7rem, 2vw, 0.8rem) clamp(0.9rem, 3vw, 1rem)', borderRadius: '0.6rem' }}>
                        <strong style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>1:1 Resume</strong><div style={{ fontSize: 'clamp(0.78rem, 1.5vw, 0.82rem)', color: 'rgba(255,255,255,0.75)', marginTop: '0.3rem' }}>Resume rewrite + template</div>
                    </div>
                </div>

                <div style={{ marginTop: '0.25rem', fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', color: 'rgba(255,255,255,0.75)' }}>
                    <a href="https://www.pmaccelerator.io/" target="_blank" rel="noreferrer" style={{ color: '#bfdbfe' }}>Website</a> • <a href="https://www.youtube.com/c/drnancyli" target="_blank" rel="noreferrer" style={{ color: '#bfdbfe' }}>YouTube</a>
                </div>
            </div>

            <div style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '1rem',
                padding: '1rem 1.5rem',
                marginTop: '1.5rem'
            }}>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    💻 Built with React, Node.js, Express, MongoDB | AI Engineer Intern Technical Assessment
                </p>
            </div>
        </div>
    );
};
