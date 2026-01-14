'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin-context';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAdmin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Giriş başarısız');
                setLoading(false);
                return;
            }

            // Use context login method
            login(data.user);

            // Force page reload to update layout
            window.location.href = '/';
        } catch (err) {
            setError('Bağlantı hatası');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--color-bg) 0%, #1a1a2e 100%)',
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: 'var(--space-2xl)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⚓</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>ServicePRO</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        Tekne Teknik Servis Takip Sistemi
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: 'var(--space-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-error)',
                        marginBottom: 'var(--space-lg)',
                        fontSize: '0.85rem',
                    }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 'var(--space-xs)',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-muted)',
                        }}>
                            E-posta
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="ornek@servicepro.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--space-xl)' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 'var(--space-xs)',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-muted)',
                        }}>
                            Şifre
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: 'var(--space-md)',
                            fontSize: '1rem',
                        }}
                    >
                        {loading ? '⏳ Giriş yapılıyor...' : '🔐 Giriş Yap'}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div style={{
                    marginTop: 'var(--space-xl)',
                    padding: 'var(--space-md)',
                    background: 'var(--color-surface-elevated)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                }}>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-xs)' }}>
                        Demo Giriş Bilgileri:
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Admin:</span>
                        <code>furkan@servicepro.com / admin123</code>
                    </div>
                </div>
            </div>
        </div>
    );
}
