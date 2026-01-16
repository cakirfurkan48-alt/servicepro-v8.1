'use client';

import { SessionProvider } from 'next-auth/react';
import { AdminProvider } from '@/lib/admin-context';
import ThemeProvider from '@/components/ThemeProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <AdminProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </AdminProvider>
        </SessionProvider>
    );
}
