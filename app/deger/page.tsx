'use client';

import { useState } from 'react';
import {
    YetkiliYanit,
    YANIT_PUANLARI,
    UNVAN_CONFIG,
    PersonelUnvan,
    USTA_SORULARI,
    CIRAK_SORULARI,
    TUM_PERSONEL,
    SoruConfig,
} from '@/types';

// Sadece teknisyenler değerlendirmeye alınır
const personnel = TUM_PERSONEL.filter(p => p.rol === 'teknisyen' && p.aktif);
const ustalar = personnel.filter(p => p.unvan === 'usta');
const ciraklar = personnel.filter(p => p.unvan === 'cirak');

// Yanıt seçenekleri
const yanitSecenekleri: { value: YetkiliYanit; label: string; color: string }[] = [
    { value: 'EVET', label: 'Evet', color: 'var(--color-success)' },
    { value: 'KISMEN', label: 'Kısmen', color: 'var(--color-warning)' },
    { value: 'HAYIR', label: 'Hayır', color: 'var(--color-error)' },
    { value: 'ATLA', label: 'Gözlemlemedim', color: 'var(--color-text-muted)' },
];

type UstaSorulari = {
    uniformaVeIsg: YetkiliYanit;
    musteriIletisimi: YetkiliYanit;
    planlamaKoordinasyon: YetkiliYanit;
    teknikTespit: YetkiliYanit;
    raporDokumantasyon: YetkiliYanit;
    genelLiderlik: YetkiliYanit;
};

type CirakSorulari = {
    uniformaVeIsg: YetkiliYanit;
    ekipIciDavranis: YetkiliYanit;
    destekKalitesi: YetkiliYanit;
    ogrenmeGelisim: YetkiliYanit;
};

const defaultUstaDegerlendirme: UstaSorulari = {
    uniformaVeIsg: 'ATLA',
    musteriIletisimi: 'ATLA',
    planlamaKoordinasyon: 'ATLA',
    teknikTespit: 'ATLA',
    raporDokumantasyon: 'ATLA',
    genelLiderlik: 'ATLA',
};

const defaultCirakDegerlendirme: CirakSorulari = {
    uniformaVeIsg: 'ATLA',
    ekipIciDavranis: 'ATLA',
    destekKalitesi: 'ATLA',
    ogrenmeGelisim: 'ATLA',
};

function hesaplaPuan(sorular: Record<string, YetkiliYanit>): number {
    const values = Object.values(sorular);
    let toplam = 0;
    let say = 0;

    values.forEach(v => {
        const puan = YANIT_PUANLARI[v];
        if (puan !== null) {
            toplam += puan;
            say++;
        }
    });

    return say > 0 ? Math.round(toplam / say) : 0;
}

