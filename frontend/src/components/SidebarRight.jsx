import React, { useEffect, useState } from 'react';
import {
  FiUser,
  FiUsers,
  FiCircle,
  FiCoffee,
  FiBookOpen
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const SidebarRight = () => {
  const [followedChannels, setFollowedChannels] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_BASE_URL = "http://localhost:5000/api";
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
      const res = await fetch(`${API_BASE_URL}/channels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success || !Array.isArray(data.channels)) {
        setError(data.message || 'Failed to load channels');
        setFollowedChannels([]);
      } else {
        const checks = await Promise.all(
          data.channels.map(async (c) => {
            try {
              const r = await fetch(`${API_BASE_URL}/channels/follow/${encodeURIComponent(c.name)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const x = await r.json();
              return x.success && x.isFollowing ? c : null;
            } catch {
              return null;
            }
          })
        );
        setFollowedChannels(checks.filter(Boolean));
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/user/top`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setTopUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching top users:', err);
    }
  };

  useEffect(() => {
    fetchFollowedChannels();
    fetchTopUsers();
  }, []);

  return (
    <aside className="right-sidebar">

      <div className="user-profile">
        <div className="user-avatar large">
          {user ? getInitials(user.displayName) : <FiUser />}
        </div>
        <span>{user?.displayName || 'User'}</span>
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

      <div className="widget">
        <h3>Popular Users</h3>

        {topUsers.length === 0 ? (
          <div className="empty-state">No users yet.</div>
        ) : (
          topUsers.map((u) => (
            <Link
              key={u._id}
              to={`/user/${encodeURIComponent(u.federatedId)}`}
              className="contact-item"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="contact-avatar online">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <FiUser />
                )}
              </div>
              <span>{u.displayName}</span>
              {u.followersCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.6 }}>
                  <FiUsers style={{ fontSize: '0.7rem', marginRight: 2 }} />{u.followersCount}
                </span>
              )}
            </Link>
          ))
        )}
      </div>

    </aside>
  );
};

export default SidebarRight;
