'use client';

import { IconName, IconSize, IconWeight, getIconSize, EMOJI_FALLBACKS, APP_ICONS } from '@/lib/icons';

interface IconProps {
    name: IconName;
    size?: IconSize;
    weight?: IconWeight;
    color?: string;
    className?: string;
    onClick?: () => void;
}

// SVG-based Icon component using Phosphor CDN
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
    const IconComponent = APP_ICONS[name];

    if (!IconComponent) {
        // Fallback for missing icons
        return <EmojiIcon name={name} size={size} className={className} />;
    }

    return (
        <IconComponent
            size={pixelSize}
            weight={weight}
            color={color}
            className={className}
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : undefined,
            }}
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
