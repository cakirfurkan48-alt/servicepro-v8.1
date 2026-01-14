'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import CompletionSidebar from '@/components/CompletionSidebar';
import PartsSidebar from '@/components/PartsSidebar';
import { fetchServices, updateService, deleteService } from '@/lib/api';
import { useAdmin } from '@/lib/admin-context';
import EditableText from '@/components/EditableText';
import {
    Service, ServisDurumu, DURUM_CONFIG, IsTuru, IS_TURU_CONFIG,
    KonumGrubu, KONUM_CONFIG, getKonumGrubu, KapanisRaporu, ParcaBekleme,
    PersonelAtama
} from '@/types';

const durumSirasi: ServisDurumu[] = [
    'RANDEVU_VERILDI', 'DEVAM_EDIYOR', 'PARCA_BEKLIYOR',
    'MUSTERI_ONAY_BEKLIYOR', 'RAPOR_BEKLIYOR', 'KESIF_KONTROL', 'TAMAMLANDI'
];

const konumListesi: KonumGrubu[] = ['YATMARIN', 'NETSEL', 'DIS_SERVIS'];

export default function PlanlamaPage() {
    const { isAdmin } = useAdmin();
    const [services, setServices] = useState<Service[]>([]);
    const [selectedDurumlar, setSelectedDurumlar] = useState<ServisDurumu[]>([
        'RANDEVU_VERILDI', 'DEVAM_EDIYOR', 'PARCA_BEKLIYOR', 'MUSTERI_ONAY_BEKLIYOR', 'RAPOR_BEKLIYOR', 'KESIF_KONTROL'
    ]);
    const [selectedKonumlar, setSelectedKonumlar] = useState<KonumGrubu[]>(['YATMARIN', 'NETSEL', 'DIS_SERVIS']);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'tarih' | 'konum' | 'durum'>('tarih');

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [bulkDurum, setBulkDurum] = useState<ServisDurumu | ''>('');

    // Sidebar states
    const [completionService, setCompletionService] = useState<Service | null>(null);
    const [partsService, setPartsService] = useState<Service | null>(null);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await fetchServices();
            setServices(data);
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    };

    const toggleDurum = (durum: ServisDurumu) => {
        setSelectedDurumlar(prev =>
            prev.includes(durum)
                ? prev.filter(d => d !== durum)
                : [...prev, durum]
        );
    };

    const toggleKonum = (konum: KonumGrubu) => {
        setSelectedKonumlar(prev =>
            prev.includes(konum)
                ? prev.filter(k => k !== konum)
                : [...prev, konum]
        );
    };

    // Bulk selection handlers
    const toggleSelectService = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === sortedServices.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedServices.map(s => s.id)));
        }
    };

    const handleBulkDurumChange = async () => {
        if (!bulkDurum || selectedIds.size === 0) return;

        const updates = Array.from(selectedIds).map(id =>
            updateService(id, { durum: bulkDurum })
        );

        // Optimistic update
        setServices(prev => prev.map(s =>
            selectedIds.has(s.id) ? { ...s, durum: bulkDurum } : s
        ));

        await Promise.all(updates);
        setSelectedIds(new Set());
        setBulkDurum('');
        setShowBulkActions(false);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`${selectedIds.size} servis silinecek. Emin misiniz?`)) return;

        const deletes = Array.from(selectedIds).map(id => deleteService(id));

        // Optimistic update
        setServices(prev => prev.filter(s => !selectedIds.has(s.id)));

        await Promise.all(deletes);
        setSelectedIds(new Set());
        setShowBulkActions(false);
    };

    const handleDurumChange = async (service: Service, newDurum: ServisDurumu) => {
        if (newDurum === 'TAMAMLANDI') {
            setCompletionService(service);
        } else if (newDurum === 'PARCA_BEKLIYOR') {
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, durum: newDurum } : s));
            setPartsService(service);
            await updateService(service.id, { durum: newDurum });
        } else {
            setServices(prev => prev.map(s => s.id === service.id ? { ...s, durum: newDurum } : s));
            await updateService(service.id, { durum: newDurum });
        }
    };

    const handleComplete = async (rapor: KapanisRaporu, personelAtamalari: PersonelAtama[]) => {
        if (completionService) {
            const updated = { durum: 'TAMAMLANDI' as ServisDurumu, kapanisRaporu: rapor, atananPersonel: personelAtamalari };
            setServices(prev => prev.map(s =>
                s.id === completionService.id ? { ...s, ...updated } : s
            ));
            await updateService(completionService.id, updated);
        }
    };

    const handlePartsSave = async (parcalar: ParcaBekleme[], taseronNotu: string) => {
        if (partsService) {
            const updated = { bekleyenParcalar: parcalar, taseronNotlari: taseronNotu };
            setServices(prev => prev.map(s =>
                s.id === partsService.id ? { ...s, ...updated } : s
            ));
            await updateService(partsService.id, updated);
        }
    };

    // Filtreleme
    const filteredServices = services.filter(s => {
        const durumMatch = selectedDurumlar.includes(s.durum);
        const konumMatch = selectedKonumlar.includes(getKonumGrubu(s.adres));
        const searchMatch =
            s.tekneAdi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.servisAciklamasi.toLowerCase().includes(searchQuery.toLowerCase());
        return durumMatch && konumMatch && searchMatch;
    });

    // Sıralama
    const sortedServices = [...filteredServices].sort((a, b) => {
        if (sortBy === 'tarih') return new Date(b.tarih).getTime() - new Date(a.tarih).getTime();
        if (sortBy === 'konum') return getKonumGrubu(a.adres).localeCompare(getKonumGrubu(b.adres));
        if (sortBy === 'durum') return durumSirasi.indexOf(a.durum) - durumSirasi.indexOf(b.durum);
        return 0;
    });

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">📅 Servis Planlama</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {filteredServices.length} / {services.length} servis gösteriliyor
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    {isAdmin && (
                        <button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className={showBulkActions ? 'btn btn-warning' : 'btn btn-secondary'}
                        >
                            {showBulkActions ? '✕ Seçimi Kapat' : '☑️ Toplu Düzenle'}
                        </button>
                    )}
                    <Link href="/planlama/yeni" className="btn btn-primary">
                        ➕ Yeni Servis Ekle
                    </Link>
                </div>
            </header>

            {/* Bulk Actions Bar */}
            {showBulkActions && (
                <div className="card" style={{
                    marginBottom: 'var(--space-lg)',
                    background: 'linear-gradient(90deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%)',
                    border: '2px solid var(--color-warning)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === sortedServices.length && sortedServices.length > 0}
                                    onChange={toggleSelectAll}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <span style={{ fontWeight: 600 }}>Tümünü Seç</span>
                            </label>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                {selectedIds.size} servis seçili
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Durum:</label>
                                <select
                                    className="form-select"
                                    value={bulkDurum}
                                    onChange={(e) => setBulkDurum(e.target.value as ServisDurumu)}
                                    style={{ width: '180px' }}
                                >
                                    <option value="">Seçin...</option>
                                    {durumSirasi.map(d => (
                                        <option key={d} value={d}>{DURUM_CONFIG[d].label}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleBulkDurumChange}
                                    disabled={!bulkDurum || selectedIds.size === 0}
                                    className="btn btn-primary"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    Uygula
                                </button>
                            </div>

                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedIds.size === 0}
                                className="btn btn-secondary"
                                style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}
                            >
                                🗑️ Seçilenleri Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filtreler */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                {/* Arama + Sıralama */}
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="🔍 Tekne adı veya açıklama ara..."
                        className="form-input"
                        style={{ flex: 1, minWidth: '250px' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="form-select"
                        style={{ width: '150px' }}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                    >
                        <option value="tarih">Tarihe Göre</option>
                        <option value="konum">Konuma Göre</option>
                        <option value="durum">Duruma Göre</option>
                    </select>
                </div>

                {/* Durum Filtreleri */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Durum
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                        {durumSirasi.map(durum => (
                            <button
                                key={durum}
                                onClick={() => toggleDurum(durum)}
                                style={{
                                    padding: '4px 10px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    borderRadius: 'var(--radius-full)',
                                    border: selectedDurumlar.includes(durum)
                                        ? `2px solid ${DURUM_CONFIG[durum].color}`
                                        : '1px solid var(--color-border)',
                                    background: selectedDurumlar.includes(durum) ? DURUM_CONFIG[durum].color : 'transparent',
                                    color: selectedDurumlar.includes(durum) ? 'white' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                }}
                            >
                                {DURUM_CONFIG[durum].icon} {DURUM_CONFIG[durum].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Konum Filtreleri */}
                <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Konum
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                        {konumListesi.map(konum => (
                            <button
                                key={konum}
                                onClick={() => toggleKonum(konum)}
                                style={{
                                    padding: '4px 12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    borderRadius: 'var(--radius-md)',
                                    border: selectedKonumlar.includes(konum)
                                        ? `2px solid ${KONUM_CONFIG[konum].color}`
                                        : '1px solid var(--color-border)',
                                    background: selectedKonumlar.includes(konum) ? KONUM_CONFIG[konum].color : 'transparent',
                                    color: selectedKonumlar.includes(konum) ? 'white' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                }}
                            >
                                {KONUM_CONFIG[konum].icon} {KONUM_CONFIG[konum].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Servis Tablosu */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {showBulkActions && <th style={{ width: '40px' }}></th>}
                            <th>Tarih</th>
                            <th>Tekne</th>
                            <th>Konum</th>
                            <th>Servis</th>
                            <th>Durum</th>
                            <th>Sorumlu / Ofis</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedServices.map(service => (
                            <ServiceRow
                                key={service.id}
                                service={service}
                                onDurumChange={(newDurum) => handleDurumChange(service, newDurum)}
                                onPartsClick={() => setPartsService(service)}
                                showCheckbox={showBulkActions}
                                isSelected={selectedIds.has(service.id)}
                                onToggleSelect={() => toggleSelectService(service.id)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sidebars */}
            <CompletionSidebar
                service={completionService}
                isOpen={!!completionService}
                onClose={() => setCompletionService(null)}
                onComplete={handleComplete}
            />

            <PartsSidebar
                serviceId={partsService?.id || ''}
                tekneAdi={partsService?.tekneAdi || ''}
                initialParcalar={partsService?.bekleyenParcalar}
                initialNot={partsService?.taseronNotlari}
                isOpen={!!partsService}
                onClose={() => setPartsService(null)}
                onSave={handlePartsSave}
            />
        </div>
    );
}

function ServiceRow({
    service,
    onDurumChange,
    onPartsClick,
    showCheckbox,
    isSelected,
    onToggleSelect,
}: {
    service: Service;
    onDurumChange: (durum: ServisDurumu) => void;
    onPartsClick: () => void;
    showCheckbox?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
}) {
    const [showDurumDropdown, setShowDurumDropdown] = useState(false);
    const konumGrubu = getKonumGrubu(service.adres);

    return (
        <tr style={{ background: isSelected ? 'rgba(99, 102, 241, 0.1)' : undefined }}>
            {showCheckbox && (
                <td>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggleSelect}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                </td>
            )}
            <td>
                <div style={{ fontWeight: 600 }}>{service.tarih}</div>
                {service.saat && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{service.saat}</div>
                )}
            </td>
            <td>
                <Link href={`/planlama/${service.id}`} style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 500 }}>
                    {service.tekneAdi}
                </Link>
            </td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: KONUM_CONFIG[konumGrubu].color,
                    }} />
                    <span>{service.adres}</span>
                </div>
                {service.yer && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{service.yer}</div>
                )}
            </td>
            <td>
                <div style={{
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }} title={service.servisAciklamasi}>
                    {service.servisAciklamasi}
                </div>
            </td>
            <td>
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => setShowDurumDropdown(!showDurumDropdown)}
                        style={{ cursor: 'pointer' }}
                    >
                        <StatusBadge durum={service.durum} />
                    </div>
                    {showDurumDropdown && (
                        <>
                            <div
                                style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
                                }}
                                onClick={() => setShowDurumDropdown(false)}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                background: 'var(--color-surface-elevated)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                zIndex: 20,
                                minWidth: '180px',
                                padding: 'var(--space-xs)',
                            }}>
                                {durumSirasi.map(d => (
                                    <button
                                        key={d}
                                        onClick={() => {
                                            onDurumChange(d);
                                            setShowDurumDropdown(false);
                                        }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: 'var(--space-xs) var(--space-sm)',
                                            textAlign: 'left',
                                            background: service.durum === d ? 'var(--color-primary)' : 'transparent',
                                            color: service.durum === d ? 'white' : 'var(--color-text)',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                        }}
                                    >
                                        {DURUM_CONFIG[d].icon} {DURUM_CONFIG[d].label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </td>
            <td>
                {service.atananPersonel && service.atananPersonel.length > 0 ? (
                    <div style={{ fontSize: '0.8rem' }}>
                        {service.atananPersonel.find(p => p.rol === 'sorumlu')?.personnelAd || '-'}
                    </div>
                ) : (
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Atanmadı</span>
                )}
            </td>
            <td>
                <Link href={`/planlama/${service.id}`} className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                    👁️ Düzenle
                </Link>
            </td>
        </tr>
    );
}
