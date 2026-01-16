'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Status types from legacy system - will migrate to new status.ts
type ServisDurumu =
    | 'RANDEVU_VERILDI'
    | 'DEVAM_EDIYOR'
    | 'PARCA_BEKLIYOR'
    | 'MUSTERI_ONAY_BEKLIYOR'
    | 'RAPOR_BEKLIYOR'
    | 'KESIF_KONTROL'
    | 'TAMAMLANDI';

type KonumGrubu = 'YATMARIN' | 'NETSEL' | 'DIS_SERVIS';

// Legacy config - will be replaced with new status system
const DURUM_CONFIG: Record<ServisDurumu, { label: string; color: string; icon: string }> = {
    RANDEVU_VERILDI: { label: 'Randevu', color: '#86efac', icon: '📅' },
    DEVAM_EDIYOR: { label: 'Devam', color: '#22c55e', icon: '🔄' },
    PARCA_BEKLIYOR: { label: 'Parça', color: '#60a5fa', icon: '📦' },
    MUSTERI_ONAY_BEKLIYOR: { label: 'Onay', color: '#3b82f6', icon: '✋' },
    RAPOR_BEKLIYOR: { label: 'Rapor', color: '#818cf8', icon: '📝' },
    KESIF_KONTROL: { label: 'Keşif', color: '#c4b5fd', icon: '🔍' },
    TAMAMLANDI: { label: 'Tamam', color: '#a78bfa', icon: '✅' },
};

const KONUM_CONFIG: Record<KonumGrubu, { label: string; color: string; icon: string }> = {
    YATMARIN: { label: 'Yatmarin', color: '#fbbf24', icon: '⚓' },
    NETSEL: { label: 'Netsel', color: '#60a5fa', icon: '🏠' },
    DIS_SERVIS: { label: 'Dış Servis', color: '#94a3b8', icon: '🚗' },
};

interface PlanningToolbarProps {
    totalCount: number;
    filteredCount: number;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: 'tarih' | 'konum' | 'durum';
    onSortChange: (value: 'tarih' | 'konum' | 'durum') => void;
    selectedDurumlar: ServisDurumu[];
    onDurumToggle: (durum: ServisDurumu) => void;
    selectedKonumlar: KonumGrubu[];
    onKonumToggle: (konum: KonumGrubu) => void;
    isAdmin: boolean;
    showBulkActions: boolean;
    onBulkActionsToggle: () => void;
}

const durumSirasi: ServisDurumu[] = [
    'RANDEVU_VERILDI', 'DEVAM_EDIYOR', 'PARCA_BEKLIYOR',
    'MUSTERI_ONAY_BEKLIYOR', 'RAPOR_BEKLIYOR', 'KESIF_KONTROL', 'TAMAMLANDI'
];

const konumListesi: KonumGrubu[] = ['YATMARIN', 'NETSEL', 'DIS_SERVIS'];

export default function PlanningToolbar({
    totalCount,
    filteredCount,
    searchQuery,
    onSearchChange,
    sortBy,
    onSortChange,
    selectedDurumlar,
    onDurumToggle,
    selectedKonumlar,
    onKonumToggle,
    isAdmin,
    showBulkActions,
    onBulkActionsToggle,
}: PlanningToolbarProps) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        📅 Servis Planlama
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {filteredCount} / {totalCount} servis gösteriliyor
                    </p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <Button
                            variant={showBulkActions ? 'destructive' : 'secondary'}
                            onClick={onBulkActionsToggle}
                        >
                            {showBulkActions ? '✕ Kapat' : '☑️ Toplu Düzenle'}
                        </Button>
                    )}
                    <Link href="/planlama/yeni">
                        <Button>➕ Yeni Servis</Button>
                    </Link>
                </div>
            </header>

            {/* Filters Card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                {/* Search + Sort Row */}
                <div className="flex flex-col md:flex-row gap-3">
                    <Input
                        type="text"
                        placeholder="🔍 Tekne adı veya açıklama ara..."
                        className="flex-1"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <Select
                        className="w-full md:w-40"
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as 'tarih' | 'konum' | 'durum')}
                        aria-label="Sıralama"
                    >
                        <option value="tarih">Tarihe Göre</option>
                        <option value="konum">Konuma Göre</option>
                        <option value="durum">Duruma Göre</option>
                    </Select>
                </div>

                {/* Status Filters */}
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Durum
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {durumSirasi.map((durum) => {
                            const config = DURUM_CONFIG[durum];
                            const isSelected = selectedDurumlar.includes(durum);
                            return (
                                <button
                                    key={durum}
                                    onClick={() => onDurumToggle(durum)}
                                    className={`
                    px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all
                    ${isSelected
                                            ? 'text-white'
                                            : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                                        }
                  `}
                                    style={{
                                        backgroundColor: isSelected ? config.color : undefined,
                                        borderColor: isSelected ? config.color : undefined,
                                    }}
                                >
                                    {config.icon} {config.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Location Filters */}
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Konum
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {konumListesi.map((konum) => {
                            const config = KONUM_CONFIG[konum];
                            const isSelected = selectedKonumlar.includes(konum);
                            return (
                                <button
                                    key={konum}
                                    onClick={() => onKonumToggle(konum)}
                                    className={`
                    px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all
                    ${isSelected
                                            ? 'text-white'
                                            : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                                        }
                  `}
                                    style={{
                                        backgroundColor: isSelected ? config.color : undefined,
                                        borderColor: isSelected ? config.color : undefined,
                                    }}
                                >
                                    {config.icon} {config.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
