'use client';

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
    const [activeTab, setActiveTab] = useState<'sidebar' | 'quicklinks'>('sidebar');
    const [menu, setMenu] = useState<{ sidebar: any[], quickLinks: any[] } | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setMenu({
            sidebar: [
                { id: 'dashboard', label: 'Dashboard', icon: 'squaresFour', href: '/dashboard' },
                { id: 'calendar', label: 'Takvim', icon: 'calendar', href: '/takvim' },
                { id: 'services', label: 'Servisler', icon: 'wrench', href: '/servis' },
                { id: 'boats', label: 'Tekneler', icon: 'boat', href: '/tekneler' },
                { id: 'personnel', label: 'Personel', icon: 'users', href: '/personel' },
            ],
            quickLinks: [] // Added missing property
        });
    }, []);

    const saveConfig = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // Helper functions mappings to satisfy usage
    const updateMenuItem = (id: string, updates: any) => {
        if (!menu) return;
        const newSidebar = menu.sidebar.map(item =>
            item.id === id ? { ...item, ...updates } : item
        );
        setMenu({ ...menu, sidebar: newSidebar });
    };

    const addQuickLink = () => {
        if (!menu) return;
        const newLink = { id: Date.now().toString(), label: 'Yeni Link', href: '/', icon: 'link' };
        setMenu({ ...menu, quickLinks: [...menu.quickLinks, newLink] });
    };

    const updateQuickLink = (id: string, updates: any) => {
        if (!menu) return;
        const newLinks = menu.quickLinks.map(link =>
            link.id === id ? { ...link, ...updates } : link
        );
        setMenu({ ...menu, quickLinks: newLinks });
    };

    const deleteQuickLink = (id: string) => {
        if (!menu) return;
        const newLinks = menu.quickLinks.filter(link => link.id !== id);
        setMenu({ ...menu, quickLinks: newLinks });
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        if (!menu) return;

        const newSidebar = [...menu.sidebar];
        const draggedItem = newSidebar[draggedIndex];
        newSidebar.splice(draggedIndex, 1);
        newSidebar.splice(index, 0, draggedItem);

        setMenu({ ...menu, sidebar: newSidebar });
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

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
