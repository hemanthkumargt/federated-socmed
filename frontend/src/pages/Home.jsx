import React, { useState, useEffect } from 'react';
import TimelineTabs from '../components/TimelineTabs';
import PostCreator from '../components/PostCreator';
import PostList from '../components/PostList';
import Layout from '../components/Layout';
import { getApiBaseUrl } from '../config/api';
import '../styles/Home.css';

function Home() {
  const API_BASE_URL = getApiBaseUrl();
  const [posts, setPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState('home');

  // fetch all local posts (for the "Local" tab)
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setPosts(data.posts);
      } else {
        setError(data.message || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // fetch personalised timeline (local + remote followed users & channels) for the "Home" tab
  const fetchFollowingPosts = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/posts/timeline`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setFollowingPosts(data.posts);
      }
    } catch (err) {
      console.error('Error fetching timeline posts:', err);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      // Use the advanced federated search endpoint
      const res = await fetch(`${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.users);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleFollow = async (federatedId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/user/${federatedId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
          fetchFollowingPosts();
          setIsSearching(false);
          setSearchQuery('');
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchFollowingPosts();
  }, []);

  const handleTimelineChange = (timeline) => {
    setActiveTimeline(timeline);
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setFollowingPosts([newPost, ...followingPosts]);
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
        const updateLike = post =>
          post.federatedId === postFederatedId
            ? { ...post, likeCount: data.likeCount, liked: data.liked }
            : post;
        setPosts(posts.map(updateLike));
        setFollowingPosts(followingPosts.map(updateLike));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
    setFollowingPosts(followingPosts.filter(p => p._id !== postId));
  };

  const getFilteredPosts = () => {
    const mutes = JSON.parse(localStorage.getItem('mutedUsers') || '[]');
    const filterMuted = (p) => !mutes.includes(p.authorFederatedId);

    switch (activeTimeline) {
      case 'home':
        return followingPosts.filter(filterMuted);
      case 'local':
        return posts.filter(filterMuted);
      default:
        return followingPosts.filter(filterMuted);
    }
  };

  return (
    <Layout>
      <div className="search-container">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search users to follow..." 
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        {isSearching && searchResults.length > 0 && (
          <div className="search-results-dropdown">
            {searchResults.map(user => (
              <div key={user._id} className="search-result-item">
                <div className="search-result-info">
                  <span className="search-result-name">{user.displayName}</span>
                  <span className="search-result-id">{user.federatedId}</span>
                </div>
                <button 
                  className="follow-btn-sm"
                  onClick={() => handleFollow(user.federatedId)}
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <TimelineTabs
        activeTimeline={activeTimeline}
        onTimelineChange={handleTimelineChange}
      />

      <PostCreator onPostCreated={handlePostCreated} />

      {loading ? (
        <div className="loading-state">Loading posts...</div>
      ) : error ? (
        <div className="empty-state" style={{ color: '#dc2626' }}>{error}</div>
      ) : (
        <PostList
          posts={getFilteredPosts()}
          onLike={handleLikePost}
          activeTimeline={activeTimeline}
          onDeletePost={handleDeletePost}
          onFollowChanged={fetchFollowingPosts}
        />
      )}
    </Layout>
  );
}

export default Home;