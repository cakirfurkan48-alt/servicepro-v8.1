'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/components/Icon';

export default function LoginPage() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const error = searchParams.get('error');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Redirect if already logged in
    if (status === 'authenticated') {
        router.push(callbackUrl);
        return null;
    }

    const handleCredentialsLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                setLoginError('Giriş bilgileri hatalı.');
            } else if (result?.ok) {
                router.push(callbackUrl);
            }
        } catch (err) {
            setLoginError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl });
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full bg-bg animate-fade-in">
            {/* Left Side - Brand & Visuals */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-dark to-slate-900 text-white flex-col justify-center p-20 relative overflow-hidden">
                <div className="relative z-10 max-w-xl mx-auto">
                    <div className="mb-8 inline-flex p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
                        <Icon name="waves" size="2xl" className="text-white" weight="fill" />
                    </div>

                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight leading-tight">
                        ServicePRO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">Enterprise</span>
                    </h1>

                    <p className="text-xl text-white/80 mb-12 leading-relaxed">
                        Yeni nesil tekne teknik servis yönetim platformu.
                        <br />
                        Mükemmellik detaylarda gizlidir.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-lg font-medium text-white/90">
                            <div className="p-2 bg-accent-gold/20 rounded-lg text-accent-gold">
                                <Icon name="checkCircle" size="lg" weight="fill" />
                            </div>
                            <span>Marlin Yıldızı Puanlama Sistemi</span>
                        </div>
                        <div className="flex items-center gap-4 text-lg font-medium text-white/90">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <Icon name="lightning" size="lg" weight="fill" />
                            </div>
                            <span>Hızlı İş Emri Yönetimi</span>
                        </div>
                        <div className="flex items-center gap-4 text-lg font-medium text-white/90">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                <Icon name="chartBar" size="lg" weight="fill" />
                            </div>
                            <span>Gelişmiş Raporlama</span>
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -right-[20%] w-[800px] h-[800px] rounded-full bg-primary/20 blur-[100px]" />
                    <div className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-accent-gold/10 blur-[80px]" />
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-bg relative">
                <div className="w-full max-w-md p-10 glass-card rounded-2xl shadow-elevated relative z-10">
                    <div className="text-center mb-10">
                        <div className="lg:hidden mb-6 inline-flex p-3 bg-primary/10 rounded-xl text-primary">
                            <Icon name="waves" size="xl" weight="fill" />
                        </div>
                        <h2 className="text-2xl font-bold text-text mb-2">Hoş Geldiniz</h2>
                        <p className="text-text-muted">Hesabınıza giriş yapın</p>
                    </div>

                    {(error || loginError) && (
                        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
                            <Icon name="warningCircle" size="lg" />
                            <span>
                                {error === 'OAuthAccountNotLinked'
                                    ? 'Bu e-posta başka bir yöntemle kayıtlı.'
                                    : loginError || 'Giriş yapılamadı.'}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleCredentialsLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text ml-1">E-posta Adresi</label>
                            <div className="relative group">
                                <Icon name="envelope" size="md" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ornek@sirket.com"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-text focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-text-subtle"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text ml-1">Şifre</label>
                            <div className="relative group">
                                <Icon name="lock" size="md" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface text-text focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-text-subtle"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Icon name="spinner" size="md" className="animate-spin" />
                                    <span>Giriş Yapılıyor...</span>
                                </>
                            ) : (
                                <>
                                    <span>Giriş Yap</span>
                                    <Icon name="arrowRight" size="md" className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-surface text-text-muted">veya</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-surface hover:bg-surface-elevated text-text border border-border hover:border-text-muted font-medium py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-3 group"
                    >
                        <Icon name="googleLogo" size="lg" />
                        <span>Google ile Devam Et</span>
                    </button>

                    <div className="mt-10 text-center">
                        <p className="text-xs text-text-subtle">
                            © 2024 ServicePRO v9.0 • Enterprise Edition
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
