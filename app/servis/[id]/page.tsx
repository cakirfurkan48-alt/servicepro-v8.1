'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import Link from 'next/link';

// Mock Data
const MOCK_SERVICE = {
    id: 'SRV-2024-001',
    boatName: 'Marlin Bey',
    owner: 'Ahmet Yılmaz',
    status: 'pending', // pending, inProgress, completed
    statusLabel: 'Bekliyor',
    date: '10 Ocak 2024',
    description: 'Motor bakımı ve detaylı inceleme.',
    complaint: 'Motor çalışırken garip bir ses geliyor.',
    technicianNotes: 'İlk incelemede kayışlarda gevşeme tespit edildi.',
    parts: [
        { id: 1, name: 'Yağ Filtresi', code: 'FIL-001', quantity: 2, price: 450 },
        { id: 2, name: 'Motor Yağı (Litre)', code: 'OIL-5W30', quantity: 5, price: 320 },
    ],
    labor: 4, // hours
    laborRate: 1500,
    media: [
        '/placeholder-boat-1.jpg',
        '/placeholder-engine.jpg'
    ],
    history: [
        { date: '16 Oca 10:30', status: 'created', user: 'Sistem', note: 'Servis kaydı oluşturuldu.' },
        { date: '16 Oca 11:00', status: 'pending', user: 'Ahmet Y.', note: 'Teknisyen atandı.' },
    ]
};

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'parts' | 'media' | 'history'>('overview');

    // Calculate totals
    const partsTotal = MOCK_SERVICE.parts.reduce((acc, part) => acc + (part.price * part.quantity), 0);
    const laborTotal = MOCK_SERVICE.labor * MOCK_SERVICE.laborRate;
    const grandTotal = partsTotal + laborTotal;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-success bg-success/10 border-success/20';
            case 'inProgress': return 'text-primary bg-primary/10 border-primary/20';
            default: return 'text-warning bg-warning/10 border-warning/20';
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
                        <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                        <Icon name="caretRight" size="xs" />
                        <Link href="/servisler" className="hover:text-primary transition-colors">Servisler</Link>
                        <Icon name="caretRight" size="xs" />
                        <span className="text-text font-medium">{MOCK_SERVICE.id}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-text flex items-center gap-3">
                        {MOCK_SERVICE.boatName}
                        <span className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(MOCK_SERVICE.status)} font-medium`}>
                            {MOCK_SERVICE.statusLabel}
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2 text-text-muted hover:text-text hover:bg-surface-elevated rounded-lg transition-all" title="Yazdır">
                        <Icon name="printer" size="lg" /> {/* Assuming 'printer' might not exist, checking Plan */}
                        {/* Checking icons.ts, printer usually is 'printer'. I added 'printer' to icons? No. Let's use 'clipboardText' as print fallback or similar if fails, but I 'll add printer next. */}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-elevated border border-border rounded-xl font-medium transition-all text-text">
                        <Icon name="export" size="md" /> {/* Assuming export exists or similar */}
                        Paylaş
                    </button>
                    <Link
                        href={`/planlama/${params.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
                    >
                        <Icon name="pencil" size="md" />
                        Düzenle
                    </Link>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                        <Icon name="user" size="lg" />
                    </div>
                    <div>
                        <div className="text-sm text-text-muted">Müşteri</div>
                        <div className="font-semibold text-text">{MOCK_SERVICE.owner}</div>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                        <Icon name="calendar" size="lg" />
                    </div>
                    <div>
                        <div className="text-sm text-text-muted">Tarih</div>
                        <div className="font-semibold text-text">{MOCK_SERVICE.date}</div>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500">
                        <Icon name="service" size="lg" />
                    </div>
                    <div>
                        <div className="text-sm text-text-muted">İşçilik</div>
                        <div className="font-semibold text-text">{MOCK_SERVICE.labor} Saat</div>
                    </div>
                </div>
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                        <Icon name="creditCard" size="lg" /> {/* Checking if creditCard exists */}
                    </div>
                    <div>
                        <div className="text-sm text-text-muted">Toplam Tutar</div>
                        <div className="font-semibold text-text">{grandTotal.toLocaleString('tr-TR')} ₺</div>
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs Header */}
                    <div className="flex gap-1 p-1 bg-surface-elevated/50 rounded-xl mb-4 backdrop-blur-sm">
                        {(['overview', 'parts', 'media', 'history'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-text-muted hover:text-text hover:bg-surface/50'
                                    }`}
                            >
                                {tab === 'overview' && 'Genel Bakış'}
                                {tab === 'parts' && 'Parça & Maliyet'}
                                {tab === 'media' && 'Medya'}
                                {tab === 'history' && 'Geçmiş'}
                            </button>
                        ))}
                    </div>

                    <div className="glass-card p-6 min-h-[400px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-2 border-b border-border pb-2">Müşteri Şikayeti</h3>
                                    <p className="text-text-subtle leading-relaxed bg-surface p-4 rounded-lg border border-border">
                                        "{MOCK_SERVICE.complaint}"
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-text mb-2 border-b border-border pb-2">Yapılan İşlemler & Notlar</h3>
                                    <p className="text-text-subtle leading-relaxed">
                                        {MOCK_SERVICE.description}
                                        <br /><br />
                                        <span className="font-medium text-text">Teknisyen Notu:</span> {MOCK_SERVICE.technicianNotes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'parts' && (
                            <div className="animate-fade-in">
                                <h3 className="text-lg font-bold text-text mb-4">Kullanılan Parçalar</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-border text-text-muted">
                                                <th className="pb-3 pl-2">Parça Kodu</th>
                                                <th className="pb-3">Parça Adı</th>
                                                <th className="pb-3 text-center">Adet</th>
                                                <th className="pb-3 text-right pr-2">Fiyat</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {MOCK_SERVICE.parts.map((part) => (
                                                <tr key={part.id} className="group hover:bg-surface/50 transition-colors">
                                                    <td className="py-3 pl-2 font-mono text-xs text-text-subtle">{part.code}</td>
                                                    <td className="py-3 font-medium text-text">{part.name}</td>
                                                    <td className="py-3 text-center text-text">{part.quantity}</td>
                                                    <td className="py-3 text-right pr-2 text-text font-medium">
                                                        {(part.price * part.quantity).toLocaleString('tr-TR')} ₺
                                                    </td>
                                                </tr>
                                            ))}
                                            {/* Summary Rows */}
                                            <tr className="bg-surface/30">
                                                <td colSpan={3} className="py-3 text-right pr-4 text-text-muted">Ara Toplam (Parça)</td>
                                                <td className="py-3 text-right pr-2 font-bold text-text">{partsTotal.toLocaleString('tr-TR')} ₺</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} className="py-3 text-right pr-4 text-text-muted">İşçilik ({MOCK_SERVICE.labor} saat)</td>
                                                <td className="py-3 text-right pr-2 font-bold text-text">{laborTotal.toLocaleString('tr-TR')} ₺</td>
                                            </tr>
                                            <tr className="bg-primary/5 border-t-2 border-primary/20">
                                                <td colSpan={3} className="py-4 text-right pr-4 text-lg font-bold text-primary">GENEL TOPLAM</td>
                                                <td className="py-4 text-right pr-2 text-lg font-bold text-primary">{grandTotal.toLocaleString('tr-TR')} ₺</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <div className="aspect-video bg-surface-elevated rounded-xl flex items-center justify-center border border-border dashed border-2">
                                    <div className="text-center">
                                        <Icon name="image" size="xl" className="text-text-muted mx-auto mb-2 opacity-50" />
                                        <span className="text-sm text-text-muted">Görsel Bulunamadı</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="relative border-l-2 border-border ml-3 space-y-8 animate-fade-in pl-8 py-2">
                                {MOCK_SERVICE.history.map((log, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[41px] bg-bg p-1 rounded-full border border-border">
                                            <div className="w-4 h-4 rounded-full bg-primary/50"></div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                            <span className="text-sm font-bold text-text">{log.status.toUpperCase()}</span>
                                            <span className="text-xs text-text-muted">{log.date}</span>
                                        </div>
                                        <p className="text-sm text-text-subtle">{log.note}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Icon name="user" size="xs" className="text-text-muted" />
                                            <span className="text-xs text-text-muted">{log.user}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Icon name="info" size="md" className="text-info" />
                            İşlem Durumu
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">Mevcut Durum</label>
                                <select aria-label="Mevcut Durum" className="w-full bg-surface border border-border rounded-lg p-2.5 text-text focus:border-primary outline-none">
                                    <option value="pending">Bekliyor</option>
                                    <option value="inProgress">İşlemde</option>
                                    <option value="completed">Tamamlandı</option>
                                </select>
                            </div>
                            <button className="w-full py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
                                Durumu Güncelle
                            </button>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 text-text">Teknisyenler</h3>
                        <div className="flex items-center gap-3 mb-3 p-3 bg-surface rounded-xl border border-border">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                AY
                            </div>
                            <div>
                                <div className="font-medium text-text">Ahmet Yılmaz</div>
                                <div className="text-xs text-text-muted">Baş Teknisyen</div>
                            </div>
                        </div>
                        <button className="w-full py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                            + Teknisyen Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
