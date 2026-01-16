'use client';

import { useState } from 'react';
import { Service, ServisDurumu } from '@/types';
import { generateYarinRaporu, generateHaftaRaporu, getDevamEdenler } from '@/lib/report-generator';

// Mock data
const mockServices: Service[] = [
    {
        id: '1', tarih: '2026-01-15', saat: '09:30', tekneAdi: 'S/Y BELLA BLUE',
        adres: 'NETSEL', yer: 'L Pontonu', servisAciklamasi: 'Motor Rutin Bakım',
        isTuru: 'paket', durum: 'DEVAM EDİYOR', atananPersonel: [],
    },
    {
        id: '2', tarih: '2026-01-15', saat: '11:00', tekneAdi: 'M/V ARIEL',
        adres: 'YATMARİN', yer: 'Kara', servisAciklamasi: 'Seakeeper Kontrol',
        isTuru: 'ariza', durum: 'DEVAM EDİYOR', atananPersonel: [],
    },
    {
        id: '3', tarih: '2026-01-15', saat: '14:00', tekneAdi: 'CAT. HELIOS',
        adres: 'BOZBURUN', yer: 'DSV', servisAciklamasi: 'Pasarella Montajı',
        isTuru: 'proje', durum: 'DEVAM EDİYOR', atananPersonel: [],
    },
    {
        id: '4', tarih: '2026-01-14', tekneAdi: 'M/V PACE',
        adres: 'GÖCEK', yer: 'D-Marin', servisAciklamasi: 'Jeneratör',
        isTuru: 'ariza', durum: 'PARÇA BEKLİYOR', atananPersonel: [],
    },
    {
        id: '5', tarih: '2026-01-13', tekneAdi: 'S/Y DAISY',
        adres: 'NETSEL', yer: 'Atölye', servisAciklamasi: 'Kuyruk Bakımı',
        isTuru: 'paket', durum: 'RAPOR BEKLİYOR', atananPersonel: [],
    },
];

export default function WhatsAppRaporPage() {
    const [activeTab, setActiveTab] = useState<'yarin' | 'hafta'>('yarin');
    const [copied, setCopied] = useState(false);

    const yarinServisler = mockServices.filter(s => s.tarih === '2026-01-15');
    const devamEdenler = getDevamEdenler(mockServices);

    const raporMetni = activeTab === 'yarin'
        ? generateYarinRaporu(yarinServisler, devamEdenler)
        : generateHaftaRaporu(mockServices, devamEdenler);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(raporMetni);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">📤 WhatsApp Rapor Çıktısı</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Kopyalayıp WhatsApp grubuna yapıştırın
                    </p>
                </div>
            </header>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-lg)'
            }}>
                <button
                    onClick={() => setActiveTab('yarin')}
                    className={activeTab === 'yarin' ? 'btn btn-primary' : 'btn btn-secondary'}
                >
                    📅 Yarın
                </button>
                <button
                    onClick={() => setActiveTab('hafta')}
                    className={activeTab === 'hafta' ? 'btn btn-primary' : 'btn btn-secondary'}
                >
                    📆 Haftalık
                </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 400px', gap: 'var(--space-xl)' }}>
                {/* Preview */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Önizleme</h3>
                        <button
                            className={copied ? 'btn btn-success' : 'btn btn-primary'}
                            onClick={handleCopy}
                        >
                            {copied ? '✓ Kopyalandı!' : '📋 Kopyala'}
                        </button>
                    </div>

                    <pre style={{
                        background: '#1e293b',
                        color: '#e2e8f0',
                        padding: 'var(--space-lg)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        overflowX: 'auto',
                    }}>
                        {raporMetni}
                    </pre>
                </div>

                {/* Info */}
                <div>
                    <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>
                            📊 Özet
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 'var(--space-sm)',
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-sm)',
                            }}>
                                <span>Planlı Servis</span>
                                <strong>{yarinServisler.length}</strong>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 'var(--space-sm)',
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-sm)',
                            }}>
                                <span>Devam Eden</span>
                                <strong style={{ color: 'var(--color-warning)' }}>{devamEdenler.length}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>
                            💡 Kullanım
                        </h3>
                        <ol style={{
                            paddingLeft: 'var(--space-lg)',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.9rem',
                            lineHeight: 1.8,
                        }}>
                            <li>Yukarıdaki "Kopyala" butonuna tıklayın</li>
                            <li>WhatsApp grubunu açın</li>
                            <li>Mesaj alanına yapıştırın</li>
                            <li>Gönderin ✓</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
