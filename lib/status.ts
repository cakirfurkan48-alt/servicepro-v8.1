/**
 * Status System - Marlin Standard
 * 
 * Tek kaynak: Tüm durum sabitleri ve yardımcı fonksiyonlar burada tanımlı.
 */

export const STATUS = {
    PLANLANDI_RANDEVU: 'PLANLANDI-RANDEVU',
    DEVAM_EDIYOR: 'DEVAM EDİYOR',
    ONAY_BEKLIYOR: 'ONAY BEKLİYOR',
    RAPOR_BEKLIYOR: 'RAPOR BEKLİYOR',
    PARCA_BEKLIYOR: 'PARÇA BEKLİYOR',
    TAMAMLANDI: 'TAMAMLANDI',
    KESIF_KONTROL: 'KEŞİF-KONTROL',
    IPTAL: 'İPTAL',
} as const;

export type StatusValue = typeof STATUS[keyof typeof STATUS];

// Durum öncelik sıralaması (küçük = önce)
export const STATUS_PRIORITY: Record<StatusValue, number> = {
    [STATUS.DEVAM_EDIYOR]: 1,
    [STATUS.PLANLANDI_RANDEVU]: 2,
    [STATUS.PARCA_BEKLIYOR]: 3,
    [STATUS.ONAY_BEKLIYOR]: 4,
    [STATUS.RAPOR_BEKLIYOR]: 5,
    [STATUS.TAMAMLANDI]: 99,
    [STATUS.KESIF_KONTROL]: 99,
    [STATUS.IPTAL]: 99,
};

// Aktif listede görünecek durumlar
export const ACTIVE_STATUSES: StatusValue[] = [
    STATUS.PLANLANDI_RANDEVU,
    STATUS.DEVAM_EDIYOR,
    STATUS.ONAY_BEKLIYOR,
    STATUS.RAPOR_BEKLIYOR,
    STATUS.PARCA_BEKLIYOR,
];

// Tamamlanmış sayılan durumlar (puan hesaplaması için)
// İPTAL tamamlanmış DEĞİL - performans metriklerinde sayılmaz
export const COMPLETED_STATUSES: StatusValue[] = [
    STATUS.TAMAMLANDI,
    STATUS.KESIF_KONTROL,
];

// Arşiv durumları (UI filtreleme için)
// Kapanmış tüm işler - tamamlanan + iptal
export const ARCHIVE_STATUSES: StatusValue[] = [
    STATUS.TAMAMLANDI,
    STATUS.KESIF_KONTROL,
    STATUS.IPTAL,
];

// Tüm durumlar (sıralı)
export const ALL_STATUSES: StatusValue[] = [
    STATUS.DEVAM_EDIYOR,
    STATUS.PLANLANDI_RANDEVU,
    STATUS.PARCA_BEKLIYOR,
    STATUS.ONAY_BEKLIYOR,
    STATUS.RAPOR_BEKLIYOR,
    STATUS.TAMAMLANDI,
    STATUS.KESIF_KONTROL,
    STATUS.IPTAL,
];

/**
 * Check if status is completed (for scoring/performance metrics)
 * İPTAL is NOT completed - it's just archived
 */
export function isCompletedStatus(status: StatusValue): boolean {
    return COMPLETED_STATUSES.includes(status);
}

/**
 * Check if status is archived (closed - either completed or cancelled)
 */
export function isArchivedStatus(status: StatusValue): boolean {
    return ARCHIVE_STATUSES.includes(status);
}

/**
 * Check if status is cancelled
 */
export function isCancelledStatus(status: StatusValue): boolean {
    return status === STATUS.IPTAL;
}

// Durum meta verileri (label, color, icon)
export const STATUS_META: Record<StatusValue, {
    label: string;
    bg: string;
    text: string;
    icon: string;
    isActive: boolean;
    isCancelled?: boolean;
}> = {
    [STATUS.PLANLANDI_RANDEVU]: {
        label: 'Planlandı/Randevu',
        bg: '#e2f0d9',
        text: '#1f6f3d',
        icon: 'calendar',
        isActive: true
    },
    [STATUS.DEVAM_EDIYOR]: {
        label: 'Devam Ediyor',
        bg: '#d9ead3',
        text: '#1f6f3d',
        icon: 'inProgress',
        isActive: true
    },
    [STATUS.PARCA_BEKLIYOR]: {
        label: 'Parça Bekliyor',
        bg: '#cfe2f3',
        text: '#1d4ed8',
        icon: 'parts',
        isActive: true
    },
    [STATUS.ONAY_BEKLIYOR]: {
        label: 'Onay Bekliyor',
        bg: '#bdd7ee',
        text: '#1e40af',
        icon: 'hourglass',
        isActive: true
    },
    [STATUS.RAPOR_BEKLIYOR]: {
        label: 'Rapor Bekliyor',
        bg: '#9dc3e6',
        text: '#1e3a8a',
        icon: 'clipboardText',
        isActive: true
    },
    [STATUS.TAMAMLANDI]: {
        label: 'Tamamlandı',
        bg: '#ead1dc',
        text: '#5b21b6',
        icon: 'completed',
        isActive: false
    },
    [STATUS.KESIF_KONTROL]: {
        label: 'Keşif/Kontrol',
        bg: '#e6e0f8',
        text: '#5b21b6',
        icon: 'search',
        isActive: false
    },
    [STATUS.IPTAL]: {
        label: 'İptal Edildi',
        bg: '#fecaca',
        text: '#991b1b',
        icon: 'cancel',
        isActive: false,
        isCancelled: true,
    },
};

/**
 * Normalize status from various input formats to standard StatusValue
 */
export function normalizeStatus(input: string): StatusValue {
    const s = (input || '').trim().toUpperCase();

    if (!s) return STATUS.PLANLANDI_RANDEVU;

    // BİTTİ FT.* → TAMAMLANDI
    if (s.includes('BİTTİ') && s.includes('FT')) return STATUS.TAMAMLANDI;
    if (s.includes('BITTI') && s.includes('FT')) return STATUS.TAMAMLANDI;

    // KEŞİF / KESIF varyasyonları
    if (s.includes('KEŞİF') || s.includes('KESIF')) return STATUS.KESIF_KONTROL;

    // İPTAL
    if (s.includes('İPTAL') || s.includes('IPTAL')) return STATUS.IPTAL;

    // DEVAM
    if (s.includes('DEVAM')) return STATUS.DEVAM_EDIYOR;

    // ONAY
    if (s.includes('ONAY')) return STATUS.ONAY_BEKLIYOR;

    // RAPOR
    if (s.includes('RAPOR')) return STATUS.RAPOR_BEKLIYOR;

    // PARÇA / PARCA
    if (s.includes('PARÇA') || s.includes('PARCA')) return STATUS.PARCA_BEKLIYOR;

    // RANDEVU / PLANLANDI
    if (s.includes('RANDEVU') || s.includes('PLANLANDI')) return STATUS.PLANLANDI_RANDEVU;

    // TAMAMLANDI
    if (s.includes('TAMAMLANDI')) return STATUS.TAMAMLANDI;

    // Default
    return STATUS.PLANLANDI_RANDEVU;
}

/**
 * Check if status is in active list
 */
export function isActiveStatus(status: StatusValue): boolean {
    return ACTIVE_STATUSES.includes(status);
}

/**
 * Get status priority for sorting
 */
export function getStatusPriority(status: StatusValue): number {
    return STATUS_PRIORITY[status] ?? 99;
}
