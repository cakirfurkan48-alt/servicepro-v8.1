'use client';

import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

type ServisDurumu =
    | 'RANDEVU_VERILDI'
    | 'DEVAM_EDIYOR'
    | 'PARCA_BEKLIYOR'
    | 'MUSTERI_ONAY_BEKLIYOR'
    | 'RAPOR_BEKLIYOR'
    | 'KESIF_KONTROL'
    | 'TAMAMLANDI';

const DURUM_OPTIONS: { value: ServisDurumu; label: string }[] = [
    { value: 'RANDEVU_VERILDI', label: 'Randevu Verildi' },
    { value: 'DEVAM_EDIYOR', label: 'Devam Ediyor' },
    { value: 'PARCA_BEKLIYOR', label: 'Parça Bekliyor' },
    { value: 'MUSTERI_ONAY_BEKLIYOR', label: 'Onay Bekliyor' },
    { value: 'RAPOR_BEKLIYOR', label: 'Rapor Bekliyor' },
    { value: 'KESIF_KONTROL', label: 'Keşif/Kontrol' },
    { value: 'TAMAMLANDI', label: 'Tamamlandı' },
];

interface BulkActionsBarProps {
    selectedCount: number;
    totalCount: number;
    isAllSelected: boolean;
    onSelectAll: () => void;
    bulkDurum: ServisDurumu | '';
    onBulkDurumChange: (value: ServisDurumu | '') => void;
    onApplyBulkDurum: () => void;
    onBulkDelete: () => void;
}

export default function BulkActionsBar({
    selectedCount,
    totalCount,
    isAllSelected,
    onSelectAll,
    bulkDurum,
    onBulkDurumChange,
    onApplyBulkDurum,
    onBulkDelete,
}: BulkActionsBarProps) {
    return (
        <div className="rounded-xl border-2 border-amber-500/50 bg-card p-4 mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isAllSelected && totalCount > 0}
                            onChange={onSelectAll}
                            className="w-4 h-4 rounded border-border"
                        />
                        <span className="font-semibold text-foreground">Tümünü Seç</span>
                    </label>
                    <span className="text-sm text-muted-foreground">
                        {selectedCount} servis seçili
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Durum:</label>
                        <Select
                            className="w-44"
                            value={bulkDurum}
                            onChange={(e) => onBulkDurumChange(e.target.value as ServisDurumu | '')}
                            aria-label="Toplu durum değiştir"
                        >
                            <option value="">Seçin...</option>
                            {DURUM_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </Select>
                        <Button
                            onClick={onApplyBulkDurum}
                            disabled={!bulkDurum || selectedCount === 0}
                            size="sm"
                        >
                            Uygula
                        </Button>
                    </div>

                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onBulkDelete}
                        disabled={selectedCount === 0}
                    >
                        🗑️ Sil ({selectedCount})
                    </Button>
                </div>
            </div>
        </div>
    );
}
