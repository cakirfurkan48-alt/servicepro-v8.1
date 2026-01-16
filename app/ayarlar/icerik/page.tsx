'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-context';
import IconPicker from '@/components/cms/IconPicker';
import { Icon } from '@/components/Icon';

interface Location {
    id: string;
    label: string;
    color: string;
    icon: string;
}

interface Status {
    id: string;
    label: string;
    color: string;
    icon: string;
}

interface ServiceType {
    id: string;
    label: string;
    multiplier: number;
}

interface PersonnelTitle {
    id: string;
    label: string;
    level: number;
}

interface ContentConfig {
    locations: Location[];
    statuses: Status[];
    serviceTypes: ServiceType[];
    personnelTitles: PersonnelTitle[];
}

export default function IcerikPage() {
    const { isAdmin } = useAdmin();
    const [content, setContent] = useState<ContentConfig | null>(null);
    const [activeTab, setActiveTab] = useState<'locations' | 'statuses' | 'serviceTypes' | 'titles'>('locations');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [editingItem, setEditingItem] = useState<string | null>(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await fetch('/api/config?section=content');
            const data = await res.json();
            setContent(data);
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const saveConfig = async () => {
        if (!content) return;
        setSaving(true);
        try {
            await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setSaving(false);
        }
    };

    const addLocation = () => {
        if (!content) return;
        const newId = `loc_${Date.now()}`;
        setContent({
            ...content,
            locations: [...content.locations, { id: newId, label: 'Yeni Konum', color: '#0ea5e9', icon: 'MapPin' }]
        });
        setEditingItem(newId);
    };

    const updateLocation = (id: string, updates: Partial<Location>) => {
        if (!content) return;
        setContent({
            ...content,
            locations: content.locations.map(l => l.id === id ? { ...l, ...updates } : l)
        });
    };

    const deleteLocation = (id: string) => {
        if (!content) return;
        setContent({
            ...content,
            locations: content.locations.filter(l => l.id !== id)
        });
    };

    const addStatus = () => {
        if (!content) return;
        const newId = `status_${Date.now()}`;
        setContent({
            ...content,
            statuses: [...content.statuses, { id: newId, label: 'Yeni Durum', color: '#6366f1', icon: 'ClipboardText' }]
        });
        setEditingItem(newId);
    };

    const updateStatus = (id: string, updates: Partial<Status>) => {
        if (!content) return;
        setContent({
            ...content,
            statuses: content.statuses.map(s => s.id === id ? { ...s, ...updates } : s)
        });
    };

    const deleteStatus = (id: string) => {
        if (!content) return;
        setContent({
            ...content,
            statuses: content.statuses.filter(s => s.id !== id)
        });
    };

    if (!isAdmin) {
        return <div className="card">Yetkiniz yok.</div>;
    }

    if (!content) {
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
                    <h1 className="page-title">📝 İçerik Yönetimi</h1>
                </div>
                <button onClick={saveConfig} disabled={saving} className="btn btn-primary">
                    {saving ? '⏳ Kaydediliyor...' : saved ? '✅ Kaydedildi!' : '💾 Değişiklikleri Kaydet'}
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-lg)' }}>
                {/* Sidebar Tabs */}
                <div className="card" style={{ padding: 'var(--space-sm)' }}>
                    {[
                        { id: 'locations', label: '📍 Konumlar' },
                        { id: 'statuses', label: '📊 Durumlar' },
                        { id: 'serviceTypes', label: '🔧 İş Türleri' },
                        { id: 'titles', label: '👤 Unvanlar' },
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
                    {activeTab === 'locations' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h3>📍 Konum Listesi</h3>
                                <button onClick={addLocation} className="btn btn-success">➕ Yeni Konum</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {content.locations.map(loc => (
                                    <div key={loc.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-md)',
                                        padding: 'var(--space-md)',
                                        background: 'var(--color-bg)',
                                        borderRadius: 'var(--radius-md)',
                                        border: editingItem === loc.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    }}>
                                        <IconPicker
                                            value={loc.icon}
                                            onChange={(val) => updateLocation(loc.id, { icon: val })}
                                        />

                                        <input
                                            type="text"
                                            className="form-input"
                                            value={loc.label}
                                            onChange={(e) => updateLocation(loc.id, { label: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="color"
                                            value={loc.color}
                                            onChange={(e) => updateLocation(loc.id, { color: e.target.value })}
                                            style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                                        />
                                        <button
                                            onClick={() => deleteLocation(loc.id)}
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

                    {activeTab === 'statuses' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                                <h3>📊 Durum Tanımları</h3>
                                <button onClick={addStatus} className="btn btn-success">➕ Yeni Durum</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                                {content.statuses.map(status => (
                                    <div key={status.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-md)',
                                        padding: 'var(--space-md)',
                                        background: 'var(--color-bg)',
                                        borderRadius: 'var(--radius-md)',
                                    }}>
                                        <IconPicker
                                            value={status.icon}
                                            onChange={(val) => updateStatus(status.id, { icon: val })}
                                        />

                                        <input
                                            type="text"
                                            className="form-input"
                                            value={status.label}
                                            onChange={(e) => updateStatus(status.id, { label: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            type="color"
                                            value={status.color}
                                            onChange={(e) => updateStatus(status.id, { color: e.target.value })}
                                            style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }}
                                        />
                                        <div style={{
                                            padding: '4px 12px',
                                            background: status.color,
                                            color: 'white',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Icon name={status.icon as any} size="sm" color="white" />
                                            {status.label}
                                        </div>
                                        <button
                                            onClick={() => deleteStatus(status.id)}
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

                    {activeTab === 'serviceTypes' && (
                        <div>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>🔧 İş Türleri</h3>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
                                İş türleri ve puanlama çarpanları
                            </p>

                            {content.serviceTypes.map(type => (
                                <div key={type.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                    padding: 'var(--space-md)',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-sm)',
                                }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={type.label}
                                        onChange={(e) => setContent({
                                            ...content,
                                            serviceTypes: content.serviceTypes.map(t => t.id === type.id ? { ...t, label: e.target.value } : t)
                                        })}
                                        style={{ flex: 1 }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Çarpan:</span>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0.5"
                                            max="5"
                                            value={type.multiplier}
                                            onChange={(e) => setContent({
                                                ...content,
                                                serviceTypes: content.serviceTypes.map(t => t.id === type.id ? { ...t, multiplier: parseFloat(e.target.value) } : t)
                                            })}
                                            className="form-input"
                                            style={{ width: '80px' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'titles' && (
                        <div>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>👤 Personel Unvanları</h3>

                            {content.personnelTitles.map(title => (
                                <div key={title.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                    padding: 'var(--space-md)',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-sm)',
                                }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={title.label}
                                        onChange={(e) => setContent({
                                            ...content,
                                            personnelTitles: content.personnelTitles.map(t => t.id === title.id ? { ...t, label: e.target.value } : t)
                                        })}
                                        style={{ flex: 1 }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Seviye:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={title.level}
                                            onChange={(e) => setContent({
                                                ...content,
                                                personnelTitles: content.personnelTitles.map(t => t.id === title.id ? { ...t, level: parseInt(e.target.value) } : t)
                                            })}
                                            className="form-input"
                                            style={{ width: '60px' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
