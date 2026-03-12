import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import '../styles/app.css';

const UnlockAccount = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
    const [message, setMessage] = useState('Verifying your unlock token...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing unlock token.');
            return;
        }

        const unlock = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/auth/unlock?token=${token}`);
                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message || 'Your account has been successfully unlocked!');
                }
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Failed to unlock account. The link may have expired.');
            }
        };

        unlock();
    }, [token]);

    return (
        <div className="auth-page">
            <video
                className="auth-video-bg"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src="/media/lakeside.mp4" type="video/mp4" />
            </video>

            <div className="auth-content">
                <main className="auth-card" style={{ maxWidth: '450px', padding: '40px', textAlign: 'center', background: 'rgba(14, 13, 33, 0.75)', backdropFilter: 'blur(40px)', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 30px 100px rgba(0,0,0,0.6)' }}>
                    <div className="auth-header" style={{ marginBottom: '30px' }}>
                        <h1 style={{ color: 'white', fontFamily: 'Outfit, sans-serif' }}>Account Recovery</h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Connect Secure Access</p>
                    </div>

                    {status === 'loading' && (
                        <div className="status-container">
                            <FiLoader className="spin" style={{ fontSize: '48px', color: '#ec4899', marginBottom: '20px' }} />
                            <h2 style={{ color: 'white', marginBottom: '10px' }}>Verifying...</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)' }}>{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="status-container">
                            <FiCheckCircle style={{ fontSize: '64px', color: '#10b981', marginBottom: '20px' }} />
                            <h2 style={{ color: 'white', marginBottom: '10px' }}>Access Restored</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>{message}</p>
                            <button
                                className="auth-submit-btn"
                                onClick={() => navigate('/auth')}
                                style={{ width: '100%' }}
                            >
                                Sign In Now
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="status-container">
                            <FiXCircle style={{ fontSize: '64px', color: '#ef4444', marginBottom: '20px' }} />
                            <h2 style={{ color: 'white', marginBottom: '10px' }}>Link Invalid</h2>
                            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '30px' }}>{message}</p>
                            <button
                                className="auth-submit-btn"
                                onClick={() => navigate('/auth')}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.1)' }}
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UnlockAccount;
