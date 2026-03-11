import React, { useEffect, useState } from 'react';
import {
  FiUser,
  FiCircle,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import DirectMessage from './HomePage-components/DirectMessage';
import NotificationsPanel from './NotificationsPanel';

import { getApiBaseUrl } from '../config/api';

const SidebarRight = () => {
  const [followedChannels, setFollowedChannels] = useState([]);
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = getApiBaseUrl();
  const getUserData = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch {
        return null;
      }
    }
    return null;
  };

  const user = getUserData();

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fetchFollowedChannels = async () => {
    try {
      const token = localStorage.getItem('token');
      // Single call to get all channels we follow — much faster than N+1
      const res = await fetch(`${API_BASE_URL}/channels/followed`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.channels)) {
        setFollowedChannels(data.channels);
      } else {
        // Fallback: get all channels (no filtering)
        const res2 = await fetch(`${API_BASE_URL}/channels`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data2 = await res2.json();
        if (data2.success && Array.isArray(data2.channels)) {
          setFollowedChannels(data2.channels.slice(0, 5));
        }
      }
    } catch {
      setError('Could not load channels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowedChannels();
  }, []);

  return (
    <aside className="right-sidebar">

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div className="user-avatar large">
            {user ? getInitials(user.displayName) : <FiUser />}
          </div>
          <span>{user?.displayName || 'User'}</span>
        </div>
        {/* Instagram-style Activity / Notifications Bell */}
        <NotificationsPanel />
      </div>

      <div className="widget">
        <h3>Channels You Follow</h3>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : error ? (
          <div className="empty-state" style={{ color: '#dc2626' }}>{error}</div>
        ) : followedChannels.length === 0 ? (
          <div className="empty-state">You are not following any channels yet.</div>
        ) : (
          followedChannels.map((c) => (
            <Link key={c._id} to={`/channels/${encodeURIComponent(c.name)}`} className="chat-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="chat-avatar">
                {c.image ? (
                  <img src={c.image} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <FiCircle />
                )}
              </div>
              <span style={{ textTransform: 'capitalize' }}>{c.name}</span>
            </Link>
          ))
        )}
      </div>

      <div className="widget" style={{ marginTop: '30px' }}>
        <h3>Direct Messages</h3>
        <button
          className="primary-btn"
          onClick={() => setShowDirectMessage(true)}
          style={{ width: '100%', marginTop: '12px' }}
        >
          Open Messages
        </button>
      </div>

      {/* Render DM as a true full-screen portal modal */}
      {showDirectMessage && createPortal(
        <DirectMessage onClose={() => setShowDirectMessage(false)} />,
        document.body
      )}

    </aside>
  );
};

export default SidebarRight;
