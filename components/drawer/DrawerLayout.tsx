'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icon } from '@/lib/icons';
import { STATUS_META, StatusValue } from '@/lib/status';

interface DrawerHeaderProps {
    title: string;
    subtitle?: string;
    status: string;
    onClose: () => void;
}

export function DrawerHeader({ title, subtitle, status, onClose }: DrawerHeaderProps) {
    const statusMeta = STATUS_META[status as StatusValue] || STATUS_META['PLANLANDI-RANDEVU'];

    return (
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/40 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
                    <div
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        style={{
                            backgroundColor: statusMeta.bg,
                            color: statusMeta.text,
                        }}
                    >
                        <Icon name={statusMeta.icon as any} size={14} className="mr-1" />
                        {statusMeta.label}
                    </div>
                </div>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                <Icon name="x" size={20} />
            </Button>
        </div>
    );
}

interface DrawerFooterProps {
    onSave: () => void;
    onCancel: () => void;
    isSaving?: boolean;
}

export function DrawerFooter({ onSave, onCancel, isSaving }: DrawerFooterProps) {
    return (
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-border/40 bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                İptal
            </Button>
            <Button onClick={onSave} disabled={isSaving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isSaving ? (
                    <>
                        <Icon name="spinner" className="mr-2 animate-spin" size={16} />
                        Kaydediliyor...
                    </>
                ) : (
                    <>
                        <Icon name="check" className="mr-2" size={16} />
                        Kaydet
                    </>
                )}
            </Button>
        </div>
    );
}
