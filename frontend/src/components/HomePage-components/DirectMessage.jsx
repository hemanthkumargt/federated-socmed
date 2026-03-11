import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { FiX, FiSend, FiUser, FiCheck, FiCheckSquare } from 'react-icons/fi';
import '../../styles/DirectMessage.css';
import { getApiBaseUrl } from '../../config/api';

const API_BASE_URL = getApiBaseUrl();
const SOCKET_URL = API_BASE_URL.replace("/api", "");

const DirectMessage = ({ onClose, initialTargetUser = null }) => {
    const [socket, setSocket] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Contacts and chats
    const [contacts, setContacts] = useState([]);
    const [activeChatUser, setActiveChatUser] = useState(initialTargetUser);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Typing indicator state
    const [isRemoteTyping, setIsRemoteTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);

            const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
            setSocket(newSocket);

            newSocket.emit('register', user._id);

            // Incoming messages
            newSocket.on('newMessage', (msg) => {
                setMessages((prev) => [...prev, msg]);
            });

            // Typing indicator from remote user
            newSocket.on('userTyping', ({ fromUserId }) => {
                setIsRemoteTyping(true);
            });

            newSocket.on('stopTyping', ({ fromUserId }) => {
                setIsRemoteTyping(false);
            });

            // Read receipt — clear unread badge
            newSocket.on('messagesRead', ({ byUserId }) => {
                setMessages(prev =>
                    prev.map(m =>
                        m.sender === (user._id || user.id) && m.receiver === byUserId
                            ? { ...m, read: true }
                            : m
                    )
                );
            });

            return () => newSocket.close();
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        if (activeChatUser) {
            fetchMessages(activeChatUser._id || activeChatUser.id);
        }
        setIsRemoteTyping(false);
    }, [activeChatUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isRemoteTyping]);

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/messages/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setContacts(res.data.users);
            }
        } catch (err) {
            console.error('Error fetching chat history users:', err);
        }
    };

    const fetchMessages = async (targetId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/messages/${targetId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setMessages(res.data.messages);
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length === 0) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            // Use the new /api/search/users endpoint which supports federation
            const res = await axios.get(`${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                const currentUserId = currentUser?._id || currentUser?.id;
                setSearchResults(res.data.users.filter(u => u._id !== currentUserId));
            }
        } catch (err) {
            // Fallback to old user search if new endpoint fails
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/user/search?q=${encodeURIComponent(query)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setSearchResults(res.data.users);
                }
            } catch (err2) {
                console.error('Search error:', err2);
            }
        }
    };

    const selectUser = (user) => {
        setActiveChatUser(user);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Typing indicator emission
    const emitTyping = useCallback(() => {
        if (!socket || !activeChatUser || !currentUser) return;

        const toUserId = activeChatUser._id || activeChatUser.id;
        const fromUserId = currentUser._id || currentUser.id;

        if (!isTypingRef.current) {
            isTypingRef.current = true;
            socket.emit('userTyping', { fromUserId, toUserId });
        }

        // Auto-stop after 2 seconds of inactivity
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            socket.emit('stopTyping', { fromUserId, toUserId });
        }, 2000);
    }, [socket, activeChatUser, currentUser]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChatUser) return;

        // Stop typing indicator
        if (socket && currentUser && activeChatUser) {
            const toUserId = activeChatUser._id || activeChatUser.id;
            const fromUserId = currentUser.id || currentUser._id;
            isTypingRef.current = false;
            socket.emit('stopTyping', { fromUserId, toUserId });
        }

        try {
            const token = localStorage.getItem('token');
            const targetId = activeChatUser.id || activeChatUser._id;

            const res = await axios.post(`${API_BASE_URL}/messages`, {
                receiverId: targetId,
                messageText: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setMessages(prev => [...prev, res.data.message]);
                setNewMessage('');

                if (!contacts.some(c => (c._id || c.id) === targetId)) {
                    setContacts(prev => [activeChatUser, ...prev]);
                }
            }
        } catch (err) {
            console.error('Error sending message:', err);
            alert("Delivery failed: Ensure the user is online or exists on the trusted server.");
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const getUserDisplayName = (user) => user?.displayName || user?.username || 'Unknown';

    return (
        <div className="dm-overlay">
            <div className="dm-container">

                {/* Left Panel: Contacts & Search */}
                <div className="dm-sidebar">
                    <div className="dm-header">
                        <h3>Messages</h3>
                        <button className="close-btn" onClick={onClose}><FiX size={20} /></button>
                    </div>

                    <div className="dm-search">
                        <input
                            type="text"
                            placeholder="Search users... or user@server"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map(user => (
                                    <div key={user._id || user.id} className="search-user-item" onClick={() => selectUser(user)}>
                                        <div className="user-avatar-sm avatar-initials">
                                            {getInitials(getUserDisplayName(user))}
                                        </div>
                                        <div>
                                            <span className="search-name">{getUserDisplayName(user)}</span>
                                            {user.serverName && (
                                                <span className="search-server"> @{user.serverName}</span>
                                            )}
                                            {user.isRemote && (
                                                <span className="remote-badge">🌐 Remote</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="dm-contacts">
                        {contacts.length === 0 && !searchQuery && (
                            <p className="no-contacts">No recent chats.</p>
                        )}
                        {contacts.map(user => (
                            <div
                                key={user._id || user.id}
                                className={`contact-item ${(activeChatUser?._id === user._id || activeChatUser?.id === user.id) ? 'active' : ''}`}
                                onClick={() => selectUser(user)}
                            >
                                <div className="user-avatar-sm avatar-initials">
                                    {getInitials(getUserDisplayName(user))}
                                </div>
                                <div className="contact-info">
                                    <span className="contact-name">{getUserDisplayName(user)}</span>
                                    {user.unreadCount > 0 && (
                                        <span className="unread-badge">{user.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Chat Area */}
                <div className="dm-chat-area">
                    {activeChatUser ? (
                        <>
                            <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div className="user-avatar-sm avatar-initials">
                                        {getInitials(getUserDisplayName(activeChatUser))}
                                    </div>
                                    <div>
                                        <strong>{getUserDisplayName(activeChatUser)}</strong>
                                        {activeChatUser.serverName && (
                                            <span className="server-tag"> @{activeChatUser.serverName}</span>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className="mute-btn" 
                                    onClick={() => {
                                        const mutes = JSON.parse(localStorage.getItem('mutedUsers') || '[]');
                                        const id = activeChatUser._id || activeChatUser.id || activeChatUser.federatedId;
                                        if (mutes.includes(id)) {
                                            localStorage.setItem('mutedUsers', JSON.stringify(mutes.filter(m => m !== id)));
                                            alert(`Unmuted ${getUserDisplayName(activeChatUser)}`);
                                        } else {
                                            localStorage.setItem('mutedUsers', JSON.stringify([...mutes, id]));
                                            alert(`Muted ${getUserDisplayName(activeChatUser)}`);
                                        }
                                    }}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#ffffff',
                                        padding: '6px 14px',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    {JSON.parse(localStorage.getItem('mutedUsers') || '[]').includes(activeChatUser._id || activeChatUser.id || activeChatUser.federatedId) ? 'Unmute' : 'Mute'}
                                </button>
                            </div>

                            <div className="chat-messages">
                                {loading ? <p className="loading-msg">Loading...</p> : null}

                                {messages.length === 0 && !loading && (
                                    <p className="empty-chat">No messages yet. Say hi! 👋</p>
                                )}

                                {messages.map((msg, idx) => {
                                    const isMine = msg.sender === (currentUser?._id || currentUser?.id)
                                        || msg.sender?._id === (currentUser?._id || currentUser?.id);
                                    return (
                                        <div key={idx} className={`message-bubble ${isMine ? 'mine' : 'theirs'}`}>
                                            <span className="bubble-text">{msg.message}</span>
                                            {isMine && (
                                                <span className="read-status" title={msg.read ? 'Read' : 'Sent'}>
                                                    {msg.read ? <FiCheckSquare size={12} color="#6366f1" /> : <FiCheck size={12} color="#9ca3af" />}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Typing Indicator */}
                                {isRemoteTyping && (
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                        <small>{getUserDisplayName(activeChatUser)} is typing...</small>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            <form className="chat-input-area" onSubmit={sendMessage}>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        emitTyping();
                                    }}
                                    placeholder="Type a message..."
                                />
                                <button type="submit" disabled={!newMessage.trim()} className="send-btn">
                                    <FiSend />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="empty-chat-area">
                            <FiUser size={48} color="#ccc" />
                            <p>Select a user to start messaging</p>
                            <small>Search for users above — even across servers!</small>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DirectMessage;
