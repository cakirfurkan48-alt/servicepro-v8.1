'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { isYatmarin } from '@/lib/yatmarin';
import {
    STATUS,
    StatusValue,
    STATUS_META,
    ALL_STATUSES,
    COMPLETED_STATUSES,
    isCompletedStatus
} from '@/lib/status';

interface Service {
    id: string;
    tarih: string;
    saat?: string;
    tekneAdi: string;
    adres: string;
    yer?: string;
    servisAciklamasi: string;
    durum: string; // Can be legacy or new format
    atananPersonel?: { rol: string; personnelAd: string }[];
    closureTeam?: {
        responsibles: string[];
        supports: string[];
    };
}

interface ServiceTableProps {
    services: Service[];
    showCheckbox: boolean;
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onDurumChange: (service: Service, newDurum: StatusValue) => void;
    onPartsClick: (service: Service) => void;
}

export default function ServiceTable({
    services,
    showCheckbox,
    selectedIds,
    onToggleSelect,
    onDurumChange,
    onPartsClick,
}: ServiceTableProps) {
    return (
        <div className="rounded-xl border border-border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        {showCheckbox && <TableHead className="w-10"></TableHead>}
                        <TableHead>Tarih</TableHead>
                        <TableHead>Tekne</TableHead>
                        <TableHead>Konum</TableHead>
                        <TableHead>Servis</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Ekip</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={showCheckbox ? 8 : 7} className="text-center py-12">
                                <div className="text-muted-foreground">
                                    <span className="text-4xl block mb-2">📭</span>
                                    <span>Gösterilecek servis bulunamadı</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        services.map((service) => (
                            <ServiceRow
                                key={service.id}
                                service={service}
                                showCheckbox={showCheckbox}
                                isSelected={selectedIds.has(service.id)}
                                onToggleSelect={() => onToggleSelect(service.id)}
                                onDurumChange={(newDurum) => onDurumChange(service, newDurum)}
                                onPartsClick={() => onPartsClick(service)}
                            />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

interface ServiceRowProps {
    service: Service;
    showCheckbox: boolean;
    isSelected: boolean;
    onToggleSelect: () => void;
    onDurumChange: (durum: StatusValue) => void;
    onPartsClick: () => void;
}

function ServiceRow({
    service,
    showCheckbox,
    isSelected,
    onToggleSelect,
    onDurumChange,
    onPartsClick,
}: ServiceRowProps) {
    const [showDurumDropdown, setShowDurumDropdown] = useState(false);
    const isYatmarinService = isYatmarin(service.adres, service.yer);

    // Get status meta (handle both legacy and new formats)
    const statusMeta = STATUS_META[service.durum as StatusValue] || STATUS_META[STATUS.PLANLANDI_RANDEVU];
    const isCompleted = isCompletedStatus(service.durum as StatusValue);

    // Closure team summary
    const responsibleCount = service.closureTeam?.responsibles?.length || 0;
    const supportCount = service.closureTeam?.supports?.length || 0;
    const responsibleName = service.atananPersonel?.find(p => p.rol === 'sorumlu')?.personnelAd;

    return (
        <TableRow
            className={`
                ${isSelected ? 'bg-primary/10' : ''}
                ${isYatmarinService ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-sky-50/50 dark:bg-sky-950/10'}
                ${isCompleted ? 'opacity-60' : ''}
            `}
        >
            {showCheckbox && (
                <TableCell>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggleSelect}
                        className="w-4 h-4 rounded border-border"
                    />
                </TableCell>
            )}

            <TableCell>
                <div className="font-semibold text-foreground">{service.tarih}</div>
                {service.saat && (
                    <div className="text-xs text-muted-foreground">{service.saat}</div>
                )}
            </TableCell>

            <TableCell>
                <Link
                    href={`/planlama/${service.id}`}
                    className="font-medium text-primary hover:underline"
                >
                    {service.tekneAdi}
                </Link>
                {isYatmarinService && (
                    <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded">
                        ⚓ YATMARİN
                    </span>
                )}
            </TableCell>

            <TableCell>
                <div className="text-sm">{service.adres}</div>
                {service.yer && (
                    <div className="text-xs text-muted-foreground">{service.yer}</div>
                )}
            </TableCell>

            <TableCell>
                <div
                    className="max-w-[200px] truncate text-sm"
                    title={service.servisAciklamasi}
                >
                    {service.servisAciklamasi}
                </div>
            </TableCell>

            <TableCell>
                <div className="relative">
                    <button
                        onClick={() => setShowDurumDropdown(!showDurumDropdown)}
                        className="cursor-pointer"
                    >
                        <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                                backgroundColor: statusMeta.bg,
                                color: statusMeta.text
                            }}
                        >
                            {statusMeta.icon} {statusMeta.label}
                        </span>
                    </button>

                    {showDurumDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDurumDropdown(false)}
                            />
                            <div className="absolute top-full left-0 mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg min-w-[200px] p-1 max-h-[300px] overflow-y-auto">
                                {ALL_STATUSES.map((status) => {
                                    const meta = STATUS_META[status];
                                    const isCurrentStatus = service.durum === status;
                                    const isCompletedOpt = COMPLETED_STATUSES.includes(status);

                                    return (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                onDurumChange(status);
                                                setShowDurumDropdown(false);
                                            }}
                                            className={`
                                                w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                                                ${isCurrentStatus
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-accent text-foreground'
                                                }
                                                ${isCompletedOpt && !isCurrentStatus ? 'opacity-60' : ''}
                                            `}
                                        >
                                            {meta.icon} {meta.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </TableCell>

            <TableCell>
                <div className="text-sm">
                    {responsibleCount > 0 || supportCount > 0 ? (
                        <div className="flex flex-col gap-0.5">
                            {responsibleCount > 0 && (
                                <span className="text-xs">
                                    👤 Sorumlu: <strong>{responsibleCount}</strong>
                                </span>
                            )}
                            {supportCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                    🤝 Destek: {supportCount}
                                </span>
                            )}
                        </div>
                    ) : responsibleName ? (
                        <span>{responsibleName}</span>
                    ) : (
                        <span className="text-muted-foreground">Atanmadı</span>
                    )}
                </div>
            </TableCell>

            <TableCell className="text-right">
                <Link href={`/planlama/${service.id}`}>
                    <Button variant="secondary" size="sm">
                        👁️ Düzenle
                    </Button>
                </Link>
            </TableCell>
        </TableRow>
    );
}
