'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Personnel, UNVAN_CONFIG } from '@/types';
import { fetchPersonnel } from '@/lib/api';

export default function PersonelPage() {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [filter, setFilter] = useState<'tumu' | 'teknisyen' | 'yetkili'>('tumu');
    const [showInactive, setShowInactive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPersonnel, setNewPersonnel] = useState({
        ad: '',
        unvan: 'teknisyen',
    });

    useEffect(() => {
        loadPersonnel();
    }, []);

    const loadPersonnel = async () => {
        try {
            const data = await fetchPersonnel();
            setPersonnel(data);
        } catch (error) {
            console.error('Failed to load personnel:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPersonnel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/personnel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ad: newPersonnel.ad,
                    unvan: newPersonnel.unvan,
                    rol: 'teknisyen',
                    aktif: true,
                }),
            });

            if (res.ok) {
                setShowAddForm(false);
                setNewPersonnel({ ad: '', unvan: 'teknisyen' });
                loadPersonnel();
            }
        } catch (error) {
            console.error('Failed to add personnel:', error);
        }
    };

    const filteredPersonnel = personnel.filter(p => {
        if (!showInactive && !p.aktif) return false;
        if (filter === 'tumu') return true;
        return p.rol === filter;
    });

    const teknisyenler = filteredPersonnel.filter(p => p.rol === 'teknisyen');
    const yetkililer = filteredPersonnel.filter(p => p.rol === 'yetkili');

    if (loading) {
        return <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>⏳ Yükleniyor...</div>;
    }

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">👥 Personel Yönetimi</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {personnel.filter(p => p.aktif).length} aktif personel
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button
                        onClick={() => setFilter('tumu')}
                        className={filter === 'tumu' ? 'btn btn-primary' : 'btn btn-secondary'}
                    >
                        Tümü
                    </button>
                    <button
                        onClick={() => setFilter('teknisyen')}
                        className={filter === 'teknisyen' ? 'btn btn-primary' : 'btn btn-secondary'}
                    >
                        👷 Teknisyenler
                    </button>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        {showAddForm ? '✕ İptal' : '➕ Yeni Personel'}
                    </button>
                </div>
            </header>

            {/* Add Personnel Form */}
            {showAddForm && (
                <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h3 className="card-title">➕ Yeni Personel Ekle</h3>
                    <form onSubmit={handleAddPersonnel}>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', alignItems: 'end' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newPersonnel.ad}
                                    onChange={(e) => setNewPersonnel({ ...newPersonnel, ad: e.target.value })}
                                    placeholder="Örn: Mehmet Yılmaz"
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    Unvan
                                </label>
                                <select
                                    className="form-select"
                                    value={newPersonnel.unvan}
                                    onChange={(e) => setNewPersonnel({ ...newPersonnel, unvan: e.target.value })}
                                    style={{ width: '100%' }}
                                >
                                    <option value="ustabasi">Ustabaşı</option>
                                    <option value="teknisyen">Teknisyen</option>
                                    <option value="cirak">Çırak</option>
                                </select>
                            </div>
                            <div>
                                <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                                    ✅ Ekle
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Teknisyenler */}
            {(filter === 'tumu' || filter === 'teknisyen') && teknisyenler.length > 0 && (
                <section style={{ marginBottom: 'var(--space-xl)' }}>
                    <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-muted)' }}>
                        👷 Teknisyenler ({teknisyenler.length})
                    </h2>
                    <div className="grid grid-cols-3" style={{ gap: 'var(--space-md)' }}>
                        {teknisyenler.map(p => (
                            <PersonelCard key={p.id} personel={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* Yetkililer */}
            {(filter === 'tumu' || filter === 'yetkili') && yetkililer.length > 0 && (
                <section>
                    <h2 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-muted)' }}>
                        👔 Yetkililer ({yetkililer.length})
                    </h2>
                    <div className="grid grid-cols-3" style={{ gap: 'var(--space-md)' }}>
                        {yetkililer.map(p => (
                            <PersonelCard key={p.id} personel={p} isYetkili />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {teknisyenler.length === 0 && yetkililer.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>👥</div>
                    <h3>Henüz personel eklenmemiş</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Yukarıdaki &quot;Yeni Personel&quot; butonunu kullanarak personel ekleyebilirsiniz.
                    </p>
                </div>
            )}
        </div>
    );
}

function PersonelCard({ personel, isYetkili = false }: { personel: Personnel; isYetkili?: boolean }) {
    const unvanConfig = UNVAN_CONFIG[personel.unvan] || { icon: '👤', label: personel.unvan };
    const toplamRozet = (personel.altinRozet || 0) + (personel.gumusRozet || 0) + (personel.bronzRozet || 0);

    return (
        <Link
            href={`/personel/${personel.id}`}
            className="card"
            style={{
                display: 'block',
                textDecoration: 'none',
                opacity: personel.aktif ? 1 : 0.5,
                borderLeft: `4px solid ${isYetkili ? 'var(--color-accent-gold)' : 'var(--color-primary)'}`,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    background: isYetkili ? 'var(--color-accent-gold)' : 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                }}>
                    {unvanConfig.icon}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{personel.ad}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {unvanConfig.label}
                        {!personel.aktif && ' • Pasif'}
                    </div>
                </div>
            </div>

            {!isYetkili && (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 'var(--space-sm)',
                        marginBottom: 'var(--space-md)',
                    }}>
                        <div style={{
                            padding: 'var(--space-sm)',
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-sm)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                {personel.aylikServisSayisi || 0}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>servis/ay</div>
                        </div>
                        <div style={{
                            padding: 'var(--space-sm)',
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-sm)',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>
                                {personel.aylikOrtalamaPuan || 0}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>puan</div>
                        </div>
                    </div>

                    {toplamRozet > 0 && (
                        <div style={{ display: 'flex', gap: 'var(--space-xs)', justifyContent: 'center' }}>
                            {(personel.altinRozet || 0) > 0 && (
                                <span title="Altın Rozet">🥇 ×{personel.altinRozet}</span>
                            )}
                            {(personel.gumusRozet || 0) > 0 && (
                                <span title="Gümüş Rozet">🥈 ×{personel.gumusRozet}</span>
                            )}
                            {(personel.bronzRozet || 0) > 0 && (
                                <span title="Bronz Rozet">🥉 ×{personel.bronzRozet}</span>
                            )}
                        </div>
                    )}
                </>
            )}
        </Link>
    );
}
