'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AylikPerformans, YillikKlasman } from '@/types';

// Mock data - Aylık geçmiş
const mockAylar = ['2026-01', '2025-12', '2025-11', '2025-10', '2025-09', '2025-08'];

const mockAylikData: Record<string, AylikPerformans[]> = {
    '2026-01': [
        { personnelId: '1', personnelAd: 'İbrahim Yayalık', ay: '2026-01', servisSayisi: 28, bireyselPuanOrtalama: 92, yetkiliPuanOrtalama: 95, ismailPuani: 5, toplamPuan: 94, siralama: 1, rozetDurumu: 'ALTIN' },
        { personnelId: '2', personnelAd: 'Alican Yaylalı', ay: '2026-01', servisSayisi: 24, bireyselPuanOrtalama: 89, yetkiliPuanOrtalama: 92, ismailPuani: 4, toplamPuan: 91, siralama: 2, rozetDurumu: 'GUMUS' },
        { personnelId: '3', personnelAd: 'Mehmet Güven', ay: '2026-01', servisSayisi: 26, bireyselPuanOrtalama: 87, yetkiliPuanOrtalama: 88, ismailPuani: 4, toplamPuan: 88, siralama: 3, rozetDurumu: 'BRONZ' },
        { personnelId: '4', personnelAd: 'Sercan Sarız', ay: '2026-01', servisSayisi: 22, bireyselPuanOrtalama: 85, yetkiliPuanOrtalama: 86, ismailPuani: 4, toplamPuan: 85, siralama: 4 },
        { personnelId: '5', personnelAd: 'Cüneyt Yaylalı', ay: '2026-01', servisSayisi: 18, bireyselPuanOrtalama: 82, yetkiliPuanOrtalama: 84, ismailPuani: 3, toplamPuan: 83, siralama: 5 },
    ],
    '2025-12': [
        { personnelId: '2', personnelAd: 'Alican Yaylalı', ay: '2025-12', servisSayisi: 26, bireyselPuanOrtalama: 91, yetkiliPuanOrtalama: 94, ismailPuani: 5, toplamPuan: 93, siralama: 1, rozetDurumu: 'ALTIN' },
        { personnelId: '1', personnelAd: 'İbrahim Yayalık', ay: '2025-12', servisSayisi: 25, bireyselPuanOrtalama: 90, yetkiliPuanOrtalama: 91, ismailPuani: 4, toplamPuan: 90, siralama: 2, rozetDurumu: 'GUMUS' },
        { personnelId: '4', personnelAd: 'Sercan Sarız', ay: '2025-12', servisSayisi: 23, bireyselPuanOrtalama: 86, yetkiliPuanOrtalama: 89, ismailPuani: 4, toplamPuan: 87, siralama: 3, rozetDurumu: 'BRONZ' },
    ],
};

// Yıllık klasman
const mockYillikKlasman: YillikKlasman[] = [
    { personnelId: '1', personnelAd: 'İbrahim Yayalık', altinRozet: 5, gumusRozet: 3, bronzRozet: 1, toplamAylikPuan: 1120, siralama: 1 },
    { personnelId: '2', personnelAd: 'Alican Yaylalı', altinRozet: 3, gumusRozet: 4, bronzRozet: 2, toplamAylikPuan: 1080, siralama: 2 },
    { personnelId: '3', personnelAd: 'Mehmet Güven', altinRozet: 2, gumusRozet: 3, bronzRozet: 3, toplamAylikPuan: 1020, siralama: 3 },
    { personnelId: '4', personnelAd: 'Sercan Sarız', altinRozet: 1, gumusRozet: 2, bronzRozet: 3, toplamAylikPuan: 960, siralama: 4 },
    { personnelId: '5', personnelAd: 'Cüneyt Yaylalı', altinRozet: 1, gumusRozet: 1, bronzRozet: 2, toplamAylikPuan: 920, siralama: 5 },
];

const rozetConfig = {
    ALTIN: { emoji: '🥇', label: 'Altın', color: '#fbbf24', bg: '#fef3c7' },
    GUMUS: { emoji: '🥈', label: 'Gümüş', color: '#9ca3af', bg: '#f3f4f6' },
    BRONZ: { emoji: '🥉', label: 'Bronz', color: '#d97706', bg: '#fef3c7' },
};

const ayAdlari: Record<string, string> = {
    '01': 'Ocak', '02': 'Şubat', '03': 'Mart', '04': 'Nisan',
    '05': 'Mayıs', '06': 'Haziran', '07': 'Temmuz', '08': 'Ağustos',
    '09': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık',
};

function formatAy(ayStr: string): string {
    const [yil, ay] = ayStr.split('-');
    return `${ayAdlari[ay]} ${yil}`;
}

