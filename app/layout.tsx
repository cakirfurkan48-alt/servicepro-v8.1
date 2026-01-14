'use client';

import './globals.css';
import { AdminProvider, useAdmin } from '@/lib/admin-context';
import Sidebar from '@/components/Sidebar';
import AdminEditBar from '@/components/AdminEditBar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isLoggedIn, isAdmin } = useAdmin();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not logged in (except on login page)
        if (!isLoggedIn && pathname !== '/login') {
            router.push('/login');
        }
    }, [isLoggedIn, pathname, router]);

    // Show login page without sidebar
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // Show loading or redirect if not logged in
    if (!isLoggedIn) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-bg)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>⏳</div>
                    <p>Yönlendiriliyor...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <AdminEditBar />
            <Sidebar />
            <main className="main-content" style={{ marginTop: isAdmin ? '40px' : '0' }}>
                {children}
            </main>
        </>
    );
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
            <head>
                <title>ServicePRO - Tekne Teknik Servis Takip Sistemi</title>
                <meta name="description" content="Marlin Yatçılık teknik servis birimi için servis takip, personel yönetimi ve puanlama sistemi" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <AdminProvider>
                    <LayoutContent>{children}</LayoutContent>
                </AdminProvider>
            </body>
        </html>
    );
}
