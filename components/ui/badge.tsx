import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { STATUS, StatusValue, STATUS_META } from "@/lib/status"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                // Marlin Status Variants
                planlandi: "border-transparent",
                devam: "border-transparent",
                parca: "border-transparent",
                onay: "border-transparent",
                rapor: "border-transparent",
                tamamlandi: "border-transparent",
                kesif: "border-transparent",
                iptal: "border-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

// Status Badge variant mapping
const STATUS_VARIANT: Record<StatusValue, string> = {
    [STATUS.PLANLANDI_RANDEVU]: 'planlandi',
    [STATUS.DEVAM_EDIYOR]: 'devam',
    [STATUS.PARCA_BEKLIYOR]: 'parca',
    [STATUS.ONAY_BEKLIYOR]: 'onay',
    [STATUS.RAPOR_BEKLIYOR]: 'rapor',
    [STATUS.TAMAMLANDI]: 'tamamlandi',
    [STATUS.KESIF_KONTROL]: 'kesif',
    [STATUS.IPTAL]: 'iptal',
};

interface StatusBadgeProps {
    status: StatusValue;
    showIcon?: boolean;
    className?: string;
}

function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
    const meta = STATUS_META[status];

    if (!meta) {
        return <Badge variant="outline" className={className}>{status}</Badge>;
    }

    return (
        <Badge
            className={cn(className)}
            style={{
                backgroundColor: meta.bg,
                color: meta.text,
                borderColor: 'transparent'
            }}
        >
            {showIcon && <span className="mr-1">{meta.icon}</span>}
            <span>{meta.label}</span>
        </Badge>
    );
}

export { Badge, badgeVariants, StatusBadge }
