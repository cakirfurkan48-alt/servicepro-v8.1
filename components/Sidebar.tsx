'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';

interface NavItem {
    href: string;
    label: string;
    icon: string;
    adminOnly?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: 'Ana Sayfa',
        items: [
            { href: '/', label: 'Dashboard', icon: '📊' },
        ],
    },
    {
        title: 'Operasyon',
        items: [
            { href: '/planlama', label: 'Servis Planlama', icon: '📅' },
            { href: '/personel', label: 'Personel Yönetimi', icon: '👥' },
        ],
    },
    {
        title: 'Performans',
        items: [
            { href: '/puanlama', label: 'Marlin Yıldızı', icon: '⭐' },
            { href: '/puanlama/gecmis', label: 'Geçmiş & Klasman', icon: '🏆' },
            { href: '/deger', label: 'Aylık Değerlendirme', icon: '📝' },
        ],
    },
    {
        title: 'Raporlar',
        items: [
            { href: '/raporlar/whatsapp', label: 'WhatsApp Rapor', icon: '📤' },
        ],
    },
    {
        title: 'Yönetim',
        items: [
            { href: '/ayarlar', label: 'Ayarlar', icon: '⚙️', adminOnly: true },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, isAdmin, logout, isLoggedIn } = useAdmin();

    // Don't show sidebar on login page
    if (pathname === '/login') {
        return null;
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">⚓</div>
                <span className="sidebar-title">ServicePRO</span>
            </div>

            <nav className="sidebar-nav">
                {navSections.map((section) => {
                    // Filter items based on user role
                    const visibleItems = section.items.filter(item =>
                        !item.adminOnly || isAdmin
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.title} className="sidebar-section">
                            <div className="sidebar-section-title">{section.title}</div>
                            {visibleItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/' && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                                    >
                                        <span className="sidebar-icon">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
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
                        🚪 Çıkış
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
