'use client';

import { useState, useEffect } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { DrawerHeader, DrawerFooter } from '@/components/drawer/DrawerLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AuditLog, { createAuditEntry } from '@/components/AuditLog';
import { Service, ParcaBekleme, PersonelAtama, TUM_PERSONEL, UNVAN_CONFIG } from '@/types';
import { ALL_STATUSES, STATUS_META, COMPLETED_STATUSES } from '@/lib/status';
import { Icon } from '@/lib/icons';
import { useAdmin } from '@/lib/admin-context';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface UIParcaBekleme extends ParcaBekleme { }

interface ServiceDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
    onUpdate: (updatedService: Service) => void;
    onPartsUpdate?: (parcalar: ParcaBekleme[], notlar: string) => void;
    currentUser: { id: string; name: string; email: string };
}

export default function ServiceDetailDrawer({
    isOpen,
    onClose,
    service,
    onUpdate,
    onPartsUpdate,
    currentUser
}: ServiceDetailDrawerProps) {
    const { isAdmin } = useAdmin();
    const [activeTab, setActiveTab] = useState('genel');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Service>>({});
    const [parcalar, setParcalar] = useState<ParcaBekleme[]>([]);
    const [taseronNotu, setTaseronNotu] = useState('');
    const [personelSecimleri, setPersonelSecimleri] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        if (service) {
            setFormData(service);
            setParcalar(service.bekleyenParcalar || [{ parcaAdi: '', miktar: 1 }]);
            setTaseronNotu(service.taseronNotlari || '');

            const activeTechs = TUM_PERSONEL.filter(p => p.rol === 'teknisyen' && p.aktif);
            const initialTeam = activeTechs.map(p => {
                const existing = service.atananPersonel?.find(ap => ap.personnelId === p.id);
                return {
                    personnelId: p.id,
                    personnelAd: p.ad,
                    unvan: p.unvan,
                    secili: !!existing,
                    rol: existing?.rol || 'destek',
                };
            });
            setPersonelSecimleri(initialTeam);
        }
    }, [service]);

    if (!service) return null;

    const handleSaveGeneral = () => {
        if (!service) return;

        const changes: any = {};
        if (formData.tekneAdi !== service.tekneAdi) changes.tekneAdi = { from: service.tekneAdi, to: formData.tekneAdi };
        if (formData.durum !== service.durum) changes.durum = { from: service.durum, to: formData.durum };

        const log = createAuditEntry(
            service.id,
            'FIELD_CHANGE',
            currentUser.id,
            currentUser.name,
            { changes }
        );
        setAuditLogs(prev => [log, ...prev]);

        const atananPersonel: PersonelAtama[] = personelSecimleri
            .filter(p => p.secili)
            .map(p => ({
                personnelId: p.personnelId,
                personnelAd: p.personnelAd,
                rol: p.rol,
                unvan: p.unvan
            }));

        onUpdate({ ...service, ...formData, atananPersonel } as Service);
        setEditMode(false);
    };

    const togglePersonel = (id: string) => {
        setPersonelSecimleri(prev => prev.map(p =>
            p.personnelId === id ? { ...p, secili: !p.secili } : p
        ));
    };

    const setPersonelRol = (id: string, rol: 'sorumlu' | 'destek') => {
        setPersonelSecimleri(prev => prev.map(p =>
            p.personnelId === id ? { ...p, rol } : p
        ));
    };

    const StatusSelect = () => (
        <Select
            value={formData.durum}
            onChange={(e) => setFormData({ ...formData, durum: e.target.value as any })}
            disabled={!editMode}
            title="İş Durumu"
            aria-label="İş Durumu"
        >
            {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
        </Select>
    );

    const updateParca = (index: number, field: keyof UIParcaBekleme, value: any) => {
        const updated = [...parcalar];
        updated[index] = { ...updated[index], [field]: value };
        setParcalar(updated);
    };

    const addParca = () => setParcalar([...parcalar, { parcaAdi: '', miktar: 1, status: 'NEEDED' }]);
    const removeParca = (index: number) => setParcalar(parcalar.filter((_, i) => i !== index));

    const handleSaveParts = () => {
        onPartsUpdate?.(parcalar, taseronNotu);
    };

    const handleSave = () => {
        if (activeTab === 'genel') {
            handleSaveGeneral();
        } else if (activeTab === 'parcalar') {
            handleSaveParts();
        }
    };

    const handleCancel = () => {
        if (activeTab === 'genel') {
            setEditMode(false);
            setFormData(service || {});
        } else if (activeTab === 'parcalar') {
            setParcalar(service?.bekleyenParcalar || []);
        }
    };

    const showFooter = (activeTab === 'genel' && editMode) || activeTab === 'parcalar';

    return (
        <Drawer open={isOpen} onOpenChange={(o) => {
            if (!o) {
                onClose();
                setEditMode(false);
            }
        }}>
            <DrawerContent className="h-[95vh] flex flex-col">
                <DrawerHeader
                    title={service.tekneAdi}
                    subtitle={service.isTuru}
                    status={service.durum}
                    onClose={onClose}
                />

                <div className="flex-1 overflow-hidden flex flex-col bg-muted/5">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <div className="px-6 border-b bg-background">
                            <TabsList className="w-full justify-start h-12 bg-transparent p-0 gap-6">
                                <TabsTrigger
                                    value="genel"
                                    className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-muted-foreground data-[state=active]:text-foreground shadow-none transition-none"
                                >
                                    Genel Bilgiler
                                </TabsTrigger>
                                <TabsTrigger
                                    value="parcalar"
                                    className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-muted-foreground data-[state=active]:text-foreground shadow-none transition-none"
                                >
                                    Parçalar & Malzemeler
                                </TabsTrigger>
                                <TabsTrigger
                                    value="aktiviteler"
                                    className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 text-muted-foreground data-[state=active]:text-foreground shadow-none transition-none"
                                >
                                    Aktiviteler
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <TabsContent value="genel" className="p-6 m-0 space-y-6">
                                {!editMode && (
                                    <div className="flex justify-end">
                                        <Button variant="ghost" size="sm" onClick={onClose} title="Kapat" aria-label="Kapat">✕</Button>
                                        <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                                            <Icon name="pencil" className="mr-2" size={14} />
                                            Düzenle
                                        </Button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Servis Detayları</h3>
                                        <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-background/50">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Tekne Adı</label>
                                                <Input
                                                    value={formData.tekneAdi}
                                                    onChange={e => setFormData({ ...formData, tekneAdi: e.target.value })}
                                                    disabled={!editMode}
                                                    className="bg-background"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Durum</label>
                                                <StatusSelect />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">İrtibat Kişisi</label>
                                                <Input
                                                    value={formData.irtibatKisi || ''}
                                                    onChange={e => setFormData({ ...formData, irtibatKisi: e.target.value })}
                                                    disabled={!editMode}
                                                    className="bg-background"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Konum Bilgileri</h3>
                                        <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-background/50">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Adres / Lokasyon</label>
                                                <Input
                                                    value={formData.adres || ''}
                                                    onChange={e => setFormData({ ...formData, adres: e.target.value })}
                                                    disabled={!editMode}
                                                    className="bg-background"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Yer (Ponton/Bölge)</label>
                                                <Input
                                                    value={formData.yer || ''}
                                                    onChange={e => setFormData({ ...formData, yer: e.target.value })}
                                                    disabled={!editMode}
                                                    className="bg-background"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Ekip / Personel</h3>
                                    <div className="p-4 rounded-xl border border-border/50 bg-background/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {personelSecimleri.map(p => (
                                                <div
                                                    key={p.personnelId}
                                                    className={`
                                                            flex items-center justify-between p-3 rounded-lg border transition-all
                                                            ${p.secili
                                                            ? 'border-primary/50 bg-primary/5 shadow-sm'
                                                            : 'border-border/50 bg-transparent opacity-70 hover:opacity-100 hover:bg-muted/30'}
                                                            ${!editMode && !p.secili ? 'hidden' : ''}
                                                        `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {editMode && (
                                                            <div
                                                                onClick={() => togglePersonel(p.personnelId)}
                                                                className={`
                                                                        w-5 h-5 rounded cursor-pointer border flex items-center justify-center transition-colors
                                                                        ${p.secili ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}
                                                                    `}
                                                            >
                                                                {p.secili && <Icon name="check" size={12} weight="bold" />}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{p.personnelAd}</span>
                                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                {UNVAN_CONFIG[p.unvan as keyof typeof UNVAN_CONFIG]?.label || p.unvan}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {p.secili && (
                                                        <div className="flex bg-muted rounded-md p-0.5">
                                                            <button
                                                                onClick={() => editMode && setPersonelRol(p.personnelId, 'sorumlu')}
                                                                disabled={!editMode}
                                                                className={`
                                                                        px-2 py-0.5 text-[10px] font-medium rounded transition-all
                                                                        ${p.rol === 'sorumlu' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}
                                                                    `}
                                                            >
                                                                Sorumlu
                                                            </button>
                                                            <button
                                                                onClick={() => editMode && setPersonelRol(p.personnelId, 'destek')}
                                                                disabled={!editMode}
                                                                className={`
                                                                        px-2 py-0.5 text-[10px] font-medium rounded transition-all
                                                                        ${p.rol === 'destek' ? 'bg-background shadow-sm text-emerald-600' : 'text-muted-foreground'}
                                                                    `}
                                                            >
                                                                Destek
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {!editMode && personelSecimleri.every(p => !p.secili) && (
                                            <div className="text-center py-4 text-muted-foreground text-sm">
                                                Henüz personel atanmamış.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {COMPLETED_STATUSES.includes(formData.durum as any) && (
                                    <div className="space-y-4 md:col-span-2">
                                        <h3 className="text-sm font-medium text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                                            <Icon name="checkCircle" size={16} weight="fill" />
                                            Kapanış Bilgileri
                                        </h3>
                                        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/10 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground">Kapatan Kişi</span>
                                                {editMode && isAdmin ? (
                                                    <Input
                                                        value={formData.kapanisRaporu?.closedByUserName || ''}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            kapanisRaporu: { ...formData.kapanisRaporu!, closedByUserName: e.target.value }
                                                        })}
                                                        className="h-8"
                                                    />
                                                ) : (
                                                    <div className="font-medium text-sm">{formData.kapanisRaporu?.closedByUserName || 'Belirtilmemiş'}</div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground">Kapanış Tarihi</span>
                                                <div className="font-medium text-sm">
                                                    {formData.kapanisRaporu?.closedAt
                                                        ? new Date(formData.kapanisRaporu.closedAt).toLocaleString('tr-TR')
                                                        : '-'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-muted-foreground">Rapor ID</span>
                                                <div className="font-mono text-xs text-muted-foreground">{formData.kapanisRaporu?.closureId || '-'}</div>
                                            </div>
                                            {editMode && isAdmin && (
                                                <div className="col-span-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded">
                                                    ⚠️ Admin yetkisiyle kapanış bilgilerini düzenliyorsunuz.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Açıklama</h3>
                                    <Textarea
                                        value={formData.servisAciklamasi}
                                        onChange={e => setFormData({ ...formData, servisAciklamasi: e.target.value })}
                                        disabled={!editMode}
                                        title="Servis Açıklaması"
                                        aria-label="Servis Açıklaması"
                                        placeholder="Servis detaylarını buraya girin..."
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="parcalar" className="p-6 m-0 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-semibold">Parça Listesi</h3>
                                        <p className="text-sm text-muted-foreground">Bu servis için gerekli yedek parça ve malzemeler</p>
                                    </div>
                                    <Button size="sm" onClick={addParca} variant="secondary">
                                        <Icon name="plus" className="mr-2" size={14} />
                                        Parça Ekle
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {parcalar.map((p, idx) => (
                                        <div key={idx} className="p-4 border border-border/60 rounded-xl bg-background shadow-sm space-y-4 transition-all hover:border-primary/20 hover:shadow-md">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="text-sm font-medium text-muted-foreground">Parça Detayı</span>
                                                </div>
                                                <button
                                                    onClick={() => removeParca(idx)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                                                    title="Parçayı Sil"
                                                    aria-label="Parçayı Sil"
                                                >
                                                    <Icon name="delete" size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                                <div className="md:col-span-5">
                                                    <Input
                                                        placeholder="Parça Adı / Kodu"
                                                        value={p.parcaAdi}
                                                        onChange={e => updateParca(idx, 'parcaAdi', e.target.value)}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Adet"
                                                        value={p.miktar}
                                                        onChange={e => updateParca(idx, 'miktar', parseInt(e.target.value))}
                                                        className="h-9"
                                                    />
                                                </div>
                                                <div className="md:col-span-3">
                                                    <Select
                                                        value={p.status}
                                                        onChange={e => updateParca(idx, 'status', e.target.value)}
                                                        title="Parça Durumu"
                                                        aria-label="Parça Durumu"
                                                        className="h-9"
                                                    >
                                                        <option value="NEEDED">İhtiyaç Var</option>
                                                        <option value="ORDERED">Sipariş Verildi</option>
                                                        <option value="RECEIVED">Geldi / Stokta</option>
                                                        <option value="CANCELLED">İptal</option>
                                                    </Select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Input
                                                        placeholder="Tedarikçi"
                                                        value={p.tedarikci}
                                                        onChange={e => updateParca(idx, 'tedarikci', e.target.value)}
                                                        className="h-9"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {parcalar.length === 0 && (
                                        <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
                                            <Icon name="cube" size={32} className="mx-auto text-muted-foreground/50 mb-3" weight="duotone" />
                                            <p className="text-muted-foreground font-medium">Henüz parça eklenmemiş</p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">Gerekli malzemeleri eklemek için "Parça Ekle" butonunu kullanın.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="aktiviteler" className="p-6 m-0 h-full overflow-hidden flex flex-col">
                                <AuditLog
                                    serviceId={service.id}
                                    logs={auditLogs.length > 0 ? auditLogs : undefined}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {showFooter && (
                    <DrawerFooter
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSaving={false}
                    />
                )}
            </DrawerContent>
        </Drawer>
    );
}
