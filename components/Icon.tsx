'use client';

import { IconName, IconSize, IconWeight, getIconSize, getIconClass, EMOJI_FALLBACKS, APP_ICONS } from '@/lib/icons';

interface IconProps {
    name: IconName;
    size?: IconSize;
    weight?: IconWeight;
    color?: string;
    className?: string;
    onClick?: () => void;
}

// SVG-based Icon component using Phosphor CDN
export function Icon({
    name,
    size = 'md',
    weight = 'duotone',
    color,
    className = '',
    onClick,
}: IconProps) {
    const pixelSize = getIconSize(size);
    const phosphorName = APP_ICONS[name];

    // Use Phosphor Icons web component style
    const iconClass = `ph ${getIconClass(name, weight)} ${className}`.trim();

    return (
        <i
            className={iconClass}
            style={{
                fontSize: `${pixelSize}px`,
                color: color,
                cursor: onClick ? 'pointer' : 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClick}
            aria-hidden="true"
        />
    );
}

// Fallback component that uses emoji
export function EmojiIcon({
    name,
    size = 'md',
    className = '',
}: Pick<IconProps, 'name' | 'size' | 'className'>) {
    const pixelSize = getIconSize(size);
    const emoji = EMOJI_FALLBACKS[name];

    return (
        <span
            className={className}
            style={{
                fontSize: `${pixelSize * 0.8}px`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
            }}
            role="img"
            aria-label={name}
        >
            {emoji}
        </span>
    );
}

// Hook to check if Phosphor is loaded
export function usePhosphorLoaded(): boolean {
    if (typeof window === 'undefined') return false;
    // Check if Phosphor CSS is available
    return document.querySelector('link[href*="phosphor"]') !== null;
}

// Auto-selecting icon that uses Phosphor if available, emoji fallback otherwise
export function SmartIcon(props: IconProps) {
    // For SSR safety, always render emoji first, let CSS handle Phosphor
    return <Icon {...props} />;
}
