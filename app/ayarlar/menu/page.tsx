'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-context';

interface MenuItem {
    id: string;
    href: string;
    label: string;
    icon: string;
    visible: boolean;
    adminOnly: boolean;
}

interface QuickLink {
    id: string;
    href: string;
    label: string;
    icon: string;
}

interface MenuConfig {
    sidebar: MenuItem[];
    quickLinks: QuickLink[];
}

const emojiList = ['📊', '📅', '👥', '⭐', '🏆', '📝', '📤', '⚙️', '🔧', '📍', '📦', '🎨', '💾', '🔐', '📋', '🏠', '➕'];

export default function MenuPage() {
    const { isAdmin } = useAdmin();
    const [menu, setMenu] = useState<MenuConfig | null>(null);
    const [activeTab, setActiveTab] = useState<'sidebar' | 'quicklinks'>('sidebar');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await fetch('/api/config?section=menu');
            const data = await res.json();
            setMenu(data);
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const saveConfig = async () => {
        if (!menu) return;
        setSaving(true);
        try {
            await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ menu }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const items = [...menu!.sidebar];
        const draggedItem = items[draggedIndex];
        items.splice(draggedIndex, 1);
        items.splice(index, 0, draggedItem);

        setMenu({ ...menu!, sidebar: items });
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
        if (!menu) return;
        setMenu({
            ...menu,
            sidebar: menu.sidebar.map(item => item.id === id ? { ...item, ...updates } : item)
        });
    };

    const addQuickLink = () => {
        if (!menu) return;
        setMenu({
            ...menu,
            quickLinks: [...menu.quickLinks, {
                id: `link_${Date.now()}`,
                href: '/',
                label: 'Yeni Link',
                icon: '🔗'
            }]
        });
    };

    const updateQuickLink = (id: string, updates: Partial<QuickLink>) => {
        if (!menu) return;
        setMenu({
            ...menu,
            quickLinks: menu.quickLinks.map(link => link.id === id ? { ...link, ...updates } : link)
        });
    };

    const deleteQuickLink = (id: string) => {
        if (!menu) return;
        setMenu({
            ...menu,
            quickLinks: menu.quickLinks.filter(link => link.id !== id)
        });
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
                                Menü öğelerini sürükleyerek sıralayabilirsiniz
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
                                        }}
                                    >
                                        <span style={{ color: 'var(--color-text-muted)' }}>⠿</span>

                                        <select
                                            value={item.icon}
                                            onChange={(e) => updateMenuItem(item.id, { icon: e.target.value })}
                                            style={{ width: '50px', fontSize: '1.1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                        >
                                            {emojiList.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>

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
                                    }}>
                                        <select
                                            value={link.icon}
                                            onChange={(e) => updateQuickLink(link.id, { icon: e.target.value })}
                                            style={{ width: '50px', fontSize: '1.1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                        >
                                            {emojiList.map(e => <option key={e} value={e}>{e}</option>)}
                                        </select>

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
