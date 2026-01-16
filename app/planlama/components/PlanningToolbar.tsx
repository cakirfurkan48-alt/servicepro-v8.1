'use client';

import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    STATUS,
    StatusValue,
    STATUS_META,
    ACTIVE_STATUSES,
    ARCHIVE_STATUSES,
    ALL_STATUSES
} from '@/lib/status';

type KonumGrubu = 'YATMARIN' | 'NETSEL' | 'DIS_SERVIS';

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
    selectedDurumlar: StatusValue[];
    onDurumToggle: (durum: StatusValue) => void;
    selectedKonumlar: KonumGrubu[];
    onKonumToggle: (konum: KonumGrubu) => void;
    isAdmin: boolean;
    showBulkActions: boolean;
    onBulkActionsToggle: () => void;
    showArchive: boolean;
    onArchiveToggle: () => void;
}

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
    showArchive,
    onArchiveToggle,
}: PlanningToolbarProps) {
    // Show active statuses, optionally show completed (archive)
    const visibleStatuses = showArchive ? ALL_STATUSES : ACTIVE_STATUSES;

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
                {/* Search + Sort + Archive Toggle Row */}
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

                    {/* Archive Toggle */}
                    <button
                        onClick={onArchiveToggle}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all whitespace-nowrap
                            ${showArchive
                                ? 'bg-violet-500/10 text-violet-600 border-violet-500/30'
                                : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                            }
                        `}
                    >
                        {showArchive ? '📁 Arşiv Gösteriliyor' : '📁 Arşivi Göster'}
                    </button>
                </div>

                {/* Status Filters - Using STATUS_META for full labels */}
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Durum
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {visibleStatuses.map((durum) => {
                            const meta = STATUS_META[durum];
                            const isSelected = selectedDurumlar.includes(durum);
                            const isArchived = ARCHIVE_STATUSES.includes(durum);

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
                                        ${isArchived && !isSelected ? 'opacity-60' : ''}
                                    `}
                                    style={{
                                        backgroundColor: isSelected ? meta.bg : undefined,
                                        borderColor: isSelected ? meta.bg : undefined,
                                        color: isSelected ? meta.text : undefined,
                                    }}
                                >
                                    {meta.icon} {meta.label}
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

export type { KonumGrubu };
