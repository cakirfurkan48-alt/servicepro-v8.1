'use client';

import { useState, useEffect } from 'react';
import {
    Service, IsTuru, IS_TURU_CONFIG, RAPOR_GEREKSINIMLERI, KapanisRaporu,
    PersonelAtama, UNVAN_CONFIG, TUM_PERSONEL, Personnel
} from '@/types';
import { hesaplaRaporBasarisi, hesaplaBireyselPuan } from '@/lib/scoring-calculator';

interface CompletionSidebarProps {
    service: Service | null;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (rapor: KapanisRaporu, personelAtamalari: PersonelAtama[]) => void;
}

const raporAlanlari = [
    { key: 'uniteBilgileri', label: 'Ünite Bilgileri (Seri No, Model vb.)' },
    { key: 'fotograf', label: 'Fotoğraf (Öncesi/Sonrası)' },
    { key: 'tekneKonum', label: 'Tekne/Konum bilgisi' },
    { key: 'sarfMalzeme', label: 'Sarf Malzeme' },
    { key: 'adamSaat', label: 'Adam/Saat' },
    { key: 'taseronBilgisi', label: 'Taşeron bilgisi' },
    { key: 'stokMalzeme', label: 'Stok Malzeme' },
];

const defaultRapor: KapanisRaporu = {
    uniteBilgileri: false,
    fotograf: false,
    tekneKonum: false,
    sarfMalzeme: false,
    adamSaat: false,
    taseronBilgisi: false,
    stokMalzeme: false,
    aciklama: '',
    raporlayanPersonel: '',
    raporTarihi: new Date().toISOString().split('T')[0],
};

interface PersonelSecimi {
    personnelId: string;
    personnelAd: string;
    unvan: 'usta' | 'cirak';
    secili: boolean;
    rol: 'sorumlu' | 'destek';
    bonus: boolean;
}

