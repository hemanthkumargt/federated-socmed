import React, { useState, useEffect, useRef } from 'react';
import { FiHeart, FiMessageCircle, FiUserPlus, FiRepeat, FiX, FiBell } from 'react-icons/fi';
import { getApiBaseUrl } from '../config/api';

const NotificationsPanel = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const API_BASE_URL = getApiBaseUrl();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!token || !user.federatedId) return;

      // Fetch posts where current user was liked/commented on
      const res = await fetch(`${API_BASE_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      const notifs = [];
      if (data.success && Array.isArray(data.posts)) {
        data.posts.forEach(post => {
          if (post.authorFederatedId !== user.federatedId) return;

          // Like notifications
          if (post.likedBy && post.likedBy.length > 0) {
            post.likedBy.slice(-3).forEach(likerId => {
              if (likerId !== user.federatedId) {
                notifs.push({
                  id: `like-${post._id}-${likerId}`,
                  type: 'like',
                  actor: likerId.split('@')[0],
                  message: 'liked your post',
                  excerpt: (post.description || '').slice(0, 50),
                  time: post.updatedAt || post.createdAt,
                  icon: 'heart'
                });
              }
            });
          }

          // Comment notifications
          if (post.comments && post.comments.length > 0) {
            post.comments.slice(-3).forEach(comment => {
              if (comment.displayName !== user.displayName) {
                notifs.push({
                  id: `comment-${post._id}-${comment.displayName}`,
                  type: 'comment',
                  actor: comment.displayName,
                  message: `commented: "${(comment.content || '').slice(0, 40)}"`,
                  excerpt: (post.description || '').slice(0, 40),
                  time: comment.createdAt,
                  icon: 'comment'
                });
              }
            });
          }
        });
      }

      // Follow requests — fetch pending follows
      try {
        const fRes = await fetch(`${API_BASE_URL}/user/follow-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fData = await fRes.json();
        if (fData.success && Array.isArray(fData.requests)) {
          fData.requests.forEach(req => {
            notifs.push({
              id: `follow-${req._id}`,
              type: 'follow_request',
              actor: req.followerDisplayName || req.followerFederatedId?.split('@')[0],
              message: 'sent you a follow request',
              time: req.createdAt,
              icon: 'person'
            });
          });
        }
      } catch {}

      // Sort by newest
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(notifs.slice(0, 20));
      setUnreadCount(notifs.length);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <FiHeart size={16} color="#ec4899" />;
      case 'comment': return <FiMessageCircle size={16} color="#6366f1" />;
      case 'follow_request': return <FiUserPlus size={16} color="#22c55e" />;
      case 'repost': return <FiRepeat size={16} color="#f59e0b" />;
      default: return <FiBell size={16} color="#94a3b8" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) setUnreadCount(0); }}
        style={{
          background: open ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#ffffff',
          position: 'relative',
          transition: 'all 0.2s',
          marginBottom: '8px'
        }}
        title="Notifications"
      >
        <FiHeart size={20} color={open ? '#ec4899' : '#ffffff'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ec4899',
            color: 'white',
            borderRadius: '10px',
            fontSize: '10px',
            fontWeight: '800',
            padding: '2px 5px',
            minWidth: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(236,72,153,0.5)'
          }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '52px',
          right: 0,
          width: '360px',
          maxHeight: '480px',
          background: 'rgba(15, 20, 35, 0.97)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#ffffff',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>Activity</span>
            <button onClick={() => setOpen(false)} style={{
              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'
            }}>
              <FiX size={18} />
            </button>
          </div>

          {/* Content */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <FiHeart size={40} color="#334155" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>No activity yet</p>
                <p style={{ color: '#475569', fontSize: '13px', margin: '4px 0 0' }}>
                  When people like or comment on your posts, you'll see it here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} style={{
                  padding: '14px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.15s',
                  cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Icon bubble */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '14px',
                    background: notif.type === 'like' ? 'rgba(236,72,153,0.15)' :
                      notif.type === 'comment' ? 'rgba(99,102,241,0.15)' :
                      notif.type === 'follow_request' ? 'rgba(34,197,94,0.15)' :
                      'rgba(245,158,11,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0', lineHeight: 1.4 }}>
                      <strong style={{ color: '#fff' }}>{notif.actor}</strong>{' '}
                      <span style={{ color: '#94a3b8' }}>{notif.message}</span>
                    </p>
                    {notif.excerpt && (
                      <p style={{
                        margin: '4px 0 0',
                        fontSize: '12px',
                        color: '#475569',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>"{notif.excerpt}..."</p>
                    )}
                    <span style={{ fontSize: '11px', color: '#475569' }}>{formatTime(notif.time)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
