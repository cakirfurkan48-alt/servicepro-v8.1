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
        <div
            className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setOpen(false)}
        >
            <div
                className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <Command className="w-full">
                    <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4">
                        <Icon name="search" className="text-slate-400 mr-3" />
                        <Command.Input
                            placeholder="Servisler, tekneler veya ayarlar..."
                            className="w-full h-14 bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                        />
                    </div>

                    <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2">
                        <Command.Empty className="py-6 text-center text-sm text-slate-500">
                            Sonuç bulunamadı.
                        </Command.Empty>

                        <Command.Group heading="Hızlı Erişim" className="text-xs font-medium text-slate-500 mb-2 px-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/'))}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                <Icon name="dashboard" size="sm" />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/planlama/yeni'))}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                                <Icon name="add" size="sm" />
                                <span>Yeni Servis Oluştur</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Servisler" className="text-xs font-medium text-slate-500 mb-2 px-2 mt-4">
                            {services.map((service) => (
                                <Command.Item
                                    key={service.id}
                                    value={`${service.tekneAdi} ${service.servisAciklamasi} ${service.durum}`}
                                    onSelect={() => runCommand(() => router.push(`/servis/${service.id}`))}
                                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon name="boats" size="sm" className="text-slate-400" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{service.tekneAdi}</span>
                                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{service.servisAciklamasi}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs opacity-50 capitalize">{service.durum.replace('_', ' ').toLowerCase()}</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    </Command.List>

                    <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex gap-2">
                            <span>Seçmek için</span>
                            <kbd className="bg-slate-100 dark:bg-slate-800 px-1 rounded">↵</kbd>
                        </div>
                        <div className="flex gap-2">
                            <span>Kapatmak için</span>
                            <kbd className="bg-slate-100 dark:bg-slate-800 px-1 rounded">Esc</kbd>
                        </div>
                    </div>
                </Command>
            </div>
        </div>
    );
}
