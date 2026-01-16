'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { STATUS, StatusValue, STATUS_META } from '@/lib/status';
import {
    Service, IsTuru, IS_TURU_CONFIG, RAPOR_GEREKSINIMLERI, KapanisRaporu,
    PersonelAtama, UNVAN_CONFIG, TUM_PERSONEL, Personnel
} from '@/types';
import { hesaplaRaporBasarisi, hesaplaBireyselPuan } from '@/lib/scoring-calculator';

export interface ClosureData {
    rapor: KapanisRaporu;
    personelAtamalari: PersonelAtama[];
    closedByUserEmail: string;
    closedByUserName: string;
    closedAt: string;
    closureId: string;
}

interface CompletionSidebarProps {
    service: Service | null;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (rapor: KapanisRaporu, personelAtamalari: PersonelAtama[]) => void;
    currentUserEmail?: string;
    currentUserName?: string;
}

const raporAlanlari = [
    { key: 'uniteBilgileri', label: 'Ünite Bilgileri (Seri No, Model vb.)' },
    { key: 'fotograf', label: 'Fotoğraf (Öncesi/Sonrası)' },
    { key: 'tekneKonum', label: 'Tekne/Konum bilgisi' },
    { key: 'sarfMalzeme', label: 'Sarf Malzeme' },
    { key: 'adamSaat', label: 'Adam/Saat' },
    { key: 'taseronBilgisi', label: 'Taşeron bilgisi' },
    { key: 'stokMalzeme', label: 'Stok Malzeme' },
];

const defaultRapor: KapanisRaporu = {
    uniteBilgileri: false,
    fotograf: false,
    tekneKonum: false,
    sarfMalzeme: false,
    adamSaat: false,
    taseronBilgisi: false,
    stokMalzeme: false,
    aciklama: '',
    raporlayanPersonel: '',
    raporTarihi: new Date().toISOString().split('T')[0],
};

interface PersonelSecimi {
    personnelId: string;
    personnelAd: string;
    unvan: 'usta' | 'cirak';
    secili: boolean;
    rol: 'sorumlu' | 'destek';
    bonus: boolean;
}

function generateClosureId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `CLS-${timestamp}-${random}`.toUpperCase();
}

