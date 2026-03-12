import React from 'react';

const ServerCard = ({ server }) => {
    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '24px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            height: '100%',
            opacity: server.enabled ? 1 : 0.6,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: server.enabled ? 'pointer' : 'default',
            position: 'relative'
        }}
            onMouseEnter={(e) => {
                if (server.enabled) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 15px 50px rgba(236, 72, 153, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.3)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }
            }}
            onMouseLeave={(e) => {
                if (server.enabled) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.3)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
            }}
        >
            {/* Banner Area */}
            <div style={{
                height: '160px',
                background: server.image
                    ? `url(${server.image}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                position: 'relative',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                {!server.enabled && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(2px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                    </div>
                )}
            </div>

            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    color: '#f472b6',
                    marginBottom: '10px',
                    fontWeight: '800',
                    letterSpacing: '0.1em'
                }}>
                    {server.category.toUpperCase()}
                </div>

                <h3 style={{
                    margin: '0 0 12px 0',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#ffffff',
                    fontFamily: "'Outfit', sans-serif"
                }}>{server.name}</h3>

                <p style={{
                    margin: '0 0 24px 0',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'rgba(255,255,255,0.6)',
                    flex: 1
                }}>
                    {server.description}
                </p>

                {server.enabled ? (
                    <a href="/auth" 
                        onClick={(e) => {
                            e.preventDefault();
                            const isLocal = window.location.hostname === 'localhost';
                            if (server.name.toLowerCase() === 'sports') {
                                localStorage.setItem('activeServer', isLocal ? 'http://localhost:5001/api' : 'https://federated-sports-server.onrender.com/api');
                            } else {
                                localStorage.setItem('activeServer', isLocal ? 'http://localhost:5000/api' : 'https://federated-socialnetw.onrender.com/api');
                            }
                            window.location.href = '/auth';
                        }}
                        style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box'
                    }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.02)';
                            e.target.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.4)';
                        }}
                    >
                        Join Server
                    </a>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        Coming Soon
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServerCard;
