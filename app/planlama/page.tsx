'use client';

import { useState, useEffect } from 'react';
import CompletionSidebar from '@/components/CompletionSidebar';
import ServiceDetailDrawer from '@/components/ServiceDetailDrawer';
import EmptyState from './components/EmptyState';
import { fetchServices, updateService, deleteService, createService } from '@/lib/api';
import { useAdmin } from '@/lib/admin-context';
import { Service, KonumGrubu, getKonumGrubu, KapanisRaporu, PersonelAtama, DURUM_CONFIG, ServisDurumu } from '@/types';
import {
    STATUS,
    StatusValue,
    ACTIVE_STATUSES,
    COMPLETED_STATUSES,
    getStatusPriority,
    ALL_STATUSES
} from '@/lib/status';
import { isYatmarin } from '@/lib/yatmarin';
import { Button } from '@/components/ui/button';
import { Icon } from '@/lib/icons';
import { toast } from 'sonner';

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
    const [sortBy, setSortBy] = useState<'tarih' | 'konum' | 'durum' | 'custom'>('tarih');

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [bulkDurum, setBulkDurum] = useState<StatusValue | ''>('');

    // Sidebar states
    const [completionService, setCompletionService] = useState<Service | null>(null);
    const [detailService, setDetailService] = useState<Service | null>(null);

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

    // Reset filters
    const resetFilters = () => {
        setSearchQuery('');
        setSelectedDurumlar([...ACTIVE_STATUSES]);
        setSelectedKonumlar(['YATMARIN', 'NETSEL', 'DIS_SERVIS']);
        setSortBy('tarih');
        setShowArchive(false);
        toast.info("Filtreler sıfırlandı");
    };

    // New Service Handler
    const handleAddService = () => {
        const newService: Service = {
            id: 'new', // Temporary ID
            tarih: new Date().toISOString().split('T')[0],
            saat: '09:00',
            durum: 'PLANLANDI-RANDEVU' as ServisDurumu,
            tekneAdi: '',
            adres: '',
            yer: '',
            servisAciklamasi: '',
            isTuru: 'paket',
            atananPersonel: [],
            bekleyenParcalar: [],
            taseronNotlari: '',
        };
        setDetailService(newService);
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
            setDetailService(service);
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

    const handlePartsSave = async (parcalar: any[], taseronNotu: string) => {
        if (detailService && detailService.id !== 'new') {
            const updated = { bekleyenParcalar: parcalar, taseronNotlari: taseronNotu };
            setServices(prev => prev.map(s =>
                s.id === detailService.id ? { ...s, ...updated } : s
            ));
            await updateService(detailService.id, updated);
        }
    };

    const handleDetailUpdate = async (updatedService: Service) => {
        if (updatedService.id === 'new') {
            // Create New Service
            try {
                // Remove 'id' before sending to API (API handles ID generation)
                const { id, ...serviceData } = updatedService;
                const newId = await createService(serviceData);
                const newServiceWithId = { ...updatedService, id: newId };
                setServices(prev => [newServiceWithId, ...prev]);
            } catch (error) {
                console.error("Failed to create service", error);
                alert("Servis oluşturulurken hata oluştu.");
                return; // Keep drawer open on error
            }
        } else {
            // Update Existing
            setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
            await updateService(updatedService.id, updatedService);
        }
        setDetailService(null);
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

    // Manual Order State
    const [manualOrder, setManualOrder] = useState<string[]>([]);

    const handleReorder = (newOrderedServices: Service[]) => {
        setManualOrder(newOrderedServices.map(s => s.id));
    };

    // Sorting with Yatmarin priority + Manual/Status/Date
    const sortedServices = [...filteredServices].sort((a, b) => {
        // 1. Yatmarin first (ALWAYS)
        const aYatmarin = isYatmarin(a.adres, a.yer);
        const bYatmarin = isYatmarin(b.adres, b.yer);

        if (aYatmarin && !bYatmarin) return -1;
        if (!aYatmarin && bYatmarin) return 1;

        // 2. Manual Order (if exists)
        if (manualOrder.length > 0) {
            const aIndex = manualOrder.indexOf(a.id);
            const bIndex = manualOrder.indexOf(b.id);

            // If both are in manual order, use that
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
        }

        // 3. Status priority
        const aPriority = getStatusPriority(a.durum as StatusValue);
        const bPriority = getStatusPriority(b.durum as StatusValue);

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // 4. Date (empty first, then oldest to newest)
        const aDate = a.tarih ? new Date(a.tarih).getTime() : 0;
        const bDate = b.tarih ? new Date(b.tarih).getTime() : 0;

        if (aDate === 0 && bDate !== 0) return -1;
        if (aDate !== 0 && bDate === 0) return 1;

        return aDate - bDate;
    });

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Servis Planlama</h1>
                    <p className="text-muted-foreground mt-1">Aktif iş emirleri ve servis takibi</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
                        <Icon name="arrowsClockwise" size={16} className="mr-2" />
                        Filtreleri Sıfırla
                    </Button>
                    <Button onClick={handleAddService} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                        <Icon name="plus" size={18} weight="bold" className="mr-2" />
                        Yeni Servis Ekle
                    </Button>
                </div>
            </div>

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
                onResetFilters={resetFilters}
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

            {/* Content */}
            {isLoading ? (
                <div className="rounded-xl border border-border bg-card p-16 text-center">
                    <div className="flex flex-col items-center gap-4 animate-pulse text-muted-foreground">
                        <Icon name="spinner" size={40} className="animate-spin text-primary" />
                        <span>Veriler yükleniyor...</span>
                    </div>
                </div>
            ) : sortedServices.length > 0 ? (
                /* Service Table */
                <ServiceTable
                    services={sortedServices}
                    showCheckbox={showBulkActions}
                    selectedIds={selectedIds}
                    isManualOrder={sortBy === 'custom'}
                    onToggleSelect={toggleSelectService}
                    onDurumChange={handleDurumChange}
                    onPartsClick={(service) => setDetailService(service)}
                    onReorder={handleReorder}
                />
            ) : (
                /* Empty State */
                <EmptyState
                    type={services.length === 0 ? 'no-data' : 'no-matches'}
                    onReset={resetFilters}
                    onAdd={handleAddService}
                />
            )}

            {/* Sidebars */}
            <CompletionSidebar
                service={completionService}
                isOpen={!!completionService}
                onClose={() => setCompletionService(null)}
                onComplete={handleComplete}
            />

            <ServiceDetailDrawer
                service={detailService}
                isOpen={!!detailService}
                onClose={() => setDetailService(null)}
                onUpdate={handleDetailUpdate}
                onPartsUpdate={handlePartsSave}
                currentUser={{ id: 'current-user', name: 'Mevcut Kullanıcı', email: 'user@example.com' }}
            />
        </div>
    );
}
