/**
 * Icon System - Phosphor Icons Wrapper
 * 
 * This module provides consistent icon rendering throughout the app.
 * Icons can be changed via Admin Settings.
 * 
 * Usage:
 * import { Icon } from '@/lib/icons';
 * <Icon name="house" weight="duotone" size={24} />
 */

// Icon name mappings for the app
export const APP_ICONS = {
    // Navigation
    home: 'house',
    dashboard: 'squares-four',
    calendar: 'calendar-dots',
    planning: 'clipboard-text',
    boats: 'boat',
    personnel: 'users',
    settings: 'gear',
    menu: 'list',

    // Brand & Logo
    waves: 'waves',
    lightning: 'lightning',

    // Dashboard & Stats
    chartPieSlice: 'chart-pie-slice',
    trendUp: 'trend-up',
    hourglass: 'hourglass',
    usersThree: 'users-three',

    // Actions
    add: 'plus',
    plus: 'plus',
    edit: 'pencil-simple',
    delete: 'trash',
    save: 'floppy-disk',
    cancel: 'x-circle',
    search: 'magnifying-glass',
    filter: 'funnel',
    sort: 'sort-ascending',
    clipboardText: 'clipboard-text',
    bell: 'bell',

    // Status
    success: 'check-circle',
    checkCircle: 'check-circle',
    warning: 'warning',
    error: 'x-circle',
    info: 'info',
    warningCircle: 'warning-circle',

    // Auth & Form
    googleLogo: 'google-logo',
    envelope: 'envelope',
    lock: 'lock',
    spinner: 'spinner',
    arrowRight: 'arrow-right',
    chartBar: 'chart-bar',
    printer: 'printer',
    export: 'export',
    pencil: 'pencil-simple',
    image: 'image',
    creditCard: 'credit-card',

    pending: 'clock',
    clock: 'clock',
    inProgress: 'play-circle',
    completed: 'check-circle',
    caretRight: 'caret-right',
    mapPin: 'map-pin',
    coffee: 'coffee',

    // Service
    service: 'wrench',
    parts: 'gear-six',
    evaluation: 'star',
    star: 'star',
    workflow: 'flow-arrow',
    formBuilder: 'note-pencil',
    audit: 'clipboard-text',

    // UI
    chevronRight: 'caret-right',
    chevronDown: 'caret-down',
    chevronUp: 'caret-up',
    close: 'x',
    more: 'dots-three',
    user: 'user',
    logout: 'sign-out',
    theme: 'paint-brush',
    sun: 'sun',
    moon: 'moon',
} as const;

export type IconName = keyof typeof APP_ICONS;

// Icon size presets
export const ICON_SIZES = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 48,
} as const;

export type IconSize = keyof typeof ICON_SIZES | number;

// Icon weights (Phosphor specific)
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export interface IconProps {
    name: IconName;
    size?: IconSize;
    weight?: IconWeight;
    color?: string;
    className?: string;
}

// Get actual size value
export function getIconSize(size: IconSize): number {
    return typeof size === 'number' ? size : ICON_SIZES[size];
}

// Generate Phosphor icon CSS class
export function getIconClass(name: IconName, weight: IconWeight = 'duotone'): string {
    const phosphorName = APP_ICONS[name];
    return `ph-${weight} ph-${phosphorName}`;
}

// Fallback emoji icons for when Phosphor isn't loaded
export const EMOJI_FALLBACKS: Record<IconName, string> = {
    home: '🏠',
    dashboard: '📊',
    calendar: '📅',
    planning: '📋',
    boats: '⛵',
    personnel: '👥',
    settings: '⚙️',
    menu: '☰',
    add: '➕',
    edit: '✏️',
    delete: '🗑️',
    save: '💾',
    cancel: '❌',
    search: '🔍',
    filter: '🔽',
    sort: '📶',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    pending: '🕐',
    clock: '🕒',
    inProgress: '▶️',
    completed: '✅',

    // Fallbacks for new icons
    waves: '🌊',
    lightning: '⚡',
    chartPieSlice: '🍰',
    trendUp: '📈',
    hourglass: '⏳',
    usersThree: '👥',
    plus: '➕',
    clipboardText: '📋',
    bell: '🔔',
    checkCircle: '✅',
    caretRight: '➡️',
    mapPin: '📍',
    coffee: '☕',
    star: '⭐',

    // Auth Fallbacks
    googleLogo: 'G',
    envelope: '✉️',
    lock: '🔒',
    spinner: '⏳',
    arrowRight: '➡️',
    warningCircle: '⚠️',
} as const;

