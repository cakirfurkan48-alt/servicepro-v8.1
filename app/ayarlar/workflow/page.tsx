'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { STATUS, STATUS_META, StatusValue } from '@/lib/status';

interface ConfigStatus {
    id: string;
    key: string;
    label: string;
    color: string;
    sortOrder: number;
    active: boolean;
}

// Mock data - will be replaced with API calls
const MOCK_STATUSES: ConfigStatus[] = [
    { id: '1', key: 'PLANLANDI_RANDEVU', label: 'Planlandı/Randevu', color: '#e2f0d9', sortOrder: 1, active: true },
    { id: '2', key: 'DEVAM_EDIYOR', label: 'Devam Ediyor', color: '#d9ead3', sortOrder: 2, active: true },
    { id: '3', key: 'PARCA_BEKLIYOR', label: 'Parça Bekliyor', color: '#cfe2f3', sortOrder: 3, active: true },
    { id: '4', key: 'ONAY_BEKLIYOR', label: 'Onay Bekliyor', color: '#bdd7ee', sortOrder: 4, active: true },
    { id: '5', key: 'RAPOR_BEKLIYOR', label: 'Rapor Bekliyor', color: '#9dc3e6', sortOrder: 5, active: true },
    { id: '6', key: 'TAMAMLANDI', label: 'Tamamlandı', color: '#ead1dc', sortOrder: 6, active: true },
    { id: '7', key: 'KESIF_KONTROL', label: 'Keşif/Kontrol', color: '#e6e0f8', sortOrder: 7, active: true },
    { id: '8', key: 'IPTAL', label: 'İptal', color: '#e5e7eb', sortOrder: 8, active: true },
];

export default function WorkflowBuilderPage() {
    const [statuses, setStatuses] = useState<ConfigStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ label: '', color: '' });

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setStatuses(MOCK_STATUSES);
            setIsLoading(false);
        }, 300);
    }, []);

    const handleEdit = (status: ConfigStatus) => {
        setEditingId(status.id);
        setEditForm({ label: status.label, color: status.color });
    };

    const handleSave = async (id: string) => {
        setStatuses(prev => prev.map(s =>
            s.id === id ? { ...s, label: editForm.label, color: editForm.color } : s
        ));
        setEditingId(null);
        // TODO: API call to save
    };

    const handleToggleActive = async (id: string) => {
        setStatuses(prev => prev.map(s =>
            s.id === id ? { ...s, active: !s.active } : s
        ));
        // TODO: API call to save
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newStatuses = [...statuses];
        [newStatuses[index - 1], newStatuses[index]] = [newStatuses[index], newStatuses[index - 1]];
        newStatuses.forEach((s, i) => s.sortOrder = i + 1);
        setStatuses(newStatuses);
    };

    const handleMoveDown = (index: number) => {
        if (index === statuses.length - 1) return;
        const newStatuses = [...statuses];
        [newStatuses[index], newStatuses[index + 1]] = [newStatuses[index + 1], newStatuses[index]];
        newStatuses.forEach((s, i) => s.sortOrder = i + 1);
        setStatuses(newStatuses);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        🔄 Workflow Builder
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Servis durumlarını ve geçiş kurallarını yönetin
                    </p>
                </div>
                <Button>➕ Yeni Durum Ekle</Button>
            </header>

            {/* Info Card */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                        <h3 className="font-medium text-foreground">Durum Yönetimi</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Durumlar iş akışınızın temelini oluşturur. Sıralamayı değiştirmek için ok tuşlarını kullanın.
                            Aktif olmayan durumlar yeni servislerde seçilemez ancak mevcut servisler için görünür kalır.
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Table */}
            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-16">Sıra</TableHead>
                            <TableHead>Durum Adı</TableHead>
                            <TableHead>Anahtar</TableHead>
                            <TableHead>Renk</TableHead>
                            <TableHead>Aktif</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <span className="text-muted-foreground">Yükleniyor...</span>
                                </TableCell>
                            </TableRow>
                        ) : (
                            statuses.map((status, index) => (
                                <TableRow key={status.id} className={!status.active ? 'opacity-50' : ''}>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleMoveUp(index)}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-muted rounded disabled:opacity-30"
                                            >
                                                ⬆️
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(index)}
                                                disabled={index === statuses.length - 1}
                                                className="p-1 hover:bg-muted rounded disabled:opacity-30"
                                            >
                                                ⬇️
                                            </button>
                                            <span className="text-sm text-muted-foreground ml-1">{status.sortOrder}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {editingId === status.id ? (
                                            <Input
                                                value={editForm.label}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                                                className="w-full max-w-xs"
                                            />
                                        ) : (
                                            <span className="font-medium">{status.label}</span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {status.key}
                                        </code>
                                    </TableCell>

                                    <TableCell>
                                        {editingId === status.id ? (
                                            <Input
                                                type="color"
                                                value={editForm.color}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                                                className="w-16 h-8 p-0 border-0"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded border border-border bg-[var(--status-color)]"
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    style={{ '--status-color': status.color } as any}
                                                />
                                                <span className="text-xs text-muted-foreground">{status.color}</span>
                                            </div>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <button
                                            onClick={() => handleToggleActive(status.id)}
                                            className={`
                        px-3 py-1 rounded-full text-xs font-medium transition-colors
                        ${status.active
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-muted text-muted-foreground'
                                                }
                      `}
                                        >
                                            {status.active ? '✓ Aktif' : '○ Pasif'}
                                        </button>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        {editingId === status.id ? (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" onClick={() => handleSave(status.id)}>
                                                    ✓ Kaydet
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                                                    İptal
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="secondary" onClick={() => handleEdit(status)}>
                                                ✏️ Düzenle
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Transition Rules Section */}
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    🔀 Durum Geçiş Kuralları
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Hangi durumdan hangi duruma geçiş yapılabileceğini ve bu geçiş için gereken koşulları belirleyin.
                </p>

                <div className="bg-muted/30 rounded-lg p-8 text-center">
                    <span className="text-4xl block mb-2">🚧</span>
                    <p className="text-muted-foreground">
                        Geçiş kuralları editörü yakında eklenecek...
                    </p>
                </div>
            </div>
        </div>
    );
}
