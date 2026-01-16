'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import RecentServices from '@/components/RecentServices';
import QuickActions from '@/components/QuickActions';
import TopPerformers from '@/components/TopPerformers';
import DashboardCharts from '@/components/DashboardCharts';
import ActivityFeed from '@/components/ActivityFeed';
import { Button } from '@/components/ui/button';
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const s = await fetchStats();
                setStats(s);

                const data = await fetchServices();
                setRecentServices(data.slice(0, 5));
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Hoş geldiniz! İşte günlük özetiniz.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/raporlar/whatsapp">
                        <Button variant="secondary">📤 WhatsApp Rapor</Button>
                    </Link>
                    <Link href="/planlama/yeni">
                        <Button>➕ Yeni Servis</Button>
                    </Link>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                        📅
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-foreground">
                            {isLoading ? '...' : stats.bugunServisleri}
                        </div>
                        <div className="text-sm text-muted-foreground">Bugünkü Servisler</div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">
                        🔄
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-foreground">
                            {isLoading ? '...' : stats.devamEdenler}
                        </div>
                        <div className="text-sm text-muted-foreground">Devam Eden İşler</div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">
                        📦
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-foreground">
                            {isLoading ? '...' : stats.parcaBekleyenler}
                        </div>
                        <div className="text-sm text-muted-foreground">Parça Bekleyenler</div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl">
                        ✅
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-foreground">
                            {isLoading ? '...' : stats.tamamlananlar}
                        </div>
                        <div className="text-sm text-muted-foreground">Bu Ay Tamamlanan</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <DashboardCharts />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Services - Takes 2 columns */}
                <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-foreground flex items-center gap-2">
                            🛥️ Bugünkü Servisler
                        </h2>
                        <Link
                            href="/planlama"
                            className="text-sm text-primary hover:underline"
                        >
                            Tümünü Gör →
                        </Link>
                    </div>
                    <RecentServices services={recentServices} />
                </div>

                {/* Activity Feed - Takes 1 column */}
                <ActivityFeed />
            </div>

            {/* Quick Actions + Top Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        ⚡ Hızlı İşlemler
                    </h2>
                    <QuickActions />
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        ⭐ Bu Ayın Yıldızları
                    </h2>
                    <TopPerformers />
                </div>
            </div>
        </div>
    );
}