export default function CompletionSidebar({
    service,
    isOpen,
    onClose,
    onComplete,
    currentUserEmail = 'system@servicepro.local',
    currentUserName = 'Sistem',
}: CompletionSidebarProps) {
    const [rapor, setRapor] = useState<KapanisRaporu>(defaultRapor);
    const [personelSecimleri, setPersonelSecimleri] = useState<PersonelSecimi[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<StatusValue>(STATUS.TAMAMLANDI);

    // Initialize personnel selections when service changes
    useEffect(() => {
        if (service) {
            // Get active technicians
            const teknisyenler = TUM_PERSONEL.filter(p => p.rol === 'teknisyen' && p.aktif);

            // Initialize with pre-assigned personnel checked
            const initialSecimleri: PersonelSecimi[] = teknisyenler.map(p => {
                const atama = service.atananPersonel?.find(a => a.personnelId === p.id);
                return {
                    personnelId: p.id,
                    personnelAd: p.ad,
                    unvan: p.unvan as 'usta' | 'cirak',
                    secili: !!atama,
                    rol: atama?.rol || 'destek',
                    bonus: false,
                };
            });

            setPersonelSecimleri(initialSecimleri);
            setRapor({
                ...defaultRapor,
                raporlayanPersonel: service.atananPersonel?.find(p => p.rol === 'sorumlu')?.personnelAd || '',
                raporTarihi: new Date().toISOString().split('T')[0],
            });
            setValidationError(null);
        }
    }, [service]);

    if (!service || !isOpen) return null;

    const gerekliAlanlar = RAPOR_GEREKSINIMLERI[service.isTuru] || [];
    const raporBasarisi = hesaplaRaporBasarisi(rapor, service.isTuru);

    const seciliPersoneller = personelSecimleri.filter(p => p.secili);
    const sorumlular = seciliPersoneller.filter(p => p.rol === 'sorumlu');
    const destekler = seciliPersoneller.filter(p => p.rol === 'destek');

    // Validation: responsibles + supports >= 1
    const isValidTeam = sorumlular.length + destekler.length >= 1;

    const toggleSecim = (personnelId: string) => {
        setPersonelSecimleri(prev => {
            const updated = prev.map(p =>
                p.personnelId === personnelId ? { ...p, secili: !p.secili } : p
            );

            // HOTFIX-2: Auto-set status to TAMAMLANDI when first team member is selected
            const newSeciliCount = updated.filter(p => p.secili).length;
            const previousSeciliCount = prev.filter(p => p.secili).length;

            // If going from 0 to 1+ selected, auto-set to TAMAMLANDI
            if (previousSeciliCount === 0 && newSeciliCount > 0) {
                setSelectedStatus(STATUS.TAMAMLANDI);
            }

            return updated;
        });
        setValidationError(null);
    };

    const setRol = (personnelId: string, rol: 'sorumlu' | 'destek') => {
        setPersonelSecimleri(prev => prev.map(p =>
            p.personnelId === personnelId ? { ...p, rol } : p
        ));
    };

    const toggleBonus = (personnelId: string) => {
        setPersonelSecimleri(prev => prev.map(p =>
            p.personnelId === personnelId ? { ...p, bonus: !p.bonus } : p
        ));
    };

    const handleComplete = () => {
        // Validate team selection
        if (!isValidTeam) {
            setValidationError('⚠️ En az 1 personel (sorumlu veya destek) seçilmelidir!');
            return;
        }

        const atamalar: PersonelAtama[] = seciliPersoneller.map(p => ({
            personnelId: p.personnelId,
            personnelAd: p.personnelAd,
            rol: p.rol,
            unvan: p.unvan,
            bonus: p.bonus,
        }));

        // Add closure metadata to rapor
        const finalRapor: KapanisRaporu = {
            ...rapor,
            closedByUserEmail: currentUserEmail,
            closedByUserName: currentUserName,
            closedAt: new Date().toISOString(),
            closureId: generateClosureId(),
        };

        onComplete(finalRapor, atamalar);
        onClose();
    };

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent side="right" className="w-full max-w-xl">
                {/* Header */}
                <DrawerHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    <DrawerTitle className="flex items-center gap-2">
                        ✓ Servis Tamamlama
                    </DrawerTitle>
                    <div className="text-sm opacity-90 mt-1">
                        {service.tekneAdi} • {service.servisAciklamasi?.substring(0, 40)}...
                    </div>
                </DrawerHeader>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* İş Tipi Badge */}
                    <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded text-sm font-semibold">
                        {IS_TURU_CONFIG[service.isTuru]?.label} (×{IS_TURU_CONFIG[service.isTuru]?.carpan})
                    </div>

                    {/* Status Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Final Durum</label>
                        <div className="flex gap-2">
                            {[STATUS.TAMAMLANDI, STATUS.KESIF_KONTROL].map((status) => {
                                const meta = STATUS_META[status];
                                const isSelected = selectedStatus === status;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        className={`
                                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                                            ${isSelected
                                                ? 'ring-2 ring-primary ring-offset-2'
                                                : 'opacity-60 hover:opacity-100'
                                            }
                                        `}
                                        style={{
                                            backgroundColor: meta.bg,
                                            color: meta.text,
                                        }}
                                    >
                                        {meta.icon} {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Personel Seçimi */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            👥 Kapanış Ekibi
                        </h3>

                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                            💡 Personeli seçin ve rolünü belirleyin.<br />
                            <strong>Sorumlu:</strong> Rapor kalitesine göre puan.<br />
                            <strong>Destek:</strong> Sabit baz puan.
                        </div>

                        {/* Validation Error */}
                        {validationError && (
                            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                                {validationError}
                            </div>
                        )}

                        <div className="max-h-[200px] overflow-auto space-y-1">
                            {personelSecimleri.map(p => (
                                <div
                                    key={p.personnelId}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-lg transition-colors
                                        ${p.secili
                                            ? 'bg-muted border border-border'
                                            : 'bg-transparent hover:bg-muted/50'
                                        }
                                    `}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleSecim(p.personnelId)}
                                        className={`
                                            w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs
                                            ${p.secili
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border-2 border-border'
                                            }
                                        `}
                                    >
                                        {p.secili && '✓'}
                                    </button>

                                    {/* Name & Unvan */}
                                    <div className="flex-1">
                                        <span className="font-medium">{p.personnelAd}</span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {UNVAN_CONFIG[p.unvan]?.icon} {UNVAN_CONFIG[p.unvan]?.label}
                                        </span>
                                    </div>

                                    {/* Role Selection */}
                                    {p.secili && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setRol(p.personnelId, 'sorumlu')}
                                                className={`
                                                    px-2 py-1 text-xs font-semibold rounded transition-colors
                                                    ${p.rol === 'sorumlu'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border border-border text-muted-foreground hover:border-primary'
                                                    }
                                                `}
                                            >
                                                Sorumlu
                                            </button>
                                            <button
                                                onClick={() => setRol(p.personnelId, 'destek')}
                                                className={`
                                                    px-2 py-1 text-xs font-semibold rounded transition-colors
                                                    ${p.rol === 'destek'
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'border border-border text-muted-foreground hover:border-emerald-500'
                                                    }
                                                `}
                                            >
                                                Destek
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Team Summary */}
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">Seçili:</span>
                            <span className="font-semibold text-primary">
                                👤 {sorumlular.length} Sorumlu
                            </span>
                            <span className="font-semibold text-emerald-600">
                                🤝 {destekler.length} Destek
                            </span>
                        </div>
                    </div>

                    {/* Rapor Kontrol Listesi */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            📋 Rapor Kontrol Listesi
                        </h3>

                        <div className="space-y-1">
                            {raporAlanlari.map((alan) => {
                                const key = alan.key as keyof KapanisRaporu;
                                const isGerekli = gerekliAlanlar.includes(alan.key as any);
                                const isChecked = rapor[key] === true;

                                return (
                                    <div
                                        key={alan.key}
                                        className={`
                                            flex items-center gap-3 p-2 rounded
                                            ${isGerekli ? 'bg-muted' : 'opacity-40'}
                                        `}
                                    >
                                        <button
                                            onClick={() => isGerekli && setRapor({ ...rapor, [key]: !isChecked })}
                                            disabled={!isGerekli}
                                            className={`
                                                w-5 h-5 rounded flex-shrink-0 flex items-center justify-center text-xs
                                                ${isChecked
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'border-2 border-border'
                                                }
                                                ${isGerekli ? 'cursor-pointer' : 'cursor-not-allowed'}
                                            `}
                                        >
                                            {isChecked && '✓'}
                                        </button>
                                        <span className="flex-1 text-sm">{alan.label}</span>
                                        {isGerekli && (
                                            <span className="text-[10px] font-bold text-red-500">ZORUNLU</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Rapor Başarı */}
                    <div className="p-4 bg-gradient-to-r from-primary to-primary/80 rounded-xl text-white">
                        <div className="flex justify-between items-center">
                            <span className="opacity-90">Rapor Başarı Oranı</span>
                            <span className="text-2xl font-bold">%{Math.round(raporBasarisi * 100)}</span>
                        </div>
                    </div>

                    {/* Puan Önizleme */}
                    {seciliPersoneller.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                💰 Puan Önizleme
                            </h3>

                            {sorumlular.length > 0 && (
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-primary">SORUMLU (Rapor Kalitesine Göre)</div>
                                    {sorumlular.map((p) => {
                                        const puan = hesaplaBireyselPuan(raporBasarisi, service.isTuru, 'sorumlu', p.bonus);
                                        return (
                                            <PuanCard
                                                key={p.personnelId}
                                                personel={p}
                                                puan={puan}
                                                formula={`(40 + 60×${Math.round(raporBasarisi * 100)}%) × ${puan.zorlukCarpani}${p.bonus ? ' +15' : ''}`}
                                                isSorumlu
                                                onToggleBonus={() => toggleBonus(p.personnelId)}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {destekler.length > 0 && (
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-emerald-600">DESTEK (Sabit 80 Baz Puan)</div>
                                    {destekler.map((p) => {
                                        const puan = hesaplaBireyselPuan(1, service.isTuru, 'destek', p.bonus);
                                        return (
                                            <PuanCard
                                                key={p.personnelId}
                                                personel={p}
                                                puan={puan}
                                                formula={`80 × ${puan.zorlukCarpani}${p.bonus ? ' +15' : ''}`}
                                                isSorumlu={false}
                                                onToggleBonus={() => toggleBonus(p.personnelId)}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DrawerFooter className="border-t border-border">
                    <Button
                        onClick={handleComplete}
                        disabled={!isValidTeam}
                        className="w-full"
                        size="lg"
                    >
                        ✓ Servisi Tamamla ({seciliPersoneller.length} personel)
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={onClose}>
                        İptal
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

// Puan Card Component
function PuanCard({
    personel,
    puan,
    formula,
    isSorumlu,
    onToggleBonus
}: {
    personel: PersonelSecimi;
    puan: { hamPuan: number; zorlukCarpani: number; finalPuan: number };
    formula: string;
    isSorumlu: boolean;
    onToggleBonus: () => void;
}) {
    return (
        <div className={`
            p-3 rounded-lg bg-muted flex items-center justify-between
            ${isSorumlu ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-emerald-500'}
        `}>
            <div>
                <div className="font-medium text-sm">
                    {UNVAN_CONFIG[personel.unvan]?.icon} {personel.personnelAd}
                </div>
                <div className="text-xs text-muted-foreground">{formula}</div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleBonus}
                    className={`
                        px-2 py-1 text-xs rounded transition-colors
                        ${personel.bonus
                            ? 'bg-amber-400 text-black'
                            : 'border border-border text-muted-foreground hover:border-amber-400'
                        }
                    `}
                >
                    ⭐ +15
                </button>
                <span className={`text-xl font-bold ${isSorumlu ? 'text-primary' : 'text-emerald-600'}`}>
                    {puan.finalPuan}
                </span>
            </div>
        </div>
    );
}
