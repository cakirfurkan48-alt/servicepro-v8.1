/**
 * Sorting Engine
 * 
 * Sıralama kuralları:
 * 1. Yatmarin işleri üstte
 * 2. Durum önceliğine göre
 * 3. Tarih: eski → yeni (tarih boşsa en üste)
 */

import { isYatmarin } from './yatmarin';
import { getStatusPriority, StatusValue } from './status';

export interface SortableService {
    id: string;
    adres?: string | null;
    yer?: string | null;
    durum?: StatusValue | string;
    tarih?: string | Date | null;
    scheduledDate?: string | Date | null;
}

/**
 * Parse date string to timestamp for sorting
 * Returns 0 for empty dates (puts them first)
 */
function parseDateForSort(dateValue?: string | Date | null): number {
    if (!dateValue) return 0;

    if (dateValue instanceof Date) {
        return dateValue.getTime();
    }

    // Try to parse DD.MM.YYYY format
    const parts = dateValue.split('.');
    if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}`).getTime() || 0;
    }

    // Try standard date parsing
    return new Date(dateValue).getTime() || 0;
}

/**
 * Sort services according to Marlin standard:
 * 1. Yatmarin first
 * 2. By status priority
 * 3. By date (empty first, then oldest to newest)
 */
export function sortServices<T extends SortableService>(services: T[]): T[] {
    return [...services].sort((a, b) => {
        // 1. Yatmarin first
        const aYatmarin = isYatmarin(a.adres, a.yer);
        const bYatmarin = isYatmarin(b.adres, b.yer);

        if (aYatmarin && !bYatmarin) return -1;
        if (!aYatmarin && bYatmarin) return 1;

        // 2. Status priority (lower = higher priority)
        const aStatus = (a.durum as StatusValue) || 'PLANLANDI-RANDEVU';
        const bStatus = (b.durum as StatusValue) || 'PLANLANDI-RANDEVU';

        const aPriority = getStatusPriority(aStatus);
        const bPriority = getStatusPriority(bStatus);

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // 3. Date (empty first, then oldest to newest)
        const aDate = a.scheduledDate || a.tarih;
        const bDate = b.scheduledDate || b.tarih;

        const aTime = parseDateForSort(aDate);
        const bTime = parseDateForSort(bDate);

        // Empty dates come first
        if (aTime === 0 && bTime !== 0) return -1;
        if (aTime !== 0 && bTime === 0) return 1;

        // Oldest first
        return aTime - bTime;
    });
}

/**
 * Filter services to only active ones
 */
export function filterActiveServices<T extends SortableService>(services: T[]): T[] {
    const activeStatuses = [
        'PLANLANDI-RANDEVU',
        'DEVAM EDİYOR',
        'ONAY BEKLİYOR',
        'RAPOR BEKLİYOR',
        'PARÇA BEKLİYOR',
    ];

    return services.filter(s => {
        const status = (s.durum as string) || '';
        return activeStatuses.includes(status);
    });
}
