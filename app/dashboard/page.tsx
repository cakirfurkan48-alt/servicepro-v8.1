'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useServices, usePersonnel, useConfig } from '@/lib/hooks';
import { Icon } from '@/components/Icon';

// --- Skeleton Components ---
const DashboardSkeleton = () => (
    <div className="dashboard animate-fade-in">
        <div className="flex justify-between items-center mb-lg">
            <div>
                <div className="skeleton skeleton-title" style={{ width: '200px' }} />
                <div className="skeleton skeleton-text" style={{ width: '300px' }} />
            </div>
            <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: 'var(--radius-md)' }} />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-lg">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton skeleton-card" style={{ height: '140px' }} />
            ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="skeleton skeleton-card" style={{ gridColumn: 'span 2', height: '400px' }} />
            <div className="skeleton skeleton-card" style={{ height: '400px' }} />
        </div>
    </div>
);

export default function DashboardPage() {
    // Parallel data fetching hook usage
    // Note: These hooks handle their own useEffects internally, 
    // effectively running in parallel on mount.
    const { services, loading: servicesLoading } = useServices();
    const { personnel, loading: personnelLoading } = usePersonnel();
    const { config, loading: configLoading } = useConfig();

    const isLoading = servicesLoading || personnelLoading || configLoading;

    // Derived State Calculation
    const stats = {
        total: services.length,
        pending: services.filter(s => s.status === 'RANDEVU_VERILDI' || s.status === 'DEVAM_EDIYOR').length,
        completedMonth: services.filter(s => {
            const d = new Date(s.scheduledDate);
            const now = new Date();
            return s.status === 'TAMAMLANDI' &&
                d.getMonth() === now.getMonth() &&
                d.getFullYear() === now.getFullYear();
        }).length,
        todayServices: services.filter(s =>
            s.scheduledDate === new Date().toISOString().split('T')[0]
        )
    };

    if (isLoading) return <DashboardSkeleton />;

    return (
        <div className="dashboard animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-xl">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 mb-1">
                        <span className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Icon name="waves" size="lg" />
                        </span>
                        <span className="text-gradient">ServicePRO Dashboard</span>
                    </h1>
                    <p className="text-muted text-lg">
                        Hoş geldiniz 👋 İşte bugünkü servis operasyon özeti.
                    </p>
                </div>
                <Link
                    href="/planlama/yeni"
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition-all hover:translate-y-[-2px] shadow-lg shadow-primary/25 font-medium"
                >
                    <Icon name="plus" size="md" />
                    Yeni Servis Oluştur
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-xl">
                <div className="stat-card hover-glow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <Icon name="chartPieSlice" size="lg" />
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                            <Icon name="trendUp" size="sm" /> 12%
                        </span>
                    </div>
                    <div className="stat-value text-4xl mb-1">{stats.total}</div>
                    <div className="stat-label">Toplam Servis Kaydı</div>
                </div>

                <div className="stat-card hover-glow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                            <Icon name="hourglass" size="lg" />
                        </div>
                    </div>
                    <div className="stat-value text-4xl mb-1 text-warning">{stats.pending}</div>
                    <div className="stat-label">Bekleyen & Devam Eden</div>
                </div>

                <div className="stat-card hover-glow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                            <Icon name="checkCircle" size="lg" />
                        </div>
                    </div>
                    <div className="stat-value text-4xl mb-1 text-success">{stats.completedMonth}</div>
                    <div className="stat-label">Bu Ay Tamamlanan</div>
                </div>

                <div className="stat-card hover-glow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
                            <Icon name="personnel" size="lg" />
                        </div>
                    </div>
                    <div className="stat-value text-4xl mb-1">{personnel.length}</div>
                    <div className="stat-label">Aktif Personel</div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-xl">
                {/* Today's Schedule (2/3 width) */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Icon name="calendar" size="lg" className="text-primary" />
                            Bugünkü Program
                        </h3>
                        <Link href="/takvim" className="text-sm text-primary hover:underline font-medium">
                            Tüm Takvimi Gör →
                        </Link>
                    </div>

                    {stats.todayServices.length === 0 ? (
                        <div className="empty-state py-12">
                            <div className="p-6 bg-surface-elevated rounded-full mb-4">
                                <Icon name="coffee" size="2xl" className="text-subtle" />
                            </div>
                            <h4 className="text-lg font-medium text-text mb-2">Bugün için plan yok</h4>
                            <p className="text-muted max-w-xs mx-auto">
                                Şu an için bugün planlanmış bir servis görünmüyor. Yeni bir servis ekleyebilir veya takvimi kontrol edebilirsiniz.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {stats.todayServices.slice(0, 4).map(service => (
                                <Link
                                    key={service.id}
                                    href={`/planlama/${service.id}`}
                                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface hover:bg-surface-elevated border border-border rounded-xl transition-all hover:translate-x-1"
                                >
                                    <div className="flex items-start gap-4 mb-3 md:mb-0">
                                        <div
                                            className="w-3 h-3 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                                            style={{ backgroundColor: service.statusColor, boxShadow: `0 0 10px ${service.statusColor}` }}
                                        />
                                        <div>
                                            <div className="font-bold text-lg group-hover:text-primary transition-colors">
                                                {service.boatName}
                                            </div>
                                            <div className="text-sm text-muted flex items-center gap-3 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Icon name="clock" size="sm" />
                                                    {service.scheduledTime || 'Belirtilmedi'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Icon name="mapPin" size="sm" />
                                                    {service.locationLabel}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Avatar stack placeholder if we had personnel images */}
                                        <div className="hidden md:flex -space-x-2">
                                            {[1, 2].map(p => (
                                                <div key={p} className="w-8 h-8 rounded-full bg-surface-elevated border-2 border-surface flex items-center justify-center text-xs font-bold text-muted">
                                                    <Icon name="user" size="sm" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold bg-[${service.statusColor}]/10`} style={{ color: service.statusColor, backgroundColor: `${service.statusColor}20` }}>
                                            {service.statusLabel}
                                        </div>
                                        <Icon name="caretRight" size="md" className="text-muted group-hover:text-primary pl-2" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Activity & Quick Actions (1/3 width) */}
                <div className="space-y-6">
                    {/* Quick Launchpad */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Icon name="lightning" size="lg" className="text-warning" />
                            Hızlı Erişim
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/planlama" className="flex flex-col items-center justify-center p-4 bg-surface hover:bg-surface-elevated rounded-xl border border-border transition-all hover:-translate-y-1 group">
                                <Icon name="clipboardText" size="xl" className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Planlama</span>
                            </Link>
                            <Link href="/takvim" className="flex flex-col items-center justify-center p-4 bg-surface hover:bg-surface-elevated rounded-xl border border-border transition-all hover:-translate-y-1 group">
                                <Icon name="calendar" size="xl" className="text-info mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Takvim</span>
                            </Link>
                            <Link href="/marlin" className="flex flex-col items-center justify-center p-4 bg-surface hover:bg-surface-elevated rounded-xl border border-border transition-all hover:-translate-y-1 group">
                                <Icon name="star" size="xl" className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Yıldızım</span>
                            </Link>
                            <Link href="/ayarlar" className="flex flex-col items-center justify-center p-4 bg-surface hover:bg-surface-elevated rounded-xl border border-border transition-all hover:-translate-y-1 group">
                                <Icon name="settings" size="xl" className="text-subtle mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium">Ayarlar</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Activity Mini-Feed */}
                    <div className="glass-card p-6 flex flex-col h-[300px]">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Icon name="bell" size="lg" className="text-info" />
                            Son Aktiviteler
                        </h3>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="relative border-l border-border ml-3 space-y-6 pl-6 pb-2">
                                {services.slice(0, 5).map((service, idx) => (
                                    <div key={idx} className="relative">
                                        <span
                                            className="absolute -left-[29px] top-1 w-3 h-3 rounded-full border-2 border-surface"
                                            style={{ backgroundColor: service.statusColor }}
                                        />
                                        <div className="text-sm font-medium mb-1">{service.boatName}</div>
                                        <div className="text-xs text-muted mb-1 flex items-center gap-1">
                                            {service.statusLabel}
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            {new Date(service.scheduledDate).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
