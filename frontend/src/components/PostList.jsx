import React, { useState, useEffect, useRef } from 'react';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiRepeat, FiSlash, FiSend, FiLink } from 'react-icons/fi';
import { getApiBaseUrl } from '../config/api';

const PostList = ({ posts, onLike, activeTimeline, onDeletePost }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showCommentsId, setShowCommentsId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [localLikes, setLocalLikes] = useState({});
  const menuRef = useRef(null);

  const API_BASE_URL = getApiBaseUrl();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try { setCurrentUser(JSON.parse(userStr)); }
      catch { setCurrentUser(null); }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (onDeletePost) onDeletePost(postId);
        setOpenMenuId(null);
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch { alert('Failed to delete post. Please try again.'); }
  };

  const isOwnPost = (post) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return post.authorFederatedId === currentUser.federatedId ||
      post.userDisplayName === currentUser.displayName;
  };

  // Use proper /posts/repost endpoint
  const handleRepost = async (post) => {
    if (!window.confirm(`Repost "${(post.description || '').slice(0, 50)}..."?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postFederatedId: post.federatedId })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Reposted!');
        if (onDeletePost) setTimeout(() => window.location.reload(), 800);
      } else {
        alert(data.message || 'Could not repost');
      }
    } catch (err) {
      console.error('Repost error:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleComment = async (post) => {
    if (!commentText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/comment/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postFederatedId: post.federatedId, content: commentText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCommentText('');
        showToast('💬 Comment added!');
        setTimeout(() => window.location.reload(), 700);
      } else {
        alert(data.message || 'Failed to add comment');
      }
    } catch { alert('Network error. Please try again.'); }
  };

  const handleLike = async (post) => {
    const prev = localLikes[post._id];
    const isLiked = prev?.liked ?? (currentUser && post.likedBy?.includes(currentUser.federatedId));
    const newCount = isLiked
      ? Math.max(0, (prev?.count ?? post.likeCount) - 1)
      : (prev?.count ?? post.likeCount) + 1;
    setLocalLikes(l => ({ ...l, [post._id]: { liked: !isLiked, count: newCount } }));
    if (onLike) onLike(post.federatedId);
  };

  const handleShare = (post) => {
    const shareUrl = `${window.location.origin}/post/${post.federatedId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => showToast('🔗 Link copied!'));
    } else {
      prompt('Copy this link:', shareUrl);
    }
  };

  // Tiny inline toast
  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const formatTime = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="empty-state" style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>
        {activeTimeline === 'federated' ? 'Federated timeline is empty — try following more people!' : 'No posts yet. Be the first to post!'}
      </div>
    );
  }

  return (
    <div className="posts-feed">
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15,20,35,0.95)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px',
          padding: '12px 28px', fontSize: '15px', fontWeight: '700', color: '#fff',
          zIndex: 99999, boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.2s ease'
        }}>{toast}</div>
      )}

      {posts.map((post) => {
        const likeState = localLikes[post._id];
        const isLiked = likeState?.liked ?? (currentUser && post.likedBy?.includes(currentUser.federatedId));
        const likeCount = likeState?.count ?? post.likeCount;

        return (
          <div key={post._id} className="post">
            {/* Repost banner */}
            {post.isRepost && (
              <div className="repost-banner">
                <FiRepeat size={14} />
                <span>
                  Reposted from <strong>{post.originalAuthorDisplayName || 'someone'}</strong>
                </span>
              </div>
            )}

            {/* Header */}
            <div className="post-header">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="user-avatar" style={{ flexShrink: 0 }}>
                  {getInitials(post.userDisplayName || post.author)}
                </div>
                <div>
                  <div className="author-name">
                    {post.userDisplayName || post.author || 'Anonymous'}
                    {post.isChannelPost && post.channelName && (
                      <span style={{ fontSize: '13px', color: '#ec4899', marginLeft: '6px', fontWeight: 600 }}>
                        in #{post.channelName}
                      </span>
                    )}
                  </div>
                  <div className="post-time">
                    {formatTime(post.createdAt)}
                    {post.serverName && <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '6px' }}>• {post.serverName}</span>}
                  </div>
                </div>
              </div>

              {/* 3-dot menu */}
              <div className="post-menu-container" ref={openMenuId === post._id ? menuRef : null}>
                <button className="post-menu" onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}>
                  <FiMoreHorizontal />
                </button>
                {openMenuId === post._id && (
                  <div className="post-dropdown-menu">
                    {isOwnPost(post) && (
                      <button className="dropdown-item delete-item" onClick={() => handleDelete(post._id)}>
                        <FiTrash2 size={15} /> Delete Post
                      </button>
                    )}
                    {!isOwnPost(post) && (
                      <button className="dropdown-item" onClick={() => { showToast('User muted!'); setOpenMenuId(null); }}>
                        <FiSlash size={15} /> Mute User
                      </button>
                    )}
                    <button className="dropdown-item" onClick={() => { handleShare(post); setOpenMenuId(null); }}>
                      <FiLink size={15} /> Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="post-content" style={{ marginTop: '16px' }}>
              {post.description || post.content}
            </div>

            {/* Images */}
            {(post.images?.length > 0 || post.image) && (
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: post.images?.length > 1 ? '1fr 1fr' : '1fr', gap: '8px' }}>
                {(post.images?.length > 0 ? post.images : [post.image]).map((img, i) => (
                  <img key={i} src={img} alt="" style={{
                    width: '100%', borderRadius: '16px', maxHeight: '320px',
                    objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)'
                  }} />
                ))}
              </div>
            )}

            {/* Action bar */}
            <div className="post-footer">
              {/* Like */}
              <button
                className="post-action"
                onClick={() => handleLike(post)}
                style={isLiked ? { color: '#ec4899', borderColor: 'rgba(236,72,153,0.4)', background: 'rgba(236,72,153,0.1)' } : {}}
              >
                <FiHeart fill={isLiked ? '#ec4899' : 'none'} />
                <span>Like</span>
                {likeCount > 0 && <span className="count">{likeCount}</span>}
              </button>

              {/* Comment */}
              <button
                className="post-action"
                onClick={() => setShowCommentsId(showCommentsId === post._id ? null : post._id)}
                style={showCommentsId === post._id ? { color: '#6366f1', borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)' } : {}}
              >
                <FiMessageCircle />
                <span>Comment</span>
                {post.comments?.length > 0 && <span className="count">{post.comments.length}</span>}
              </button>

              {/* Repost */}
              <button className="post-action" onClick={() => handleRepost(post)}>
                <FiRepeat />
                <span>Repost</span>
                {post.repostCount > 0 && <span className="count">{post.repostCount}</span>}
              </button>

              {/* Share */}
              <button className="post-action" onClick={() => handleShare(post)}>
                <FiShare2 />
                <span>Share</span>
              </button>
            </div>

            {/* Comments section */}
            {showCommentsId === post._id && (
              <div style={{
                marginTop: '16px', padding: '16px 20px',
                background: 'rgba(0,0,0,0.15)', borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                {/* Comment input */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment(post)}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: '14px',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white', outline: 'none', fontSize: '14px'
                    }}
                  />
                  <button
                    className="post-btn"
                    onClick={() => handleComment(post)}
                    disabled={!commentText.trim()}
                    style={{ padding: '10px 16px' }}
                  >
                    <FiSend size={16} />
                  </button>
                </div>

                {/* Comments list */}
                {post.comments?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {post.comments.map((c, idx) => (
                      <div key={idx} style={{
                        display: 'flex', gap: '10px', alignItems: 'flex-start',
                        padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
                        borderRadius: '12px'
                      }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                          background: 'linear-gradient(135deg, #ec4899, #be185d)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: '800', color: 'white'
                        }}>
                          {getInitials(c.displayName)}
                        </div>
                        <div>
                          <span style={{ color: '#f472b6', fontWeight: '700', fontSize: '13px' }}>{c.displayName}</span>
                          <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '2px 0 0' }}>{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', margin: 0 }}>
                    No comments yet — be the first! 👋
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
