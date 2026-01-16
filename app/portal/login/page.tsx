'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';

export default function PortalLoginPage() {
    const router = useRouter();
    const [accessCode, setAccessCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            router.push('/portal/dashboard');
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md p-8 glass-card rounded-2xl animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-text mb-2">Tekne Sahibi Girişi</h1>
                    <p className="text-text-muted">Size verilen 6 haneli erişim kodunu giriniz.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text ml-1">Erişim Kodu</label>
                        <div className="relative group">
                            <Icon name="lock" size="md" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                placeholder="******"
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-text focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-text-subtle text-center text-lg tracking-widest uppercase font-mono"
                                required
                                maxLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 disabled:opacity-70 flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Icon name="spinner" size="md" className="animate-spin" />
                                <span>Doğrulanıyor...</span>
                            </>
                        ) : (
                            <>
                                <span>Giriş Yap</span>
                                <Icon name="arrowRight" size="md" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button className="text-sm text-primary hover:underline">
                        Kodu unuttum / Mail ile gönder
                    </button>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-text-subtle text-sm">
                <Icon name="checkCircle" size="sm" className="text-success" />
                <span>256-bit SSL ile korunmaktadır</span>
            </div>
        </div>
    );
}
