'use client';

import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { AdminProvider } from '@/lib/admin-context';
import ThemeProvider from '@/components/ThemeProvider';
import Sidebar from '@/components/Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    const isLoggedIn = status === 'authenticated';
    const isLoading = status === 'loading';

    useEffect(() => {
        // Redirect to login if not logged in (except on login page)
        if (!isLoading && !isLoggedIn && pathname !== '/login') {
            router.push('/login');
        }
    }, [isLoggedIn, isLoading, pathname, router]);

    // Show login page without sidebar
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="loading-page">
                <div className="loading-content">
                    <div className="loading-spinner">⏳</div>
                    <p>Yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Show loading or redirect if not logged in
    if (!isLoggedIn) {
        return (
            <div className="loading-page">
                <div className="loading-content">
                    <div className="loading-spinner">🔐</div>
                    <p>Giriş sayfasına yönlendiriliyor...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Sidebar />
            <main className="main-content">
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
                <script src="https://unpkg.com/@phosphor-icons/web"></script>
            </head>
            <body>
                <SessionProvider>
                    <AdminProvider>
                        <ThemeProvider>
                            <LayoutContent>{children}</LayoutContent>
                        </ThemeProvider>
                    </AdminProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
