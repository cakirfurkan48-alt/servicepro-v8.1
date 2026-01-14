'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-context';

interface SystemStats {
    personnel: number;
    users: number;
    services: number;
    version: string;
}

export default function AyarlarPage() {
    const { isAdmin, user } = useAdmin();
    const [stats, setStats] = useState<SystemStats>({ personnel: 0, users: 0, services: 0, version: '8.0' });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [personnelRes, usersRes, servicesRes, configRes] = await Promise.all([
                fetch('/api/personnel'),
                fetch('/api/users'),
                fetch('/api/services'),
                fetch('/api/config?section=system'),
            ]);
            const [personnel, users, services, config] = await Promise.all([
                personnelRes.json(),
                usersRes.json(),
                servicesRes.json(),
                configRes.json(),
            ]);
            setStats({
                personnel: personnel.length,
                users: users.length,
                services: services.length,
                version: config.version || '8.0',
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    if (!isAdmin) {
        return (
            <div className="animate-fade-in">
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🔐</div>
                    <h2>Erişim Kısıtlı</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-md)' }}>
                        Bu sayfayı görüntülemek için admin yetkisi gereklidir.
                    </p>
                </div>
            </div>
        );
    }

    const settingsModules = [
        {
            href: '/ayarlar/gorunum',
            icon: '🎨',
            title: 'Görünüm Ayarları',
            description: 'Renk, font, tema, logo ve tasarım ayarları',
            color: '#ec4899',
        },
        {
            href: '/ayarlar/icerik',
            icon: '📝',
            title: 'İçerik Yönetimi',
            description: 'Konumlar, durumlar, iş türleri, unvanlar',
            color: '#8b5cf6',
        },
        {
            href: '/ayarlar/menu',
            icon: '📋',
            title: 'Menü Düzenleme',
            description: 'Sidebar menüsü, sıralama, hızlı linkler',
            color: '#06b6d4',
        },
        {
            href: '/ayarlar/kullanicilar',
            icon: '👥',
            title: 'Kullanıcı Yönetimi',
            description: 'Admin ve yetkili hesapları',
            color: '#10b981',
        },
        {
            href: '/personel',
            icon: '🔧',
            title: 'Personel Yönetimi',
            description: 'Teknisyen listesi ve ayarları',
            color: '#f59e0b',
        },
        {
            href: '/ayarlar/sistem',
            icon: '⚡',
            title: 'Sistem Ayarları',
            description: 'Şirket bilgileri, yedekleme, API',
            color: '#ef4444',
        },
    ];

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">⚙️ Yönetim Merkezi</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        WordPress benzeri uygulama ayarları
                    </p>
                </div>
                <div style={{
                    padding: 'var(--space-sm) var(--space-lg)',
                    background: 'var(--color-primary)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                }}>
                    👑 {user?.ad}
                </div>
            </header>

            {/* Settings Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-lg)',
                marginBottom: 'var(--space-xl)',
            }}>
                {settingsModules.map(module => (
                    <Link
                        key={module.href}
                        href={module.href}
                        style={{
                            display: 'block',
                            padding: 'var(--space-xl)',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = module.color;
                            e.currentTarget.style.boxShadow = `0 4px 24px ${module.color}20`;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: `${module.color}20`,
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            marginBottom: 'var(--space-md)',
                        }}>
                            {module.icon}
                        </div>
                        <h3 style={{ color: 'var(--color-text)', marginBottom: 'var(--space-xs)', fontSize: '1rem' }}>
                            {module.title}
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: 0 }}>
                            {module.description}
                        </p>
                    </Link>
                ))}
            </div>

            {/* System Stats */}
            <div className="card">
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>📊 Sistem Durumu</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--space-lg)',
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-lg)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                            {stats.personnel}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Personel</div>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-lg)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)' }}>
                            {stats.users}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Yetkili</div>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-lg)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-warning)' }}>
                            {stats.services}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Servis</div>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-lg)',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-info)' }}>
                            v{stats.version}
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Versiyon</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