export default function GecmisPage() {
    const [selectedAy, setSelectedAy] = useState(mockAylar[0]);
    const [activeTab, setActiveTab] = useState<'aylik' | 'yillik'>('aylik');

    const aylikData = mockAylikData[selectedAy] || [];

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">📊 Puanlama Geçmişi</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Aylık performanslar ve yıllık klasman
                    </p>
                </div>
                <Link href="/puanlama" className="btn btn-secondary">
                    ← Bu Ay
                </Link>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                <button
                    onClick={() => setActiveTab('aylik')}
                    className={activeTab === 'aylik' ? 'btn btn-primary' : 'btn btn-secondary'}
                >
                    📅 Aylık Geçmiş
                </button>
                <button
                    onClick={() => setActiveTab('yillik')}
                    className={activeTab === 'yillik' ? 'btn btn-primary' : 'btn btn-secondary'}
                >
                    🏆 Yıllık Klasman
                </button>
            </div>

            {activeTab === 'aylik' ? (
                <div className="grid" style={{ gridTemplateColumns: '250px 1fr', gap: 'var(--space-xl)' }}>
                    {/* Ay Seçici */}
                    <div className="card" style={{ height: 'fit-content' }}>
                        <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>Ay Seç</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                            {mockAylar.map(ay => (
                                <button
                                    key={ay}
                                    onClick={() => setSelectedAy(ay)}
                                    style={{
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: selectedAy === ay
                                            ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)'
                                            : 'var(--color-bg)',
                                        color: selectedAy === ay ? 'white' : 'var(--color-text)',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: selectedAy === ay ? 600 : 400,
                                    }}
                                >
                                    {formatAy(ay)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aylık Tablo */}
                    <div>
                        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                                📅 {formatAy(selectedAy)} Performansı
                            </h2>
                        </div>

                        {/* Kazananlar */}
                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-md)',
                            marginBottom: 'var(--space-lg)',
                        }}>
                            {aylikData.filter(p => p.rozetDurumu).map((p, i) => (
                                <div
                                    key={p.personnelId}
                                    style={{
                                        flex: 1,
                                        padding: 'var(--space-lg)',
                                        background: rozetConfig[p.rozetDurumu!].bg,
                                        borderRadius: 'var(--radius-lg)',
                                        textAlign: 'center',
                                        border: `2px solid ${rozetConfig[p.rozetDurumu!].color}`,
                                    }}
                                >
                                    <div style={{ fontSize: '2rem' }}>{rozetConfig[p.rozetDurumu!].emoji}</div>
                                    <div style={{ fontWeight: 700, marginTop: 'var(--space-xs)' }}>{p.personnelAd}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                        {p.servisSayisi} servis • {p.toplamPuan} puan
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tablo */}
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Sıra</th>
                                        <th>Personel</th>
                                        <th>Servis</th>
                                        <th>Bireysel</th>
                                        <th>Yetkili</th>
                                        <th>İsmail</th>
                                        <th>Toplam</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {aylikData.map(p => (
                                        <tr key={p.personnelId} style={{
                                            background: p.rozetDurumu ? rozetConfig[p.rozetDurumu].bg : undefined,
                                        }}>
                                            <td>
                                                {p.rozetDurumu
                                                    ? rozetConfig[p.rozetDurumu].emoji
                                                    : p.siralama
                                                }
                                            </td>
                                            <td style={{ fontWeight: p.rozetDurumu ? 600 : 400 }}>{p.personnelAd}</td>
                                            <td>{p.servisSayisi}</td>
                                            <td>{p.bireyselPuanOrtalama}</td>
                                            <td>{p.yetkiliPuanOrtalama}</td>
                                            <td>{p.ismailPuani}/5</td>
                                            <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{p.toplamPuan}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* Yıllık Klasman */
                <div>
                    {/* Büyük Ödül Adayları */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-xl)',
                            marginBottom: 'var(--space-xl)',
                        }}
                    >
                        <h2 style={{ color: '#78350f', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                            🏆 2025 Büyük Ödül Adayları
                        </h2>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)' }}>
                            {mockYillikKlasman.slice(0, 3).map((p, i) => (
                                <div
                                    key={p.personnelId}
                                    style={{
                                        textAlign: 'center',
                                        padding: 'var(--space-lg)',
                                        background: 'white',
                                        borderRadius: 'var(--radius-lg)',
                                        minWidth: '180px',
                                        boxShadow: 'var(--shadow-md)',
                                    }}
                                >
                                    <div style={{ fontSize: '3rem' }}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: 'var(--space-sm)' }}>
                                        {p.personnelAd}
                                    </div>
                                    <div style={{
                                        marginTop: 'var(--space-sm)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 'var(--space-xs)',
                                    }}>
                                        <span>🥇×{p.altinRozet}</span>
                                        <span>🥈×{p.gumusRozet}</span>
                                        <span>🥉×{p.bronzRozet}</span>
                                    </div>
                                    <div style={{
                                        marginTop: 'var(--space-sm)',
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        color: '#92400e',
                                    }}>
                                        {p.toplamAylikPuan}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#92400e' }}>toplam puan</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tam Klasman */}
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Sıra</th>
                                    <th>Personel</th>
                                    <th>🥇 Altın</th>
                                    <th>🥈 Gümüş</th>
                                    <th>🥉 Bronz</th>
                                    <th>Toplam Rozet</th>
                                    <th>Toplam Puan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockYillikKlasman.map((p, i) => (
                                    <tr key={p.personnelId} style={{
                                        background: i < 3 ? '#fef3c720' : undefined,
                                    }}>
                                        <td style={{ fontSize: '1.25rem' }}>
                                            {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : p.siralama}
                                        </td>
                                        <td style={{ fontWeight: i < 3 ? 700 : 400 }}>{p.personnelAd}</td>
                                        <td style={{ color: '#fbbf24', fontWeight: 700 }}>{p.altinRozet}</td>
                                        <td style={{ color: '#9ca3af', fontWeight: 700 }}>{p.gumusRozet}</td>
                                        <td style={{ color: '#d97706', fontWeight: 700 }}>{p.bronzRozet}</td>
                                        <td>{p.altinRozet + p.gumusRozet + p.bronzRozet}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{p.toplamAylikPuan}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
