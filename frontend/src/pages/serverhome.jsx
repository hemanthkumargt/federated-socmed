import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import ServerHeader from '../components/ServerHeader';
import ServerList from '../components/ServerList';
import { servers as staticServers, categories as initialCategories } from '../data/data';

const pageStyles = {
    '--bg-main': '#17171c',
    '--bg-card': 'rgba(255,255,255,0.05)',
    '--card-bg': '#1e1e24',
    '--text-main': '#ffffff',
    '--text-muted': 'rgba(255,255,255,0.6)',
    '--primary': '#5865f2',
    '--primary-hover': '#4752c4',
    '--radius': '12px',
    '--border-color': 'rgba(255,255,255,0.1)',
    '--shadow-md': '0 8px 24px rgba(0,0,0,0.3)',
    background: '#17171c',
    minHeight: '100vh',
    color: '#ffffff',
};

function Home() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [dynamicServers, setDynamicServers] = useState([]);

    useEffect(() => {
        const fetchServers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/servers');
                if (res.data && res.data.servers) {
                    const mappedServers = res.data.servers.map(server => ({
                        id: server._id,
                        name: server.name,
                        category: server.category || 'general',
                        description: server.description,
                        enabled: server.isActive !== false,
                        users: 'Dynamic',
                        image: null,
                        url: server.url
                    }));
                    setDynamicServers(mappedServers);
                }
            } catch (err) {
                console.error("Failed to load real-time servers", err);
            }
        };
        fetchServers();
    }, []);

    const combinedServers = useMemo(() => {
        return [...dynamicServers, ...staticServers];
    }, [dynamicServers]);

    // Calculate counts dynamically based on combined servers list
    const categoriesWithCounts = useMemo(() => {
        return initialCategories.map(cat => {
            let count = 0;
            if (cat.id === 'all') {
                count = combinedServers.length;
            } else {
                count = combinedServers.filter(s => s.category.toLowerCase() === cat.id.toLowerCase()).length;
            }
            return { ...cat, count };
        });
    }, [combinedServers]);

    const filteredServers = selectedCategory === 'all'
        ? combinedServers
        : combinedServers.filter(server => server.category.toLowerCase() === selectedCategory.toLowerCase());

    return (
        <div style={pageStyles}>
            <div style={{ display: 'flex', minHeight: '100vh', maxWidth: '1400px', margin: '0 auto' }}>
                <Sidebar
                    categories={categoriesWithCounts}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                <main style={{ flex: 1, padding: '48px 64px' }}>
                    <ServerHeader />
                    <ServerList servers={filteredServers} />
                </main>
            </div>
        </div>
    );
}

export default Home;

