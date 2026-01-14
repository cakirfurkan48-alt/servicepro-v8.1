'use client';

import { useState, useEffect } from 'react';
import {
    TUM_PERSONEL,
    UNVAN_CONFIG,
    ISMAIL_PUAN_ACIKLAMALARI
} from '@/types';

// Token validation (in real app, this would come from URL params)
const VALID_TOKEN = 'ismail-2026-01';

interface PersonelPuan {
    personnelId: string;
    personnelAd: string;
    unvan: 'usta' | 'cirak';
    puan: 1 | 2 | 3 | 4 | 5 | null;
    kilitlendi: boolean;
}

export default function IsmailDegerlendirmePage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const [pendingSave, setPendingSave] = useState<string | null>(null);

    const teknisyenler = TUM_PERSONEL.filter(p => p.rol === 'teknisyen' && p.aktif);

    const [puanlar, setPuanlar] = useState<PersonelPuan[]>(
        teknisyenler.map(p => ({
            personnelId: p.id,
            personnelAd: p.ad,
            unvan: p.unvan as 'usta' | 'cirak',
            puan: null,
            kilitlendi: false,
        }))
    );

    const handleLogin = () => {
        if (token === VALID_TOKEN) {
            setIsAuthenticated(true);
        } else {
            alert('Geçersiz token! Lütfen doğru linki kullanın.');
        }
    };

    const handlePuanSelect = (personnelId: string, puan: 1 | 2 | 3 | 4 | 5) => {
        const personel = puanlar.find(p => p.personnelId === personnelId);
        if (personel?.kilitlendi) return;

        setPuanlar(prev => prev.map(p =>
            p.personnelId === personnelId ? { ...p, puan } : p
        ));
    };

    const handleSaveClick = (personnelId: string) => {
        const personel = puanlar.find(p => p.personnelId === personnelId);
        if (!personel?.puan) {
            alert('Lütfen bir puan seçin.');
            return;
        }
        setPendingSave(personnelId);
        setShowWarning(true);
    };

    const confirmSave = () => {
        if (pendingSave) {
            setPuanlar(prev => prev.map(p =>
                p.personnelId === pendingSave ? { ...p, kilitlendi: true } : p
            ));
            // TODO: API call to save
            console.log('Saved and locked:', pendingSave);
        }
        setShowWarning(false);
        setPendingSave(null);
    };

    const tamamlanan = puanlar.filter(p => p.kilitlendi).length;
    const toplam = puanlar.length;

    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-lg)',
            }}>
                <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>👨‍🔧</div>
                    <h1 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text)' }}>
                        Atölye Şefi Değerlendirmesi
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)' }}>
                        Bu sayfa sadece İsmail Çoban için hazırlanmıştır.<br />
                        Lütfen size gönderilen tokeni girin.
                    </p>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Token girin..."
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}
                    />
                    <button className="btn btn-primary" onClick={handleLogin} style={{ width: '100%' }}>
                        Giriş Yap
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--color-bg)',
            padding: 'var(--space-xl)',
        }}>
            {/* Warning Modal */}
            {showWarning && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div className="card" style={{ maxWidth: '450px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⚠️</div>
                        <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-warning)' }}>
                            DİKKAT!
                        </h2>
                        <p style={{
                            color: 'var(--color-text)',
                            marginBottom: 'var(--space-lg)',
                            lineHeight: 1.7,
                        }}>
                            Bu puanı kaydettikten sonra <strong style={{ color: 'var(--color-error)' }}>değiştiremezsiniz</strong>.<br />
                            Puanınız doğrudan sisteme işlenecektir.
                        </p>
                        <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '0.85rem',
                            marginBottom: 'var(--space-xl)',
                        }}>
                            Emin misiniz?
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setShowWarning(false); setPendingSave(null); }}
                                style={{ flex: 1 }}
                            >
                                İptal
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={confirmSave}
                                style={{ flex: 1 }}
                            >
                                ✓ Onayla ve Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: 'var(--space-2xl)',
                padding: 'var(--space-xl)',
                background: 'linear-gradient(135deg, var(--color-accent-gold) 0%, #d97706 100%)',
                borderRadius: 'var(--radius-lg)',
                color: 'black',
            }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem' }}>👨‍🔧 Atölye Şefi Değerlendirmesi</h1>
                <p style={{ margin: 'var(--space-sm) 0 0', opacity: 0.8 }}>
                    Ocak 2026 - İsmail Çoban
                </p>
                <div style={{
                    marginTop: 'var(--space-lg)',
                    padding: 'var(--space-sm) var(--space-lg)',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-md)',
                    display: 'inline-block',
                }}>
                    {tamamlanan} / {toplam} Tamamlandı
                </div>
            </div>

            {/* Info Box */}
            <div style={{
                padding: 'var(--space-lg)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-xl)',
            }}>
                <h3 style={{ color: 'var(--color-primary-light)', marginBottom: 'var(--space-sm)' }}>
                    📋 Değerlendirme Sorusu
                </h3>
                <p style={{
                    color: 'var(--color-text)',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    margin: 0,
                }}>
                    "Bu personelin bu ayki genel saha performansını nasıl değerlendiriyorsunuz?"
                </p>
            </div>

            {/* Personnel Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--space-lg)',
            }}>
                {puanlar.map(personel => (
                    <div
                        key={personel.personnelId}
                        className="card"
                        style={{
                            opacity: personel.kilitlendi ? 0.7 : 1,
                            borderColor: personel.kilitlendi ? 'var(--color-success)' : 'var(--color-border)',
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 'var(--space-md)',
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                                    {UNVAN_CONFIG[personel.unvan].icon} {personel.personnelAd}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {UNVAN_CONFIG[personel.unvan].label}
                                </div>
                            </div>
                            {personel.kilitlendi && (
                                <span style={{
                                    padding: '4px 8px',
                                    background: 'var(--color-success)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                }}>
                                    🔒 KAYDEDİLDİ
                                </span>
                            )}
                        </div>

                        {/* Puan Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-xs)',
                            marginBottom: 'var(--space-md)',
                        }}>
                            {([1, 2, 3, 4, 5] as const).map(puan => {
                                const config = ISMAIL_PUAN_ACIKLAMALARI[puan];
                                const isSelected = personel.puan === puan;
                                return (
                                    <button
                                        key={puan}
                                        onClick={() => handlePuanSelect(personel.personnelId, puan)}
                                        disabled={personel.kilitlendi}
                                        style={{
                                            flex: 1,
                                            padding: 'var(--space-sm)',
                                            borderRadius: 'var(--radius-md)',
                                            border: isSelected ? `2px solid ${config.color}` : '1px solid var(--color-border)',
                                            background: isSelected ? config.color : 'var(--color-surface-elevated)',
                                            color: isSelected ? 'white' : 'var(--color-text)',
                                            cursor: personel.kilitlendi ? 'not-allowed' : 'pointer',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {puan}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected Puan Label */}
                        {personel.puan && (
                            <div style={{
                                textAlign: 'center',
                                marginBottom: 'var(--space-md)',
                                color: ISMAIL_PUAN_ACIKLAMALARI[personel.puan].color,
                                fontWeight: 600,
                                fontSize: '0.85rem',
                            }}>
                                {ISMAIL_PUAN_ACIKLAMALARI[personel.puan].label}
                            </div>
                        )}

                        {/* Save Button */}
                        {!personel.kilitlendi && (
                            <button
                                onClick={() => handleSaveClick(personel.personnelId)}
                                disabled={!personel.puan}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    opacity: personel.puan ? 1 : 0.5,
                                }}
                            >
                                Kaydet
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit All */}
            {tamamlanan === toplam && (
                <div style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-2xl)',
                    padding: 'var(--space-xl)',
                    background: 'var(--color-success)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'white',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎉</div>
                    <h2>Tüm Değerlendirmeler Tamamlandı!</h2>
                    <p style={{ opacity: 0.9 }}>
                        Tüm puanlarınız sisteme başarıyla kaydedildi. Teşekkür ederiz.
                    </p>
                </div>
            )}
        </div>
    );
}
