import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function ServerHeader() {
    const navigate = useNavigate();
    return (
        <header style={{ marginBottom: '48px' }}>
            <button 
                onClick={() => navigate(localStorage.getItem('token') ? '/' : '/landing')}
                style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginBottom: '20px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s ease',
                    fontWeight: '600'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
                <FiArrowLeft /> Back to Home
            </button>
            <h1 style={{ fontSize: '36px', margin: '0 0 16px 0', color: '#ffffff', letterSpacing: '-0.03em', fontFamily: "'Outfit', sans-serif", fontWeight: '800', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
                Find your community
            </h1>
            <p style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: '1.6',
                maxWidth: '680px',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
            }}>
                Our platform is made up of independent communities called <strong style={{ color: '#ec4899' }}>servers</strong>. Join a server that matches your interests to connect with like-minded people across the network.
            </p>
        </header>
    );
}

export default ServerHeader;