export default function CompletionSidebar({ service, isOpen, onClose, onComplete }: CompletionSidebarProps) {
    const [rapor, setRapor] = useState<KapanisRaporu>(defaultRapor);
    const [personelSecimleri, setPersonelSecimleri] = useState<PersonelSecimi[]>([]);

    // Initialize personnel selections when service changes
    useEffect(() => {
        if (service) {
            // Get active technicians
            const teknisyenler = TUM_PERSONEL.filter(p => p.rol === 'teknisyen' && p.aktif);

            // Initialize with pre-assigned personnel checked
            const initialSecimleri: PersonelSecimi[] = teknisyenler.map(p => {
                const atama = service.atananPersonel.find(a => a.personnelId === p.id);
                return {
                    personnelId: p.id,
                    personnelAd: p.ad,
                    unvan: p.unvan as 'usta' | 'cirak',
                    secili: !!atama,
                    rol: atama?.rol || 'destek',
                    bonus: false,
                };
            });

            setPersonelSecimleri(initialSecimleri);
            setRapor({
                ...defaultRapor,
                raporlayanPersonel: service.atananPersonel.find(p => p.rol === 'sorumlu')?.personnelAd || '',
                raporTarihi: new Date().toISOString().split('T')[0],
            });
        }
    }, [service]);

    if (!service || !isOpen) return null;

    const gerekliAlanlar = RAPOR_GEREKSINIMLERI[service.isTuru];
    const raporBasarisi = hesaplaRaporBasarisi(rapor, service.isTuru);

    const seciliPersoneller = personelSecimleri.filter(p => p.secili);
    const sorumlular = seciliPersoneller.filter(p => p.rol === 'sorumlu');
    const destekler = seciliPersoneller.filter(p => p.rol === 'destek');

    const toggleSecim = (personnelId: string) => {
        setPersonelSecimleri(prev => prev.map(p =>
            p.personnelId === personnelId ? { ...p, secili: !p.secili } : p
        ));
    };

    const setRol = (personnelId: string, rol: 'sorumlu' | 'destek') => {
        setPersonelSecimleri(prev => prev.map(p =>
            p.personnelId === personnelId ? { ...p, rol } : p
        ));
    };

    const toggleBonus = (personnelId: string) => {
        setPersonelSecimleri(prev => prev.map(p =>
            p.personnelId === personnelId ? { ...p, bonus: !p.bonus } : p
        ));
    };

    const handleComplete = () => {
        const atamalar: PersonelAtama[] = seciliPersoneller.map(p => ({
            personnelId: p.personnelId,
            personnelAd: p.personnelAd,
            rol: p.rol,
            unvan: p.unvan,
            bonus: p.bonus,
        }));

        onComplete(rapor, atamalar);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 200,
                }}
            />

            {/* Sidebar */}
            <div style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '520px',
                background: 'var(--color-surface)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 201,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.3s ease',
            }}>
                {/* Header */}
                <div style={{
                    padding: 'var(--space-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    background: 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)',
                    color: 'white',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>✓ Servis Tamamlama</h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: 'var(--radius-full)',
                                width: '32px',
                                height: '32px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div style={{ marginTop: 'var(--space-sm)', opacity: 0.9 }}>
                        {service.tekneAdi} • {service.servisAciklamasi.substring(0, 40)}...
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-lg)' }}>
                    {/* İş Tipi */}
                    <div style={{
                        display: 'inline-block',
                        padding: 'var(--space-xs) var(--space-sm)',
                        background: 'var(--color-accent-gold)',
                        color: 'black',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: 'var(--space-lg)',
                    }}>
                        {IS_TURU_CONFIG[service.isTuru].label} (×{IS_TURU_CONFIG[service.isTuru].carpan})
                    </div>

                    {/* Personel Seçimi */}
                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                        <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            👥 SERVİSTE ÇALIŞAN PERSONEL
                        </h3>

                        <div style={{
                            padding: 'var(--space-sm)',
                            background: 'var(--color-info)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            color: 'white',
                            marginBottom: 'var(--space-md)',
                        }}>
                            💡 Personeli seçin ve rolünü belirleyin. Sorumlu = rapor kalitesine göre, Destek = sabit baz puan.
                        </div>

                        <div style={{ maxHeight: '250px', overflow: 'auto' }}>
                            {personelSecimleri.map(p => (
                                <div
                                    key={p.personnelId}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-sm)',
                                        padding: 'var(--space-sm)',
                                        background: p.secili ? 'var(--color-surface-elevated)' : 'transparent',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: 'var(--space-xs)',
                                        border: p.secili ? '1px solid var(--color-border)' : '1px solid transparent',
                                    }}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleSecim(p.personnelId)}
                                        style={{
                                            width: '22px',
                                            height: '22px',
                                            borderRadius: '4px',
                                            border: p.secili ? 'none' : '2px solid var(--color-border)',
                                            background: p.secili ? 'var(--color-primary)' : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {p.secili && '✓'}
                                    </button>

                                    {/* Name & Unvan */}
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 500 }}>{p.personnelAd}</span>
                                        <span style={{
                                            marginLeft: 'var(--space-xs)',
                                            fontSize: '0.7rem',
                                            color: 'var(--color-text-muted)',
                                        }}>
                                            {UNVAN_CONFIG[p.unvan].icon} {UNVAN_CONFIG[p.unvan].label}
                                        </span>
                                    </div>

                                    {/* Role Selection */}
                                    {p.secili && (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button
                                                onClick={() => setRol(p.personnelId, 'sorumlu')}
                                                style={{
                                                    padding: '2px 8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    border: p.rol === 'sorumlu' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: p.rol === 'sorumlu' ? 'var(--color-primary)' : 'transparent',
                                                    color: p.rol === 'sorumlu' ? 'white' : 'var(--color-text-muted)',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Sorumlu
                                            </button>
                                            <button
                                                onClick={() => setRol(p.personnelId, 'destek')}
                                                style={{
                                                    padding: '2px 8px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600,
                                                    border: p.rol === 'destek' ? '2px solid var(--color-success)' : '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: p.rol === 'destek' ? 'var(--color-success)' : 'transparent',
                                                    color: p.rol === 'destek' ? 'white' : 'var(--color-text-muted)',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Destek
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rapor Kontrol Listesi */}
                    <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        📋 RAPOR KONTROL LİSTESİ
                    </h3>

                    {raporAlanlari.map((alan) => {
                        const key = alan.key as keyof KapanisRaporu;
                        const isGerekli = gerekliAlanlar.includes(alan.key as any);
                        const isChecked = rapor[key] === true;

                        return (
                            <div
                                key={alan.key}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-sm)',
                                    padding: 'var(--space-sm)',
                                    marginBottom: 'var(--space-xs)',
                                    background: isGerekli ? 'var(--color-surface-elevated)' : 'transparent',
                                    borderRadius: 'var(--radius-sm)',
                                    opacity: isGerekli ? 1 : 0.4,
                                }}
                            >
                                <button
                                    onClick={() => isGerekli && setRapor({ ...rapor, [key]: !isChecked })}
                                    disabled={!isGerekli}
                                    style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '4px',
                                        border: isChecked ? 'none' : '2px solid var(--color-border)',
                                        background: isChecked ? 'var(--color-success)' : 'transparent',
                                        color: 'white',
                                        cursor: isGerekli ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        flexShrink: 0,
                                    }}
                                >
                                    {isChecked && '✓'}
                                </button>
                                <span style={{ flex: 1, fontSize: '0.85rem' }}>{alan.label}</span>
                                {isGerekli && (
                                    <span style={{ fontSize: '0.65rem', color: 'var(--color-error)', fontWeight: 600 }}>
                                        ZORUNLU
                                    </span>
                                )}
                            </div>
                        );
                    })}

                    {/* Puan Önizleme */}
                    <div style={{
                        marginTop: 'var(--space-lg)',
                        padding: 'var(--space-md)',
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ opacity: 0.9 }}>Rapor Başarı Oranı</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>%{Math.round(raporBasarisi * 100)}</span>
                        </div>
                    </div>

                    {/* Personel Puanları */}
                    {seciliPersoneller.length > 0 && (
                        <div style={{ marginTop: 'var(--space-lg)' }}>
                            <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                💰 PUAN ÖNİZLEME
                            </h3>

                            {/* Sorumlular */}
                            {sorumlular.length > 0 && (
                                <div style={{ marginBottom: 'var(--space-md)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-primary-light)', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>
                                        SORUMLU (Rapor Kalitesine Göre)
                                    </div>
                                    {sorumlular.map((p) => {
                                        const puan = hesaplaBireyselPuan(raporBasarisi, service.isTuru, 'sorumlu', p.bonus);
                                        return (
                                            <PuanCard
                                                key={p.personnelId}
                                                personel={p}
                                                puan={puan}
                                                formula={`(40 + 60×${Math.round(raporBasarisi * 100)}%) × ${puan.zorlukCarpani}${p.bonus ? ' +15' : ''}`}
                                                isSorumlu
                                                onToggleBonus={() => toggleBonus(p.personnelId)}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {/* Destekler */}
                            {destekler.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', marginBottom: 'var(--space-xs)', fontWeight: 600 }}>
                                        DESTEK (Sabit 80 Baz Puan)
                                    </div>
                                    {destekler.map((p) => {
                                        const puan = hesaplaBireyselPuan(1, service.isTuru, 'destek', p.bonus);
                                        return (
                                            <PuanCard
                                                key={p.personnelId}
                                                personel={p}
                                                puan={puan}
                                                formula={`80 × ${puan.zorlukCarpani}${p.bonus ? ' +15' : ''}`}
                                                isSorumlu={false}
                                                onToggleBonus={() => toggleBonus(p.personnelId)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: 'var(--space-lg)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: 'var(--space-sm)',
                }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                        İptal
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={handleComplete}
                        style={{ flex: 2 }}
                        disabled={seciliPersoneller.length === 0}
                    >
                        ✓ Servisi Tamamla ({seciliPersoneller.length} personel)
                    </button>
                </div>
            </div>
        </>
    );
}

// Puan Card Component
function PuanCard({
    personel,
    puan,
    formula,
    isSorumlu,
    onToggleBonus
}: {
    personel: PersonelSecimi;
    puan: { hamPuan: number; zorlukCarpani: number; finalPuan: number };
    formula: string;
    isSorumlu: boolean;
    onToggleBonus: () => void;
}) {
    return (
        <div style={{
            padding: 'var(--space-sm)',
            background: 'var(--color-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: `3px solid ${isSorumlu ? 'var(--color-primary)' : 'var(--color-success)'}`,
        }}>
            <div>
                <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                    {UNVAN_CONFIG[personel.unvan].icon} {personel.personnelAd}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {formula}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <button
                    onClick={onToggleBonus}
                    style={{
                        padding: '2px 6px',
                        fontSize: '0.65rem',
                        border: personel.bonus ? '1px solid var(--color-accent-gold)' : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        background: personel.bonus ? 'var(--color-accent-gold)' : 'transparent',
                        color: personel.bonus ? 'black' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                    }}
                >
                    ⭐ +15
                </button>
                <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: isSorumlu ? 'var(--color-primary-light)' : 'var(--color-success)',
                }}>
                    {puan.finalPuan}
                </span>
            </div>
        </div>
    );
}
