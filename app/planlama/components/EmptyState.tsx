import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons";

interface EmptyStateProps {
    type: 'no-data' | 'no-matches';
    onReset?: () => void;
    onAdd?: () => void;
}

export default function EmptyState({ type, onReset, onAdd }: EmptyStateProps) {
    if (type === 'no-data') {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-border/50 rounded-2xl bg-muted/5">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                    <Icon name="clipboardText" size={40} className="text-primary" weight="duotone" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Henüz servis kaydı yok</h3>
                <p className="text-muted-foreground mb-8 max-w-sm text-base">
                    Sistemde henüz hiç servis kaydı oluşturulmamış. İlk servisi ekleyerek iş akışınızı başlatın.
                </p>
                <Button onClick={onAdd} size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Icon name="plus" size={18} weight="bold" className="mr-2" />
                    Yeni Servis Oluştur
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-border/50 rounded-2xl bg-muted/5">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 ring-8 ring-muted/50">
                <Icon name="magnifyingGlass" size={40} className="text-muted-foreground" weight="duotone" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Eşleşen kayıt bulunamadı</h3>
            <p className="text-muted-foreground mb-8 max-w-sm text-base mx-auto">
                Arama kriterlerinize veya seçili filtrelere uygun servis bulunmuyor.
            </p>
            <div className="flex gap-4 justify-center w-full">
                <Button variant="secondary" onClick={onReset} size="lg">
                    <Icon name="arrowsClockwise" size={18} className="mr-2" />
                    Filtreleri Temizle
                </Button>
                {onAdd && (
                    <Button onClick={onAdd} variant="outline" size="lg" className="border-dashed">
                        <Icon name="plus" size={18} weight="bold" className="mr-2" />
                        Yeni Servis
                    </Button>
                )}
            </div>
        </div>
    );
}
