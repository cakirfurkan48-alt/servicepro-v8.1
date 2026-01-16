import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-context';
import IconPicker from '@/components/cms/IconPicker';
import { Icon } from '@/components/Icon';

// ... (interfaces remain same)

// Remove emojiList since we are using Phosphor icons now
// const emojiList = ... 

export default function MenuPage() {
    const { isAdmin } = useAdmin();
    // ... (state remains same)

    // ... (loadConfig, saveConfig, dragHandlers remain same)

    // ... (update functions remain same)

    if (!isAdmin) {
        return <div className="card">Yetkiniz yok.</div>;
    }

    if (!menu) {
        return <div className="card">Yükleniyor...</div>;
    }

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                        <Link href="/ayarlar" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>⚙️ Ayarlar</Link>
                        <span style={{ color: 'var(--color-text-subtle)' }}>/</span>
                    </div>
                    <h1 className="page-title">📋 Menü Düzenleme</h1>
                </div>
                <button onClick={saveConfig} disabled={saving} className="btn btn-primary">
                    {saving ? '⏳ Kaydediliyor...' : saved ? '✅ Kaydedildi!' : '💾 Değişiklikleri Kaydet'}
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-lg)' }}>
                {/* Sidebar Tabs */}
                <div className="card" style={{ padding: 'var(--space-sm)' }}>
                    {[
                        { id: 'sidebar', label: '📋 Sidebar Menüsü' },
                        { id: 'quicklinks', label: '⚡ Hızlı Linkler' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: 'var(--space-md)',
                                textAlign: 'left',
                                background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--color-text)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                marginBottom: 'var(--space-xs)',
                                fontSize: '0.9rem',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="card">
                    {activeTab === 'sidebar' && (
                        <div>
                            <h3 style={{ marginBottom: 'var(--space-md)' }}>📋 Sidebar Menü Sıralaması</h3>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)', fontSize: '0.85rem' }}>
                                Menü öğelerini sürükleyerek sıralayabilirsiniz. İkonlara tıklayarak değiştirebilirsiniz.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {menu.sidebar.map((item, index) => (
                                    <div
                                        key={item.id}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-md)',
                                            padding: 'var(--space-md)',
                                            background: draggedIndex === index ? 'var(--color-primary)' : 'var(--color-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'grab',
                                            opacity: draggedIndex === index ? 0.7 : 1,
                                            border: '1px solid var(--color-border)',
                                        }}
                                    >
                                        <span style={{ color: 'var(--color-text-muted)' }}>⠿</span>

                                        <IconPicker
                                            value={item.icon}
                                            onChange={(val) => updateMenuItem(item.id, { icon: val })}
                                        />

                                        <input
                                            type="text"
                                            className="form-input"
                                            value={item.label}
                                            onChange={(e) => updateMenuItem(item.id, { label: e.target.value })}
                                            style={{ flex: 1 }}
                                        />

                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={item.visible}
                                                onChange={(e) => updateMenuItem(item.id, { visible: e.target.checked })}
                                            />
                                            Görünür
                                        </label>

                                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={item.adminOnly}
                                                onChange={(e) => updateMenuItem(item.id, { adminOnly: e.target.checked })}
                                            />
                                            Sadece Admin
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'quicklinks' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h3>⚡ Dashboard Hızlı Linkler</h3>
                                <button onClick={addQuickLink} className="btn btn-success">➕ Yeni Link</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {menu.quickLinks.map(link => (
                                    <div key={link.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-md)',
                                        padding: 'var(--space-md)',
                                        background: 'var(--color-bg)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)',
                                    }}>
                                        <IconPicker
                                            value={link.icon}
                                            onChange={(val) => updateQuickLink(link.id, { icon: val })}
                                        />

                                        <input
                                            type="text"
                                            className="form-input"
                                            value={link.label}
                                            onChange={(e) => updateQuickLink(link.id, { label: e.target.value })}
                                            placeholder="Link adı"
                                            style={{ flex: 1 }}
                                        />

                                        <input
                                            type="text"
                                            className="form-input"
                                            value={link.href}
                                            onChange={(e) => updateQuickLink(link.id, { href: e.target.value })}
                                            placeholder="/sayfa/yolu"
                                            style={{ width: '200px' }}
                                        />

                                        <button
                                            onClick={() => deleteQuickLink(link.id)}
                                            style={{ padding: 'var(--space-sm)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                                            title="Sil"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
