import { Icon, IconName } from '@/lib/icons';
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

const KONUM_CONFIG: Record<KonumGrubu, { label: string; color: string; icon: IconName }> = {
    YATMARIN: { label: 'Yatmarin', color: '#fbbf24', icon: 'anchor' },
    NETSEL: { label: 'Netsel', color: '#60a5fa', icon: 'house' },
    DIS_SERVIS: { label: 'Dış Servis', color: '#94a3b8', icon: 'car' },
};

interface PlanningToolbarProps {
    totalCount: number;
    filteredCount: number;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    sortBy: 'tarih' | 'konum' | 'durum' | 'custom';
    onSortChange: (value: 'tarih' | 'konum' | 'durum' | 'custom') => void;
    selectedDurumlar: StatusValue[];
    onDurumToggle: (durum: StatusValue) => void;
    selectedKonumlar: KonumGrubu[];
    onKonumToggle: (konum: KonumGrubu) => void;
    isAdmin: boolean;
    showBulkActions: boolean;
    onBulkActionsToggle: () => void;
    showArchive: boolean;
    onArchiveToggle: () => void;
    onResetFilters: () => void;
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
    onResetFilters,
}: PlanningToolbarProps) {
    // Show active statuses, optionally show completed (archive)
    const visibleStatuses = showArchive ? ALL_STATUSES : ACTIVE_STATUSES;

    return (
        <div className="space-y-4">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Icon name="calendarCheck" size={28} weight="duotone" className="text-primary" />
                        Servis Planlama
                    </h1>
                    <p className="text-sm text-muted-foreground ml-9 mt-1">
                        {filteredCount} / {totalCount} aktif servis yönetiliyor
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="text-muted-foreground hover:text-foreground hidden md:flex"
                    >
                        <Icon name="arrowsCounterClockwise" size={16} className="mr-2" />
                        Filtreleri Sıfırla
                    </Button>

                    {isAdmin && (
                        <Button
                            variant={showBulkActions ? 'destructive' : 'outline'}
                            onClick={onBulkActionsToggle}
                            className="hidden md:flex"
                        >
                            {showBulkActions ? (
                                <>
                                    <Icon name="x" size={16} className="mr-2" />
                                    Vazgeç
                                </>
                            ) : (
                                <>
                                    <Icon name="checks" size={16} className="mr-2" />
                                    Seç
                                </>
                            )}
                        </Button>
                    )}
                    <Link href="/planlama/yeni">
                        <Button className="shadow-lg shadow-primary/20">
                            <Icon name="plus" size={16} weight="bold" className="mr-2" />
                            Yeni Servis
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Filters Card */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6 shadow-sm">
                {/* Search + Sort + Archive Toggle Row */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Icon name="magnifyingGlass" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Tekne, personel veya notlarda ara..."
                            className="pl-10 h-10 w-full bg-background border-input/60 focus:border-primary/50 transition-all text-base md:text-sm"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Select
                        className="w-full md:w-40"
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as 'tarih' | 'konum' | 'durum' | 'custom')}
                        aria-label="Sıralama"
                    >
                        <option value="tarih">Tarihe Göre</option>
                        <option value="konum">Konuma Göre</option>
                        <option value="durum">Duruma Göre</option>
                        <option value="custom">Manuel Sıralama</option>
                    </Select>

                    {/* Archive Toggle */}
                    <button
                        onClick={onArchiveToggle}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all whitespace-nowrap flex items-center gap-2
                            ${showArchive
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                            }
                        `}
                    >
                        <Icon name="folderOpen" size={18} weight={showArchive ? 'fill' : 'regular'} />
                        {showArchive ? 'Arşiv Gösteriliyor' : 'Arşivi Göster'}
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
                                        px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all flex items-center gap-1.5
                                        ${isSelected
                                            ? 'text-white'
                                            : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                                        }
                                        ${isArchived && !isSelected ? 'opacity-60' : ''}
                                    `}
                                    style={{
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        backgroundColor: isSelected ? meta.bg : undefined,
                                        borderColor: isSelected ? meta.bg : undefined,
                                        color: isSelected ? meta.text : undefined,
                                    }}
                                >
                                    <Icon name={meta.icon as IconName} size={14} weight="duotone" />
                                    {meta.label}
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
                                        px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all flex items-center gap-1.5
                                        ${isSelected
                                            ? 'text-white'
                                            : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                                        }
                                    `}
                                    style={{
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        backgroundColor: isSelected ? config.color : undefined,
                                        borderColor: isSelected ? config.color : undefined,
                                    }}
                                >
                                    <Icon name={config.icon} size={14} weight="duotone" />
                                    {config.label}
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