export default function AylikDegerlendirmePage() {
    const [activeTab, setActiveTab] = useState<'usta' | 'cirak'>('usta');
    const [selectedPersonelId, setSelectedPersonelId] = useState(ustalar[0]?.id || '');

    const [ustaDegerlendirmeler, setUstaDegerlendirmeler] = useState<Record<string, UstaSorulari>>(
        Object.fromEntries(ustalar.map(p => [p.id, { ...defaultUstaDegerlendirme }]))
    );

    const [cirakDegerlendirmeler, setCirakDegerlendirmeler] = useState<Record<string, CirakSorulari>>(
        Object.fromEntries(ciraklar.map(p => [p.id, { ...defaultCirakDegerlendirme }]))
    );

    const [savedPersonel, setSavedPersonel] = useState<string[]>([]);

    const currentList = activeTab === 'usta' ? ustalar : ciraklar;
    const selectedPersonel = currentList.find(p => p.id === selectedPersonelId) || currentList[0];
    const sorular = activeTab === 'usta' ? USTA_SORULARI : CIRAK_SORULARI;
    const currentDegerlendirme = activeTab === 'usta'
        ? ustaDegerlendirmeler[selectedPersonelId]
        : cirakDegerlendirmeler[selectedPersonelId];

    const puan = currentDegerlendirme ? hesaplaPuan(currentDegerlendirme) : 0;

    const handleTabChange = (tab: 'usta' | 'cirak') => {
        setActiveTab(tab);
        const list = tab === 'usta' ? ustalar : ciraklar;
        setSelectedPersonelId(list[0]?.id || '');
    };

    const handleSoruChange = (key: string, value: YetkiliYanit) => {
        if (activeTab === 'usta') {
            setUstaDegerlendirmeler(prev => ({
                ...prev,
                [selectedPersonelId]: { ...prev[selectedPersonelId], [key]: value },
            }));
        } else {
            setCirakDegerlendirmeler(prev => ({
                ...prev,
                [selectedPersonelId]: { ...prev[selectedPersonelId], [key]: value },
            }));
        }
    };

    const handleSave = () => {
        if (!savedPersonel.includes(selectedPersonelId)) {
            setSavedPersonel([...savedPersonel, selectedPersonelId]);
        }
        console.log('Saved:', selectedPersonel?.ad, currentDegerlendirme);
    };

    if (!selectedPersonel) return <div>Personel bulunamadı</div>;

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">⭐ Yetkili Değerlendirmesi</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Ocak 2026 - Rol Bazlı Performans Değerlendirmesi
                    </p>
                </div>
                <div style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    background: savedPersonel.length === personnel.length ? 'var(--color-success)' : 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                }}>
                    {savedPersonel.length} / {personnel.length} Tamamlandı
                </div>
            </header>

            {/* Rol Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <button
                    onClick={() => handleTabChange('usta')}
                    className={activeTab === 'usta' ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ flex: 1 }}
                >
                    👨‍🔧 Ustalar ({ustalar.length} kişi, 6 soru)
                </button>
                <button
                    onClick={() => handleTabChange('cirak')}
                    className={activeTab === 'cirak' ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ flex: 1 }}
                >
                    👷 Çıraklar ({ciraklar.length} kişi, 4 soru)
                </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '280px 1fr', gap: 'var(--space-xl)' }}>
                {/* Personnel List */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 className="card-title" style={{ marginBottom: 'var(--space-md)' }}>
                        {activeTab === 'usta' ? '👨‍🔧 Ustalar' : '👷 Çıraklar'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                        {currentList.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPersonelId(p.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-sm) var(--space-md)',
                                    background: selectedPersonelId === p.id
                                        ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
                                        : 'var(--color-surface-elevated)',
                                    color: selectedPersonelId === p.id ? 'white' : 'var(--color-text)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                            >
                                <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{p.ad}</span>
                                {savedPersonel.includes(p.id) && <span style={{ color: 'var(--color-success)' }}>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Evaluation Form */}
                <div className="card">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-xl)',
                        paddingBottom: 'var(--space-lg)',
                        borderBottom: '1px solid var(--color-border)',
                    }}>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                                {UNVAN_CONFIG[selectedPersonel.unvan].icon} {selectedPersonel.ad}
                            </h2>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                background: activeTab === 'usta' ? 'var(--color-primary)' : 'var(--color-info)',
                                color: 'white',
                                borderRadius: 'var(--radius-sm)',
                                marginTop: 'var(--space-xs)',
                                display: 'inline-block',
                            }}>
                                {UNVAN_CONFIG[selectedPersonel.unvan].label} • {sorular.length} Soru
                            </span>
                        </div>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: puan > 70 ? 'var(--color-success)' : puan > 40 ? 'var(--color-warning)' : 'var(--color-error)',
                        }}>
                            {puan}
                        </div>
                    </div>

                    {/* Sorular */}
                    {sorular.map((soru, index) => {
                        const currentValue = currentDegerlendirme?.[soru.key as keyof typeof currentDegerlendirme] || 'ATLA';

                        return (
                            <div
                                key={soru.key}
                                style={{
                                    padding: 'var(--space-lg)',
                                    background: index % 2 === 0 ? 'var(--color-surface-elevated)' : 'transparent',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-md)',
                                }}
                            >
                                <div style={{ marginBottom: 'var(--space-sm)' }}>
                                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>
                                        {index + 1}. {soru.label}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: 'var(--space-md)',
                                    lineHeight: 1.5,
                                }}>
                                    {soru.aciklama}
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                    {yanitSecenekleri.map(opt => {
                                        const isSelected = currentValue === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleSoruChange(soru.key, opt.value)}
                                                style={{
                                                    padding: 'var(--space-sm) var(--space-lg)',
                                                    border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: isSelected ? opt.color : 'transparent',
                                                    color: isSelected ? 'white' : opt.color,
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
                        <button className="btn btn-primary" onClick={handleSave} style={{ padding: 'var(--space-md) var(--space-xl)' }}>
                            ✓ {selectedPersonel.ad} Değerlendirmesini Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
