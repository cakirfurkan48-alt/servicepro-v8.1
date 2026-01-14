'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import RecentServices from '@/components/RecentServices';
import QuickActions from '@/components/QuickActions';
import TopPerformers from '@/components/TopPerformers';
import { fetchServices, fetchStats } from '@/lib/api';
import { Service } from '@/types';

export default function Dashboard() {
    const [stats, setStats] = useState({
        bugunServisleri: 0,
        devamEdenler: 0,
        parcaBekleyenler: 0,
        randevular: 0,
        tamamlananlar: 0,
        toplamServis: 0,
        aktifPersonel: 0,
    });
    const [recentServices, setRecentServices] = useState<Service[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const s = await fetchStats();
                setStats(s);

                const data = await fetchServices();
                setRecentServices(data.slice(0, 5));
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        }
        loadData();
    }, []);

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Hoş geldiniz! İşte günlük özetiniz.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <Link href="/raporlar/whatsapp" className="btn btn-secondary">
                        📤 WhatsApp Rapor
                    </Link>
                    <Link href="/planlama/yeni" className="btn btn-primary">
                        ➕ Yeni Servis
                    </Link>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: 'var(--space-xl)' }}>
                <StatCard
                    icon="📅"
                    value={stats.bugunServisleri}
                    label="Bugünkü Servisler"
                    color="var(--color-primary)"
                />
                <StatCard
                    icon="🔄"
                    value={stats.devamEdenler}
                    label="Devam Eden İşler"
                    color="var(--color-success)"
                />
                <StatCard
                    icon="📦"
                    value={stats.parcaBekleyenler + stats.randevular}
                    label="Bu Ay Tamamlanan"
                    color="var(--color-warning)"
                />
                <StatCard
                    icon="⭐"
                    value="4.7/5"
                    label="Aylık Ortalama Puan"
                    color="var(--color-accent-gold)"
                />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Today's Services */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h2 className="card-title">Bugünkü Servisler</h2>
                        <Link href="/planlama" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.85rem' }}>
                            Tümünü Gör →
                        </Link>
                    </div>
                    <RecentServices services={recentServices} />
                </div>

                {/* Quick Actions & Top Performers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <QuickActions />
                    <TopPerformers />
                </div>
            </div>
        </div>
    );
}
