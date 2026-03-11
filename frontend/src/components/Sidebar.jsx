const Sidebar = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <aside style={{
            width: '280px',
            flexShrink: 0,
            padding: '32px 0',
            position: 'sticky',
            top: '24px',
            height: 'calc(100vh - 48px)',
            overflowY: 'auto',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}>
            <div style={{ marginBottom: '32px', paddingLeft: '24px' }}>
                <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '8px', fontFamily: "'Outfit', sans-serif", fontWeight: '700' }}>Categories</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: '1.6' }}>
                    Discover communities based on your interests.
                </p>
            </div>

            <nav style={{ padding: '0 16px' }}>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            background: selectedCategory === cat.id ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
                            borderRadius: '12px',
                            border: selectedCategory === cat.id ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid transparent',
                            padding: '12px 16px',
                            marginBottom: '4px',
                            cursor: 'pointer',
                            color: selectedCategory === cat.id ? '#ffffff' : 'rgba(255,255,255,0.6)',
                            fontSize: '14px',
                            fontWeight: selectedCategory === cat.id ? '700' : '600',
                            textAlign: 'left',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedCategory !== cat.id) {
                                e.currentTarget.style.color = '#ffffff';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedCategory !== cat.id) {
                                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <span>{cat.name}</span>
                        {cat.count > 0 && (
                            <span style={{
                                background: selectedCategory === cat.id ? '#ec4899' : 'rgba(255,255,255,0.1)',
                                color: selectedCategory === cat.id ? '#fff' : 'rgba(255,255,255,0.8)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '700'
                            }}>{cat.count}</span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
