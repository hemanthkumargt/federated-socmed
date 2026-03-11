import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PostCreator from '../components/PostCreator';
import PostList from '../components/PostList';
import { FiHash, FiLock, FiUsers, FiAlertCircle } from 'react-icons/fi';
import { getApiBaseUrl } from '../config/api';
import '../styles/ChannelPage.css';
import { canPostInChannel, canViewChannelContent } from '../utils/rbac';

const API_BASE_URL = getApiBaseUrl();

const ChannelPage = () => {
  const { channelName } = useParams();
  const decodedChannelName = decodeURIComponent(channelName || '');

  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role || 'user');
      }
    } catch {
      setUserRole('user');
    }
  }, []);

  // Fetch posts and filter for current channel
  const fetchChannelPosts = async (name) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        const filtered = data.posts.filter(
          (p) => p.isChannelPost && p.channelName === name
        );
        setPosts(filtered);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching channel posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch channel details
  const fetchChannelDetails = async (name) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/channels/${encodeURIComponent(name)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        let channelObj = null;
        if (data.channel) {
          channelObj = data.channel;
        } else if (data.channels) {
          if (Array.isArray(data.channels)) {
            channelObj = data.channels.find(c => c.name === name) || data.channels[0];
          } else {
            channelObj = data.channels;
          }
        }
        setCurrentChannel(channelObj);
      }
    } catch (err) {
      console.error('Error fetching channel details:', err);
    }
  };

  // Check follow status
  const checkFollowStatus = async (name) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/channels/follow/${encodeURIComponent(name)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  // Toggle follow
  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isFollowing
        ? `${API_BASE_URL}/channels/unfollow/${encodeURIComponent(decodedChannelName)}`
        : `${API_BASE_URL}/channels/follow/${encodeURIComponent(decodedChannelName)}`;

      const res = await fetch(endpoint, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsFollowing(!isFollowing);
        // Refresh channel details to get updated follower count
        fetchChannelDetails(decodedChannelName);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleLikePost = async (postFederatedId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/like/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postFederatedId })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.map(post =>
          post.federatedId === postFederatedId
            ? { ...post, likeCount: data.likeCount, liked: data.liked }
            : post
        ));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };
  useEffect(() => {
    if (decodedChannelName) {
      const req = JSON.parse(localStorage.getItem('requestedChannels') || '[]');
      setRequested(Array.isArray(req) ? req.includes(decodedChannelName) : false);
      fetchChannelDetails(decodedChannelName);
      fetchChannelPosts(decodedChannelName);
      checkFollowStatus(decodedChannelName);
    }
  }, [decodedChannelName]);

  const getDisplayName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Layout>
      <div className="channel-page-container">
        {/* Channel Hero Section */}
        <div className="channel-hero">
          <div className={currentChannel?.image ? "hero-banner" : "hero-banner placeholder"}
            style={currentChannel?.image ? { backgroundImage: `url(${currentChannel.image})` } : {}}>
            {currentChannel?.image && <div className="banner-overlay"></div>}
            {!currentChannel?.image && (currentChannel?.visibility === 'private' ? <FiLock /> : <FiHash />)}
          </div>

          <div className={currentChannel?.image ? "hero-content has-image" : "hero-content"}>
            <div className="hero-main">
              {currentChannel?.image && (
                <div className="channel-avatar-large">
                  <img src={currentChannel.image} alt="" />
                </div>
              )}
              <div className={currentChannel?.image ? "hero-text on-dark" : "hero-text on-light"}>
                <div className={currentChannel?.image ? "channel-meta on-dark" : "channel-meta on-light"}>
                  {currentChannel?.visibility === 'public'
                    ? 'Public Community'
                    : currentChannel?.visibility === 'read-only'
                      ? 'Read-only Community'
                      : 'Private Community'} • {currentChannel?.followersCount || 0} followers
                </div>
                <h1>{getDisplayName(decodedChannelName)}</h1>
              </div>
            </div>

            {/* For private channels, use toggle-join which calls the real API but as a request */}
            {currentChannel?.visibility === 'private' ? (
              <button
                className={isFollowing ? "btn-follow-toggle following" : (requested ? "btn-follow-toggle requested" : "btn-follow-toggle join")}
                onClick={async () => {
                  if (isFollowing) {
                    // Unfollow
                    await handleFollowToggle();
                  } else if (!requested) {
                    // Request access = optimistically call follow API
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`${API_BASE_URL}/channels/follow/${encodeURIComponent(decodedChannelName)}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const data = await res.json();
                      if (data.success) {
                        setIsFollowing(true);
                        fetchChannelDetails(decodedChannelName);
                      } else {
                        // Store request locally if API fails
                        const prev = JSON.parse(localStorage.getItem('requestedChannels') || '[]');
                        localStorage.setItem('requestedChannels', JSON.stringify([...prev, decodedChannelName]));
                        setRequested(true);
                      }
                    } catch {
                      setRequested(true);
                    }
                  } else {
                    // Cancel request
                    const prev = JSON.parse(localStorage.getItem('requestedChannels') || '[]');
                    localStorage.setItem('requestedChannels', JSON.stringify(prev.filter(n => n !== decodedChannelName)));
                    setRequested(false);
                  }
                }}
              >
                {isFollowing ? 'Joined' : (requested ? 'Requested' : 'Join Community')}
              </button>
            ) : (
              <button
                className={isFollowing ? "btn-follow-toggle following" : "btn-follow-toggle join"}
                onClick={handleFollowToggle}
              >
                {isFollowing ? 'Joined' : 'Join Community'}
              </button>
            )}
          </div>

          {currentChannel?.description && (
            <div className="hero-description">
              {currentChannel.description}
            </div>
          )}
        </div>

        {/* Create Post Section - RBAC enforced */}
        {canPostInChannel({ role: userRole }, currentChannel, isFollowing) ? (
          <PostCreator
            isChannelPost={true}
            channelName={decodedChannelName}
            onPostCreated={(newPost) => setPosts([newPost, ...posts])}
          />
        ) : (
          <div className="empty-state channel-restricted-msg">
            <FiAlertCircle size={20} />
            <span>
              {currentChannel?.visibility === 'read-only' 
                ? 'This channel is read-only. Only admins can post here.' 
                : currentChannel?.visibility === 'private' && !isFollowing
                  ? 'Join this community to participate in discussions.'
                  : 'You do not have permission to post in this channel.'}
            </span>
          </div>
        )}

        {/* Posts Feed Section */}
        {loading ? (
          <div className="loading-state">Loading posts...</div>
        ) : error ? (
          <div className="empty-state" style={{ color: '#dc2626' }}>{error}</div>
        ) : !canViewChannelContent({ role: userRole }, currentChannel, isFollowing) ? (
          <div className="empty-state">
            <FiLock size={48} style={{ marginBottom: '16px', color: '#6b7280' }} />
            <h3>This is a private community</h3>
            <p>Request access or join to view discussions and posts.</p>
          </div>
        ) : (
          <PostList
            posts={posts}
            onLike={handleLikePost}
            onDelete={handleDeletePost}
          />
        )}
      </div>
    </Layout>
  );
};

export default ChannelPage;
