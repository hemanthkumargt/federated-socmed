import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { getApiBaseUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const API_BASE_URL = getApiBaseUrl();
    const navigate = useNavigate();

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
            const res = await fetch(`${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.users);
            }
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const handleResultClick = (federatedId) => {
        navigate(`/user/${federatedId}`);
        setSearchQuery('');
        setIsSearching(false);
    };

    return (
        <header className="global-header">
            <div className="global-search-container">
                <FiSearch className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search the Connect Network..." 
                    value={searchQuery}
                    onChange={handleSearch}
                />
                
                {isSearching && searchQuery.length >= 2 && (
                    <div className="global-search-results">
                        {searchResults.length > 0 ? (
                            searchResults.map(user => (
                                <div 
                                    key={user._id} 
                                    className="global-search-item"
                                    onClick={() => handleResultClick(user.federatedId)}
                                >
                                    <div className="search-info">
                                        <span className="search-name">{user.displayName}</span>
                                        <span className="search-id">{user.federatedId}</span>
                                    </div>
                                    {user.isFollowing && <span className="following-tag">Following</span>}
                                </div>
                            ))
                        ) : (
                            <div className="no-results">No realms or players found</div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
