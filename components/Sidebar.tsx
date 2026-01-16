'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';
import { Icon } from '@/components/Icon';
import { useEffect, useState } from 'react';

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
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">⚓</div>
                <span className="sidebar-title">ServicePRO</span>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    // Filter items based on user role and visibility
                    if (!item.visible) return null;
                    if (item.adminOnly && !isAdmin) return null;

                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="sidebar-icon">
                                <Icon name={item.icon as any} size="md" />
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            {isLoggedIn && user && (
                <div className="sidebar-user">
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-avatar" style={{
                            background: isAdmin ? 'var(--color-primary)' : 'var(--color-info)',
                        }}>
                            {isAdmin ? '👑' : '🔑'}
                        </div>
                        <div className="sidebar-user-details">
                            <div className="sidebar-user-name">{user.ad}</div>
                            <div className="sidebar-user-role">
                                {isAdmin ? 'Admin' : 'Yetkili'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="sidebar-logout-btn"
                    >
                        <Icon name="logout" size="sm" />
                        Çıkış
                    </button>
                </div>
            )}

            <div className="sidebar-footer">
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>
                    ServicePRO v7.0
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-subtle)', marginTop: '2px' }}>
                    Marlin Yatçılık
                </div>
            </div>
        </aside>
    );
}
