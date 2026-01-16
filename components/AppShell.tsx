'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import GlobalSearch from '@/components/GlobalSearch';
import { Icon } from '@/lib/icons';
import { Toaster } from '@/components/ui/sonner';

export default function AppShell({ children }: { children: React.ReactNode }) {
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
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
                <Icon name="spinner" size={48} className="animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">Yükleniyor...</p>
            </div>
        );
    }

    // Show loading or redirect if not logged in (fallback while redirecting)
    if (!isLoggedIn) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
                <Icon name="lock" size={48} className="text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">Giriş sayfasına yönlendiriliyor...</p>
            </div>
        );
    }

    return (
        <>
            <Sidebar />
            <GlobalSearch />
            <main className="main-content flex-1 w-full max-w-7xl mx-auto px-6 py-6 pt-20 transition-all duration-300">
                {children}
            </main>
            <Toaster />
        </>
    );
}
