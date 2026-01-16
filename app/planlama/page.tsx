'use client';

import { useState, useEffect } from 'react';
import CompletionSidebar from '@/components/CompletionSidebar';
import PartsSidebar from '@/components/PartsSidebar';
import { fetchServices, updateService, deleteService } from '@/lib/api';
import { useAdmin } from '@/lib/admin-context';
import { Service, KonumGrubu, getKonumGrubu, KapanisRaporu, ParcaBekleme, PersonelAtama } from '@/types';
import {
    STATUS,
    StatusValue,
    ACTIVE_STATUSES,
    COMPLETED_STATUSES,
    isActiveStatus,
    getStatusPriority
} from '@/lib/status';
import { isYatmarin } from '@/lib/yatmarin';

// Modular Components
import PlanningToolbar from './components/PlanningToolbar';
import BulkActionsBar from './components/BulkActionsBar';
import ServiceTable from './components/ServiceTable';

export default function PlanlamaPage() {
    const { isAdmin } = useAdmin();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Archive toggle - default OFF (only active services)
    const [showArchive, setShowArchive] = useState(false);

    // Filters - default to active statuses only
    const [selectedDurumlar, setSelectedDurumlar] = useState<StatusValue[]>([...ACTIVE_STATUSES]);
    const [selectedKonumlar, setSelectedKonumlar] = useState<KonumGrubu[]>(['YATMARIN', 'NETSEL', 'DIS_SERVIS']);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'tarih' | 'konum' | 'durum'>('tarih');

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [bulkDurum, setBulkDurum] = useState<StatusValue | ''>('');

    // Sidebar states
    const [completionService, setCompletionService] = useState<Service | null>(null);
    const [partsService, setPartsService] = useState<Service | null>(null);

    useEffect(() => {
        loadServices();
    }, []);

    // When archive toggle changes, update selected durumlar
    useEffect(() => {
        if (showArchive) {
            // Include completed statuses when archive is shown
            setSelectedDurumlar(prev => {
                const newSet = new Set([...prev, ...COMPLETED_STATUSES]);
                return Array.from(newSet) as StatusValue[];
            });
        } else {
            // Exclude completed statuses when archive is hidden
            setSelectedDurumlar(prev =>
                prev.filter(d => !COMPLETED_STATUSES.includes(d))
            );
        }
    }, [showArchive]);

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const data = await fetchServices();
            setServices(data);
        } catch (error) {
            console.error('Failed to load services:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter handlers
    const toggleDurum = (durum: StatusValue) => {
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

    const handleDurumChange = async (service: Service, newDurum: any) => {
        const normalized = newDurum as StatusValue;

        if (normalized === STATUS.TAMAMLANDI || normalized === STATUS.KESIF_KONTROL) {
            setCompletionService(service);
        } else if (normalized === STATUS.PARCA_BEKLIYOR) {
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
            const updated = { durum: STATUS.TAMAMLANDI, kapanisRaporu: rapor, atananPersonel: personelAtamalari };
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

    // Filtering with status normalization
    const filteredServices = services.filter(s => {
        // Normalize service status for comparison
        const serviceStatus = s.durum as StatusValue;
        const durumMatch = selectedDurumlar.includes(serviceStatus);
        const konumMatch = selectedKonumlar.includes(getKonumGrubu(s.adres));
        const searchMatch =
            s.tekneAdi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.servisAciklamasi.toLowerCase().includes(searchQuery.toLowerCase());
        return durumMatch && konumMatch && searchMatch;
    });

    // Sorting with Yatmarin priority + Status priority + Date
    const sortedServices = [...filteredServices].sort((a, b) => {
        // 1. Yatmarin first
        const aYatmarin = isYatmarin(a.adres, a.yer);
        const bYatmarin = isYatmarin(b.adres, b.yer);

        if (aYatmarin && !bYatmarin) return -1;
        if (!aYatmarin && bYatmarin) return 1;

        // 2. Status priority
        const aPriority = getStatusPriority(a.durum as StatusValue);
        const bPriority = getStatusPriority(b.durum as StatusValue);

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // 3. Date (empty first, then oldest to newest)
        const aDate = a.tarih ? new Date(a.tarih).getTime() : 0;
        const bDate = b.tarih ? new Date(b.tarih).getTime() : 0;

        if (aDate === 0 && bDate !== 0) return -1;
        if (aDate !== 0 && bDate === 0) return 1;

        return aDate - bDate;
    });

    return (
        <div className="p-6 space-y-4">
            {/* Toolbar with filters */}
            <PlanningToolbar
                totalCount={services.length}
                filteredCount={filteredServices.length}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                selectedDurumlar={selectedDurumlar}
                onDurumToggle={toggleDurum}
                selectedKonumlar={selectedKonumlar}
                onKonumToggle={toggleKonum}
                isAdmin={isAdmin}
                showBulkActions={showBulkActions}
                onBulkActionsToggle={() => setShowBulkActions(!showBulkActions)}
                showArchive={showArchive}
                onArchiveToggle={() => setShowArchive(!showArchive)}
            />

            {/* Bulk Actions Bar */}
            {showBulkActions && (
                <BulkActionsBar
                    selectedCount={selectedIds.size}
                    totalCount={sortedServices.length}
                    isAllSelected={selectedIds.size === sortedServices.length && sortedServices.length > 0}
                    onSelectAll={toggleSelectAll}
                    bulkDurum={bulkDurum}
                    onBulkDurumChange={setBulkDurum}
                    onApplyBulkDurum={handleBulkDurumChange}
                    onBulkDelete={handleBulkDelete}
                />
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <div className="animate-pulse text-muted-foreground">
                        <span className="text-4xl block mb-2">⏳</span>
                        <span>Servisler yükleniyor...</span>
                    </div>
                </div>
            ) : (
                /* Service Table */
                <ServiceTable
                    services={sortedServices}
                    showCheckbox={showBulkActions}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelectService}
                    onDurumChange={handleDurumChange}
                    onPartsClick={(service) => setPartsService(service)}
                />
            )}

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
