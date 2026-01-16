'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Icon } from '@/components/Icon';
import { useEffect, useState } from 'react';
import NotificationCenter from '@/components/NotificationCenter';

// Default Fallback Menu
const defaultMenu = {
    sidebar: [
        { id: '1', href: '/', label: 'Dashboard', icon: 'ChartPieSlice', visible: true },
        { id: '2', href: '/planlama', label: 'Servis Planlama', icon: 'CalendarCheck', visible: true },
        { id: '3', href: '/personel', label: 'Personel Yönetimi', icon: 'Users', visible: true },
        { id: '4', href: '/puanlama', label: 'Marlin Yıldızı', icon: 'Star', visible: true },
        { id: '5', href: '/puanlama/gecmis', label: 'Geçmiş & Klasman', icon: 'Trophy', visible: true },
        { id: '6', href: '/deger', label: 'Aylık Değerlendirme', icon: 'Notepad', visible: true },
        { id: '7', href: '/raporlar/whatsapp', label: 'WhatsApp Rapor', icon: 'WhatsappLogo', visible: true },
        { id: '8', href: '/ayarlar', label: 'Ayarlar', icon: 'Gear', visible: true, adminOnly: true },
    ]
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, isAdmin, logout, isLoggedIn } = useAdmin();
    const [menuItems, setMenuItems] = useState(defaultMenu.sidebar);

    // Don't show sidebar on login page
    if (pathname === '/login') {
        return null;
    }

    useEffect(() => {
        loadMenu();
    }, []);

    const loadMenu = async () => {
        try {
            const res = await fetch('/api/config?section=menu');
            if (res.ok) {
                const data = await res.json();
                if (data && data.sidebar) {
                    setMenuItems(data.sidebar);
                }
            }
        } catch (error) {
            console.error('Failed to load menu:', error);
        }
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-transform duration-300">
            <div className="flex h-16 items-center gap-3 border-b border-border/40 px-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xl">⚓</div>
                <span className="text-lg font-bold tracking-tight text-foreground">ServicePRO</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                    if (!item.visible) return null;
                    if (item.adminOnly && !isAdmin) return null;

                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-primary/10 text-primary shadow-sm'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }
                            `}
                        >
                            <Icon name={item.icon as any} size={20} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            {isLoggedIn && user && (
                <div className="border-t border-border/40 p-4 mx-2 mt-auto">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className={`
                            flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium
                            ${isAdmin ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-primary/10 text-primary'}
                        `}>
                            {isAdmin ? '👑' : 'KV'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <div className="truncate text-sm font-medium text-foreground">{user.ad}</div>
                            <div className="text-xs text-muted-foreground">
                                {isAdmin ? 'Yönetici' : 'Personel'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
                    >
                        <Icon name="logout" size={16} className="text-muted-foreground group-hover:text-destructive" />
                        Oturumu Kapat
                    </button>
                    <div className="hidden">
                        <NotificationCenter />
                    </div>
                </div>
            )}

            <div className="px-6 py-4 border-t border-border/40">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>v2.0.0 Pro</span>
                    <span>Marlin Yatçılık</span>
                </div>
            </div>
        </aside>
    );
}
