import { Icon } from '@/components/Icon';
import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg font-sans text-text transition-colors duration-300">
            {/* Minimal Portal Header */}
            <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
                    <Link href="/portal/dashboard" className="flex items-center gap-2 group">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
                            <Icon name="waves" size="md" weight="fill" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">
                            ServicePRO <span className="text-secondary font-normal">Portal</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button className="text-sm font-medium text-text-muted hover:text-text transition-colors">
                            Yardım
                        </button>
                        <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-text font-bold border border-border">
                            M
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {children}
            </main>

            <footer className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-text-subtle border-t border-border mt-auto">
                © 2024 ServicePRO Enterprise • Tekne Sahibi Portalı
            </footer>
        </div>
    );
}
