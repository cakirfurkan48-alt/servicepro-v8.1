import { ServisDurumu, DURUM_CONFIG } from '@/types';
import { Icon, IconName } from '@/lib/icons';

interface StatusBadgeProps {
    durum: ServisDurumu;
    showIcon?: boolean;
}

export default function StatusBadge({ durum, showIcon = true }: StatusBadgeProps) {
    const config = DURUM_CONFIG[durum];

    return (
        <span
            className="badge"
            style={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                backgroundColor: config.bgColor,
                color: config.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '0.8rem'
            }}
        >
            {showIcon && <Icon name={config.icon as IconName} size={16} weight="duotone" />}
            <span>{config.label}</span>
        </span>
    );
}
