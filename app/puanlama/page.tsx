import Link from 'next/link';

// Mock data for Marlin Yıldızı leaderboard
const mockPerformans = [
    { id: '1', ad: 'İbrahim Yayalık', servisSayisi: 28, bireysel: 92, yetkili: 95, ismail: 5, toplam: 94, rozet: 'ALTIN' },
    { id: '2', ad: 'Alican Yaylalı', servisSayisi: 24, bireysel: 89, yetkili: 92, ismail: 4, toplam: 91, rozet: 'GUMUS' },
    { id: '3', ad: 'Mehmet Güven', servisSayisi: 26, bireysel: 87, yetkili: 88, ismail: 4, toplam: 88, rozet: 'BRONZ' },
    { id: '4', ad: 'Sercan Sarız', servisSayisi: 22, bireysel: 85, yetkili: 86, ismail: 4, toplam: 85 },
    { id: '5', ad: 'Cüneyt Yaylalı', servisSayisi: 18, bireysel: 82, yetkili: 84, ismail: 3, toplam: 83 },
    { id: '6', ad: 'Emre Kaya', servisSayisi: 20, bireysel: 80, yetkili: 82, ismail: 3, toplam: 81 },
    { id: '7', ad: 'İbrahim Yaylalı', servisSayisi: 16, bireysel: 78, yetkili: 80, ismail: 3, toplam: 79 },
];

const rozetConfig = {
    ALTIN: { emoji: '🥇', label: 'Altın', color: '#fbbf24', bg: '#fef3c7' },
    GUMUS: { emoji: '🥈', label: 'Gümüş', color: '#9ca3af', bg: '#f3f4f6' },
    BRONZ: { emoji: '🥉', label: 'Bronz', color: '#d97706', bg: '#fef3c7' },
};

export default function MarlinYildiziPage() {
    const aylikKazanan = mockPerformans[0];

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">⭐ Marlin Yıldızı</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Ocak 2026 Performans Sıralaması
                    </p>
                </div>
                <Link href="/deger" className="btn btn-primary">
                    📝 Aylık Değerlendirme
                </Link>
            </header>

            {/* Winner Card */}
            <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-xl)',
                marginBottom: 'var(--space-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xl)',
            }}>
                <div style={{ fontSize: '4rem' }}>🏆</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: 500 }}>
                        BU AYIN YILDIZI
                    </div>
                    <div style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#78350f',
                        marginBottom: 'var(--space-xs)',
                    }}>
                        {aylikKazanan.ad}
                    </div>
                    <div style={{ color: '#92400e' }}>
                        {aylikKazanan.servisSayisi} servis • {aylikKazanan.toplam} puan
                    </div>
                </div>
                <div style={{
                    fontSize: '5rem',
                    textShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}>
                    🥇
                </div>
            </div>

            {/* Leaderboard */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>Sıra</th>
                            <th>Personel</th>
                            <th style={{ textAlign: 'center' }}>Servis</th>
                            <th style={{ textAlign: 'center' }}>Bireysel (40%)</th>
                            <th style={{ textAlign: 'center' }}>Yetkili (35%)</th>
                            <th style={{ textAlign: 'center' }}>İsmail (25%)</th>
                            <th style={{ textAlign: 'center' }}>Toplam</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockPerformans.map((p, index) => (
                            <tr key={p.id} style={{
                                background: p.rozet ? rozetConfig[p.rozet as keyof typeof rozetConfig].bg : undefined,
                            }}>
                                <td>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-xs)',
                                        fontSize: '1.25rem',
                                    }}>
                                        {p.rozet
                                            ? rozetConfig[p.rozet as keyof typeof rozetConfig].emoji
                                            : <span style={{ color: 'var(--color-text-muted)' }}>{index + 1}</span>
                                        }
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: p.rozet ? 600 : 400 }}>
                                        {p.ad}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>{p.servisSayisi}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.85rem',
                                    }}>
                                        {p.bireysel}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        background: 'var(--color-info)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.85rem',
                                    }}>
                                        {p.yetkili}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        background: 'var(--color-accent-gold)',
                                        color: 'white',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.85rem',
                                    }}>
                                        {p.ismail}/5
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 700,
                                        color: p.rozet ? rozetConfig[p.rozet as keyof typeof rozetConfig].color : 'var(--color-text)',
                                    }}>
                                        {p.toplam}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Scoring Legend */}
            <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
                <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>
                    📊 Puan Ağırlıkları
                </h3>
                <div className="grid grid-cols-3" style={{ gap: 'var(--space-lg)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                        }}>
                            40%
                        </div>
                        <div style={{ color: 'var(--color-text-muted)' }}>Bireysel Servis Puanları</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'var(--color-info)',
                        }}>
                            35%
                        </div>
                        <div style={{ color: 'var(--color-text-muted)' }}>Yetkili Değerlendirmesi</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: 'var(--color-accent-gold)',
                        }}>
                            25%
                        </div>
                        <div style={{ color: 'var(--color-text-muted)' }}>İsmail Çoban Kanaati</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
