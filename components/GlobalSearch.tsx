'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Icon } from '@/components/Icon';
import { useRouter } from 'next/navigation';
import { fetchServices } from '@/lib/api';
import { Service } from '@/types';

// Custom CSS for cmdk (Tailwind integration)
// We will rely on inline styles or globals.css for specific cmdk styling.
// For now, inline styles are simplest for this specific library wrapper.

export default function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        if (open) {
            // Load services when opened
            fetchServices().then(data => setServices(data.slice(0, 50))); // Optimize: top 50
        }
    }, [open]);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
    return (
        <div
            className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setOpen(false)}
        >
            <div
                className="w-full max-w-lg bg-card rounded-xl border border-border/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <Command className="w-full">
                    <div className="flex items-center border-b border-border/40 px-4">
                        <Icon name="magnifying-glass" className="text-muted-foreground mr-3" />
                        <Command.Input
                            placeholder="Servisler, tekneler veya ayarlar..."
                            className="w-full h-14 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            Sonuç bulunamadı.
                        </Command.Empty>

                        <Command.Group heading="Hızlı Erişim" className="text-xs font-medium text-muted-foreground mb-2 px-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/'))}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer transition-colors"
                            >
                                <Icon name="chart-pie-slice" size={16} />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/planlama/yeni'))}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer transition-colors"
                            >
                                <Icon name="plus" size={16} />
                                <span>Yeni Servis Oluştur</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Servisler" className="text-xs font-medium text-muted-foreground mb-2 px-2 mt-4">
                            {services.map((service) => (
                                <Command.Item
                                    key={service.id}
                                    value={`${service.tekneAdi} ${service.servisAciklamasi} ${service.durum}`}
                                    onSelect={() => runCommand(() => router.push(`/servis/${service.id}`))}
                                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon name="boat" size={16} className="text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{service.tekneAdi}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{service.servisAciklamasi}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs opacity-50 capitalize">{service.durum.replace('_', ' ').toLowerCase()}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    </Command.List>

                    <div className="border-t border-border/40 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex gap-2">
                            <span>Seçmek için</span>
                            <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium text-foreground">↵</kbd>
                        </div>
                        <div className="flex gap-2">
                            <span>Kapatmak için</span>
                            <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-medium text-foreground">Esc</kbd>
                        </div>
                    </div>
                </Command>
            </div>
        </div>
    );
}
