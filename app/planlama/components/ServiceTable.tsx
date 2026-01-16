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

import { Service } from '@/types';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon, IconName } from '@/lib/icons';

interface ServiceTableProps {
    services: Service[];
    showCheckbox: boolean;
    selectedIds: Set<string>;
    isManualOrder: boolean;
    onToggleSelect: (id: string) => void;
    onDurumChange: (service: Service, newDurum: StatusValue) => void;
    onPartsClick: (service: Service) => void;
    onReorder?: (newOrder: Service[]) => void;
}

export default function ServiceTable({
    services,
    showCheckbox,
    selectedIds,
    isManualOrder,
    onToggleSelect,
    onDurumChange,
    onPartsClick,
    onReorder
}: ServiceTableProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !onReorder) return;

        const activeService = services.find(s => s.id === active.id);
        const overService = services.find(s => s.id === over.id);

        if (!activeService || !overService) return;

        // Group Constraint Verification
        const activeIsYat = isYatmarin(activeService.adres, activeService.yer);
        const overIsYat = isYatmarin(overService.adres, overService.yer);

        if (activeIsYat !== overIsYat) {
            // Cancel drag if crossing groups (Yatmarin <-> Other)
            return;
        }

        const oldIndex = services.findIndex(s => s.id === active.id);
        const newIndex = services.findIndex(s => s.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            onReorder(arrayMove(services, oldIndex, newIndex));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 border-b border-border/60 hover:bg-muted/30">
                            {isManualOrder && <TableHead className="w-10 pl-4"></TableHead>}
                            {showCheckbox && <TableHead className="w-10"></TableHead>}
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Tarih</TableHead>
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Tekne</TableHead>
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Konum</TableHead>
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Servis</TableHead>
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Durum</TableHead>
                            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Ekip</TableHead>
                            <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 pr-6">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showCheckbox ? (isManualOrder ? 9 : 8) : (isManualOrder ? 8 : 7)} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                                            <Icon name="clipboardText" size={32} weight="duotone" />
                                        </div>
                                        <span>Gösterilecek servis bulunamadı</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <SortableContext
                                items={services.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {services.map((service) => (
                                    <SortableServiceRow
                                        key={service.id}
                                        service={service}
                                        showCheckbox={showCheckbox}
                                        isManualOrder={isManualOrder}
                                        isSelected={selectedIds.has(service.id)}
                                        onToggleSelect={() => onToggleSelect(service.id)}
                                        onDurumChange={(newDurum: StatusValue) => onDurumChange(service, newDurum)}
                                        onPartsClick={() => onPartsClick(service)}
                                    />
                                ))}
                            </SortableContext>
                        )}
                    </TableBody>
                </Table>
            </div>
        </DndContext>
    );
}

// ... SortableServiceRow remains mostly same

// SortableServiceRow Wrapper
function SortableServiceRow({ service, ...props }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <ServiceRow
            ref={setNodeRef}
            style={style}
            isDragging={isDragging}
            dragHandleProps={props.isManualOrder ? { ...attributes, ...listeners } : {}}
            service={service}
            {...props}
        />
    );
}

interface ServiceRowInnerProps {
    service: Service;
    showCheckbox: boolean;
    isManualOrder: boolean;
    isSelected: boolean;
    onToggleSelect: () => void;
    onDurumChange: (newDurum: StatusValue) => void;
    onPartsClick: () => void;
    dragHandleProps?: any;
    style?: any;
    ref?: any;
    isDragging?: boolean;
}

function ServiceRow({
    service,
    showCheckbox,
    isManualOrder,
    isSelected,
    onToggleSelect,
    onDurumChange,
    onPartsClick,
    dragHandleProps,
    style,
    ref,
    isDragging
}: ServiceRowInnerProps) {
    const [showDurumDropdown, setShowDurumDropdown] = useState(false);
    const isYatmarinService = isYatmarin(service.adres, service.yer);
    const statusMeta = STATUS_META[service.durum as StatusValue] || STATUS_META[STATUS.PLANLANDI_RANDEVU];
    const isCompleted = isCompletedStatus(service.durum as StatusValue);

    const responsibleCount = service.closureTeam?.responsibles?.length || 0;
    const supportCount = service.closureTeam?.supports?.length || 0;
    const responsibleName = service.atananPersonel?.find(p => p.rol === 'sorumlu')?.personnelAd;

    return (
        <TableRow
            ref={ref}
            style={style}
            className={`
                group border-b border-border/40 transition-colors
            ${isSelected ? 'bg-primary/5' : ''}
            ${isYatmarinService
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/80 dark:hover:bg-amber-950/40'
                    : 'bg-card hover:bg-muted/30'}
            ${isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}
            ${isDragging ? 'shadow-2xl opacity-80 bg-background z-50 ring-2 ring-primary scale-[1.02]' : ''}
            `}
        >
            {isManualOrder && (
                <TableCell>
                    <button
                        className="cursor-grab hover:text-foreground text-muted-foreground/50 p-1 rounded hover:bg-muted"
                        {...dragHandleProps}
                        aria-label="Sıralamak için sürükleyin"
                    >
                        <Icon name="dotsSixVertical" size={16} />
                    </button>
                </TableCell>
            )}

            {showCheckbox && (
                <TableCell>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggleSelect}
                        className="w-4 h-4 rounded border-border"
                        aria-label="Satır seç"
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
                    href={`/ planlama / ${service.id} `}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                    {service.tekneAdi}
                    {isYatmarinService && (
                        <span className="ml-2 text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Icon name="anchor" size={10} weight="fill" /> YATMARİN
                        </span>
                    )}
                </Link>
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
                            <Icon name={statusMeta.icon as IconName} size={14} weight="duotone" />
                            {statusMeta.label}
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
    w - full text - left px - 3 py - 2 text - sm rounded - md transition - colors flex items - center gap - 2
                                                ${isCurrentStatus
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-accent text-foreground'
                                                }
                                                ${isCompletedOpt && !isCurrentStatus ? 'opacity-60' : ''}
    `}
                                        >
                                            <Icon name={meta.icon as IconName} size={16} weight="duotone" />
                                            {meta.label}
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
                                <span className="text-xs flex items-center gap-1">
                                    <Icon name="user" size={12} weight="bold" /> Sorumlu: <strong>{responsibleCount}</strong>
                                </span>
                            )}
                            {supportCount > 0 && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Icon name="users" size={12} /> Destek: {supportCount}
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
                <Button variant="secondary" size="sm" onClick={onPartsClick}>
                    <Icon name="eye" size={16} className="mr-1" />
                    Düzenle
                </Button>
            </TableCell>
        </TableRow>
    );
}
