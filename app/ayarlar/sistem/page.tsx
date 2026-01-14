'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-context';

interface CompanyConfig {
    name: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
}

interface SystemConfig {
    company: CompanyConfig;
    version: string;
    lastBackup: string | null;
}

export default function SistemPage() {
    const { isAdmin } = useAdmin();
    const [system, setSystem] = useState<SystemConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [backingUp, setBackingUp] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await fetch('/api/config?section=system');
            const data = await res.json();
            setSystem(data);
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const saveConfig = async () => {
        if (!system) return;
        setSaving(true);
        try {
            await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ system }),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setSaving(false);
        }
    };

    const createBackup = async () => {
        setBackingUp(true);
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'backup' }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Yedekleme başarıyla oluşturuldu!');
                loadConfig();
            }
        } catch (error) {
            console.error('Backup failed:', error);
            alert('Yedekleme başarısız!');
        } finally {
            setBackingUp(false);
        }
    };

    const exportConfig = async () => {
        const res = await fetch('/api/config');
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `servicepro-config-${Date.now()}.json`;
        a.click();
    };

    const updateCompany = (key: keyof CompanyConfig, value: string) => {
        if (!system) return;
        setSystem({
            ...system,
            company: { ...system.company, [key]: value }
        });
    };

    if (!isAdmin) {
        return <div className="card">Yetkiniz yok.</div>;
    }

    if (!system) {
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
                    <h1 className="page-title">⚡ Sistem Ayarları</h1>
                </div>
                <button onClick={saveConfig} disabled={saving} className="btn btn-primary">
                    {saving ? '⏳ Kaydediliyor...' : saved ? '✅ Kaydedildi!' : '💾 Değişiklikleri Kaydet'}
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Company Info */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>🏢 Şirket Bilgileri</h3>

                    <div className="form-group">
                        <label className="form-label">Şirket Adı</label>
                        <input
                            type="text"
                            className="form-input"
                            value={system.company.name}
                            onChange={(e) => updateCompany('name', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Adres</label>
                        <textarea
                            className="form-textarea"
                            rows={2}
                            value={system.company.address}
                            onChange={(e) => updateCompany('address', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Telefon</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={system.company.phone}
                            onChange={(e) => updateCompany('phone', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">E-posta</label>
                        <input
                            type="email"
                            className="form-input"
                            value={system.company.email}
                            onChange={(e) => updateCompany('email', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">WhatsApp Numarası</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={system.company.whatsapp}
                            onChange={(e) => updateCompany('whatsapp', e.target.value)}
                            placeholder="+90 5XX XXX XX XX"
                        />
                    </div>
                </div>

                {/* System Info & Backup */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    {/* Version Info */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>ℹ️ Sistem Bilgisi</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                            <div style={{
                                padding: 'var(--space-lg)',
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>📦</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Versiyon</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                    v{system.version}
                                </div>
                            </div>
                            <div style={{
                                padding: 'var(--space-lg)',
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>💾</div>
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Son Yedekleme</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
                                    {system.lastBackup
                                        ? new Date(system.lastBackup).toLocaleString('tr-TR')
                                        : 'Henüz yok'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Backup & Export */}
                    <div className="card">
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>💾 Yedekleme & Dışa Aktarma</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <button
                                onClick={createBackup}
                                disabled={backingUp}
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                            >
                                {backingUp ? '⏳ Yedekleniyor...' : '💾 Yedekleme Oluştur'}
                            </button>

                            <button
                                onClick={exportConfig}
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                            >
                                📤 Ayarları Dışa Aktar (JSON)
                            </button>

                            <div style={{
                                padding: 'var(--space-md)',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid var(--color-warning)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8rem',
                                color: 'var(--color-warning)',
                            }}>
                                ⚠️ Yedekleme dosyaları <code>data/</code> klasöründe saklanır
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="card" style={{ borderColor: 'var(--color-error)' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-error)' }}>⚠️ Tehlikeli Bölge</h3>

                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)', fontSize: '0.85rem' }}>
                            Bu işlemler geri alınamaz!
                        </p>

                        <button
                            className="btn btn-secondary"
                            style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                            onClick={() => {
                                if (confirm('Tüm ayarları varsayılana sıfırlamak istediğinizden emin misiniz?')) {
                                    alert('Bu özellik henüz aktif değil.');
                                }
                            }}
                        >
                            🔄 Varsayılana Sıfırla
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
