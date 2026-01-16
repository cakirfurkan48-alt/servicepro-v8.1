import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import AppShell from '@/components/AppShell';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export const metadata: Metadata = {
    title: 'ServicePRO',
    description: 'Gelişmiş Servis Yönetim Sistemi',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
            <head>
                <script src="https://unpkg.com/@phosphor-icons/web"></script>
            </head>
            <body className="font-sans">
                <Providers>
                    <AppShell>
                        {children}
                    </AppShell>
                </Providers>
            </body>
        </html>
    );
}
