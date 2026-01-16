/**
 * Yatmarin Checker
 * 
 * E (Adres) veya F (Yer) alanında "yatmarin" geçiyorsa Yatmarin olarak işaretle.
 */

/**
 * Check if service is Yatmarin based on address/location
 */
export function isYatmarin(adres?: string | null, yer?: string | null): boolean {
    const combined = `${adres ?? ''} ${yer ?? ''}`.toLowerCase();
    return combined.includes('yatmarin');
}

/**
 * Get row highlight class based on Yatmarin status
 */
export function getRowHighlightClass(adres?: string | null, yer?: string | null): string {
    return isYatmarin(adres, yer)
        ? 'bg-yatmarin dark:bg-amber-900/20'
        : 'bg-yatmarin-other dark:bg-sky-900/20';
}
