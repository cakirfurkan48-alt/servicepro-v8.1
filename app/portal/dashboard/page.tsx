'use client';

import { Icon } from '@/components/Icon';
import Link from 'next/link';

// Mock Data for Customer Portal
const MY_BOATS = [
    { id: 1, name: 'Marlin Bey', model: 'Bavaria C45', year: 2022, status: 'AtService' },
    { id: 2, name: 'Marlin Küçük', model: 'Zodiac Medline', year: 2021, status: 'Active' },
];

const ACTIVE_SERVICES = [
    {
        id: 'SRV-2024-001',
        boat: 'Marlin Bey',
        title: 'Motor Bakımı',
        status: 'pendingApproval', // pendingApproval, inProgress, completed
        statusLabel: 'Onay Bekliyor',
        date: '10 Ocak 2024',
        cost: 12500,
        technician: 'Ahmet Yılmaz'
    }
];

export default function PortalDashboardPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text mb-1">Hoş Geldiniz, Ali Bey 👋</h1>
                    <p className="text-text-muted">Teknelerinizin durumunu buradan takip edebilirsiniz.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-elevated border border-border rounded-xl font-medium transition-all text-sm">
                    <Icon name="user" size="sm" />
                    Profilim
                </button>
            </div>

            {/* My Boats Grid */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-text flex items-center gap-2">
                        <Icon name="boats" size="lg" className="text-primary" />
                        Teknelerim
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MY_BOATS.map(boat => (
                        <div key={boat.id} className="glass-card p-6 flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Icon name="boats" size="lg" weight="fill" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text text-lg">{boat.name}</h3>
                                    <p className="text-text-subtle text-sm">{boat.model} • {boat.year}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${boat.status === 'AtService'
                                    ? 'bg-warning/10 text-warning border border-warning/20'
                                    : 'bg-success/10 text-success border border-success/20'
                                }`}>
                                {boat.status === 'AtService' ? 'Serviste' : 'Denizde'}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Active Services / Estimates */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-text flex items-center gap-2">
                        <Icon name="lightning" size="lg" className="text-warning" />
                        Aktif İşlemler
                    </h2>
                    <span className="bg-warning/10 text-warning text-xs font-bold px-2 py-1 rounded-full">
                        {ACTIVE_SERVICES.length} İşlem
                    </span>
                </div>

                <div className="space-y-4">
                    {ACTIVE_SERVICES.map(service => (
                        <div key={service.id} className="glass-card p-6 border-l-4 border-l-warning">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
                                        <Icon name="calendar" size="xs" />
                                        {service.date}
                                        <span className="w-1 h-1 rounded-full bg-text-subtle"></span>
                                        {service.boat}
                                    </div>
                                    <h3 className="text-xl font-bold text-text">{service.title}</h3>
                                </div>
                                <div className="px-4 py-2 bg-warning/10 text-warning rounded-lg font-bold border border-warning/20 flex items-center gap-2 self-start md:self-auto">
                                    <Icon name="hourglass" size="md" />
                                    {service.statusLabel}
                                </div>
                            </div>

                            <div className="bg-surface/50 rounded-xl p-4 border border-border mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-text-muted">Tahmini Tutar</span>
                                    <span className="text-lg font-bold text-text">{service.cost.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-muted">Sorumlu Teknisyen</span>
                                    <span className="text-text font-medium">{service.technician}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-success hover:bg-success-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-success/20 flex items-center justify-center gap-2">
                                    <Icon name="checkCircle" size="md" />
                                    Onayla ve Başlat
                                </button>
                                <button className="px-6 py-3 bg-surface hover:bg-surface-elevated text-text border border-border rounded-xl font-bold transition-all">
                                    Detaylar
                                </button>
                            </div>
                        </div>
                    ))}

                    {ACTIVE_SERVICES.length === 0 && (
                        <div className="empty-state glass-card">
                            <div className="p-4 bg-surface-elevated rounded-full mb-3">
                                <Icon name="checkCircle" size="xl" className="text-success" />
                            </div>
                            <h3 className="text-lg font-medium text-text">Her şey yolunda!</h3>
                            <p className="text-text-muted">Şu anda onay bekleyen veya devam eden bir işlem yok.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
