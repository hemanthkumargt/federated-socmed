import React, { useState, useEffect, useRef } from 'react';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiTrash2, FiRepeat, FiSlash, FiSend, FiLink } from 'react-icons/fi';
import { getApiBaseUrl } from '../config/api';

const PostList = ({ posts, onLike, activeTimeline, onDeletePost, onFollowChanged }) => {
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
        showToast('🗑️ Post deleted!');
      } else {
        showToast(`❌ ${data.message || 'Error'}`);
      }
    } catch { showToast('❌ Failed to delete post'); }
  };

  const isOwnPost = (post) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return post.authorFederatedId === currentUser.federatedId ||
      post.userDisplayName === currentUser.displayName;
  };

  const handleRepost = async (post) => {
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
        // Trigger a reload or update to show the new repost
        if (onFollowChanged) onFollowChanged();
      } else {
        showToast(`❌ ${data.message || 'Could not repost'}`);
      }
    } catch (err) {
      showToast('❌ Network error');
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
        // Refresh local comment list for this post if we had it in state
        if (onFollowChanged) onFollowChanged();
      } else {
        showToast('❌ Failed to add comment');
      }
    } catch { showToast('❌ Network error'); }
  };

  const handleLike = async (post) => {
    const prev = localLikes[post._id];
    const isLiked = prev?.liked ?? (currentUser && post.likedBy?.includes(currentUser.federatedId));
    const newCount = isLiked
      ? Math.max(0, (prev?.count ?? post.likeCount) - 1)
      : (prev?.count ?? post.likeCount) + 1;
    
    // Optimistic update
    setLocalLikes(l => ({ ...l, [post._id]: { liked: !isLiked, count: newCount } }));
    
    try {
      if (onLike) onLike(post.federatedId);
    } catch (err) {
      // Revert if error
      setLocalLikes(l => ({ ...l, [post._id]: { liked: isLiked, count: prev?.count ?? post.likeCount } }));
    }
  };


  const [toast, setToast] = useState('');
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
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
      <div className="empty-state" style={{ textAlign: 'center', padding: '100px 0', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.1)', borderRadius: '24px' }}>
        <FiMessageCircle size={48} style={{ opacity: 0.3, marginBottom: '20px' }} />
        {activeTimeline === 'federated' ? 'Federated timeline is empty — follow more people!' : 'No posts yet. Be the first!'}
      </div>
    );
  }

  return (
    <div className="posts-feed">
      {toast && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(15,20,35,0.95)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: '22px',
          padding: '14px 32px', fontSize: '15px', fontWeight: '700', color: '#fff',
          zIndex: 999999, boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
          animation: 'modalPop 0.3s ease'
        }}>{toast}</div>
      )}

      {posts.map((post) => {
        const likeState = localLikes[post._id];
        const isLiked = likeState?.liked ?? (currentUser && post.likedBy?.includes(currentUser.federatedId));
        const likeCount = likeState?.count ?? post.likeCount;

        return (
          <div key={post._id} className="post-card">
            {post.isRepost && (
              <div className="repost-header">
                <FiRepeat size={14} />
                <span>Reposted from <strong>{post.originalAuthorDisplayName || 'someone'}</strong></span>
              </div>
            )}

            <div className="post-header">
              <div className="user-info-group">
                <div className="user-avatar-initials">
                  {getInitials(post.userDisplayName || post.author)}
                </div>
                <div className="user-meta">
                  <span className="display-name">
                    {post.userDisplayName || post.author || 'Anonymous'}
                    {post.isChannelPost && <span className="channel-tag">in #{post.channelName}</span>}
                  </span>
                  <span className="timestamp">
                    {formatTime(post.createdAt)} {post.serverName && `• ${post.serverName}`}
                  </span>
                </div>
              </div>

              <div className="post-dropdown-container" ref={openMenuId === post._id ? menuRef : null}>
                <button className="icon-btn-circle" onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}>
                  <FiMoreHorizontal />
                </button>
                {openMenuId === post._id && (
                  <div className="post-dropdown-overlay">
                    {isOwnPost(post) && (
                      <button className="dropdown-action-btn delete" onClick={() => handleDelete(post._id)}>
                        <FiTrash2 /> Delete
                      </button>
                    )}
                    <button className="dropdown-action-btn" onClick={() => { showToast('🔇 User muted!'); setOpenMenuId(null); }}>
                      <FiSlash /> Mute User
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="post-body">
              {post.description || post.content}
            </div>

            {(post.images?.length > 0 || post.image) && (
              <div className="post-media-grid">
                {(post.images?.length > 0 ? post.images : [post.image]).map((img, i) => (
                  <img key={i} src={img} alt="" className="post-media-item" />
                ))}
              </div>
            )}

            <div className="post-action-bar">
              <button
                className={`post-action-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => handleLike(post)}
              >
                <FiHeart fill={isLiked ? '#ec4899' : 'none'} />
                <span>Like</span>
                {likeCount > 0 && <span className="badge">{likeCount}</span>}
              </button>

              <button
                className={`post-action-btn ${showCommentsId === post._id ? 'active' : ''}`}
                onClick={() => setShowCommentsId(showCommentsId === post._id ? null : post._id)}
              >
                <FiMessageCircle />
                <span>Comment</span>
                {post.comments?.length > 0 && <span className="badge">{post.comments.length}</span>}
              </button>

              <button className="post-action-btn" onClick={() => handleRepost(post)}>
                <FiRepeat />
                <span>Repost</span>
              </button>

            </div>

            {showCommentsId === post._id && (
              <div className="comments-drawer">
                <div className="comment-input-wrap">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment(post)}
                  />
                  <button onClick={() => handleComment(post)} disabled={!commentText.trim()} className="send-inline-btn">
                    <FiSend />
                  </button>
                </div>

                <div className="comment-list">
                  {post.comments?.length > 0 ? (
                    post.comments.map((c, idx) => (
                      <div key={idx} className="comment-bubble-item">
                        <div className="comment-avatar-sm">{getInitials(c.displayName)}</div>
                        <div className="comment-content-box">
                          <span className="commenter-name">{c.displayName}</span>
                          <p className="comment-text">{c.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments-msg">No comments yet — be the first! 👋</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
