'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/lib/admin-context';
import { useTheme } from '@/components/ThemeProvider';
import ColorPicker from '@/components/cms/ColorPicker';

interface ThemeConfig {
    mode: 'dark' | 'light';
    primaryColor: string;
    secondaryColor: string;
    successColor: string;
    warningColor: string;
    errorColor: string;
    backgroundColor: string;
    surfaceColor: string;
    borderColor: string;
}

interface TypographyConfig {
    fontFamily: string;
    baseFontSize: number;
    headingWeight: number;
    bodyWeight: number;
}

interface LayoutConfig {
    borderRadius: number;
    spacing: 'compact' | 'normal' | 'relaxed';
    sidebarWidth: number;
}

interface BrandingConfig {
    appName: string;
    slogan: string;
    logoUrl: string | null;
    faviconUrl: string | null;
}

interface AppearanceConfig {
    theme: ThemeConfig;
    typography: TypographyConfig;
    layout: LayoutConfig;
    branding: BrandingConfig;
}

const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat',
    'Source Sans Pro', 'Nunito', 'Lato', 'Raleway', 'Ubuntu'
];

export default function GorunumPage() {
    const { isAdmin } = useAdmin();
    const { refreshTheme } = useTheme();
    const [appearance, setAppearance] = useState<AppearanceConfig | null>(null);
    const [activeTab, setActiveTab] = useState<'theme' | 'typography' | 'layout' | 'branding'>('theme');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const res = await fetch('/api/config?section=appearance');
            const data = await res.json();
            setAppearance(data);
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    };

    const saveConfig = async () => {
        if (!appearance) return;
        setSaving(true);
        try {
            await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appearance }),
            });
            await refreshTheme(); // Applies changes instantly
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save config:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateTheme = (key: keyof ThemeConfig, value: any) => {
        if (!appearance) return;
        setAppearance({
            ...appearance,
            theme: { ...appearance.theme, [key]: value }
        });
    };

    const updateTypography = (key: keyof TypographyConfig, value: any) => {
        if (!appearance) return;
        setAppearance({
            ...appearance,
            typography: { ...appearance.typography, [key]: value }
        });
    };

    const updateLayout = (key: keyof LayoutConfig, value: any) => {
        if (!appearance) return;
        setAppearance({
            ...appearance,
            layout: { ...appearance.layout, [key]: value }
        });
    };

    const updateBranding = (key: keyof BrandingConfig, value: any) => {
        if (!appearance) return;
        setAppearance({
            ...appearance,
            branding: { ...appearance.branding, [key]: value }
        });
    };

    if (!isAdmin) {
        return <div className="card">Yetkiniz yok.</div>;
    }

    if (!appearance) {
        return <div className="card">Yükleniyor...</div>;
    }

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                        <Link href="/ayarlar" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>⚙️ Ayarlar</Link>
                        <span style={{ color: 'var(--color-text-subtle)' }}>/</span>
                    </div>
                    <h1 className="page-title">🎨 Görünüm Ayarları</h1>
                </div>
                <button
                    onClick={saveConfig}
                    disabled={saving}
                    className="btn btn-primary"
                >
                    {saving ? '⏳ Kaydediliyor...' : saved ? '✅ Kaydedildi!' : '💾 Değişiklikleri Kaydet'}
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-lg)' }}>
                {/* Sidebar Tabs */}
                <div className="card" style={{ padding: 'var(--space-sm)' }}>
                    {[
                        { id: 'theme', label: '🎨 Tema & Renkler', icon: '🎨' },
                        { id: 'typography', label: '📝 Tipografi', icon: '📝' },
                        { id: 'layout', label: '📐 Layout', icon: '📐' },
                        { id: 'branding', label: '🏷️ Marka', icon: '🏷️' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: 'var(--space-md)',
                                textAlign: 'left',
                                background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--color-text)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                marginBottom: 'var(--space-xs)',
                                fontSize: '0.9rem',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="card">
                    {activeTab === 'theme' && (
                        <div>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>🎨 Tema & Renkler</h3>

                            <div style={{ marginBottom: 'var(--space-xl)' }}>
                                <label className="form-label">Tema Modu</label>
                                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                    {['dark', 'light'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => updateTheme('mode', mode)}
                                            style={{
                                                padding: 'var(--space-md) var(--space-xl)',
                                                background: appearance.theme.mode === mode ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                                                color: appearance.theme.mode === mode ? 'white' : 'var(--color-text)',
                                                border: 'none',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {mode === 'dark' ? '🌙 Karanlık' : '☀️ Açık'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                                <ColorPicker label="Ana Renk" value={appearance.theme.primaryColor} onChange={(v) => updateTheme('primaryColor', v)} />
                                <ColorPicker label="İkincil Renk" value={appearance.theme.secondaryColor} onChange={(v) => updateTheme('secondaryColor', v)} />
                                <ColorPicker label="Başarı Rengi" value={appearance.theme.successColor} onChange={(v) => updateTheme('successColor', v)} />
                                <ColorPicker label="Uyarı Rengi" value={appearance.theme.warningColor} onChange={(v) => updateTheme('warningColor', v)} />
                                <ColorPicker label="Hata Rengi" value={appearance.theme.errorColor} onChange={(v) => updateTheme('errorColor', v)} />
                                <ColorPicker label="Arkaplan" value={appearance.theme.backgroundColor} onChange={(v) => updateTheme('backgroundColor', v)} />
                                <ColorPicker label="Yüzey Rengi" value={appearance.theme.surfaceColor} onChange={(v) => updateTheme('surfaceColor', v)} />
                                <ColorPicker label="Kenarlık Rengi" value={appearance.theme.borderColor} onChange={(v) => updateTheme('borderColor', v)} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'typography' && (
                        <div>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>📝 Tipografi</h3>

                            <div className="form-group">
                                <label className="form-label">Font Ailesi</label>
                                <select
                                    className="form-select"
                                    value={appearance.typography.fontFamily}
                                    onChange={(e) => updateTypography('fontFamily', e.target.value)}
                                >
                                    {fontOptions.map(font => (
                                        <option key={font} value={font}>{font}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Temel Font Boyutu: {appearance.typography.baseFontSize}px</label>
                                <input
                                    type="range"
                                    min="12"
                                    max="20"
                                    value={appearance.typography.baseFontSize}
                                    onChange={(e) => updateTypography('baseFontSize', parseInt(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Başlık Ağırlığı: {appearance.typography.headingWeight}</label>
                                <input
                                    type="range"
                                    min="400"
                                    max="900"
                                    step="100"
                                    value={appearance.typography.headingWeight}
                                    onChange={(e) => updateTypography('headingWeight', parseInt(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>Önizleme:</p>
                                <h2 style={{ fontFamily: appearance.typography.fontFamily, fontWeight: appearance.typography.headingWeight }}>
                                    Başlık Örneği
                                </h2>
                                <p style={{ fontFamily: appearance.typography.fontFamily, fontSize: `${appearance.typography.baseFontSize}px` }}>
                                    Bu bir paragraf örneğidir. Font ailesi ve boyutu burada görünür.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'layout' && (
                        <div>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>📐 Layout Ayarları</h3>

                            <div className="form-group">
                                <label className="form-label">Köşe Yuvarlaklığı: {appearance.layout.borderRadius}px</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    value={appearance.layout.borderRadius}
                                    onChange={(e) => updateLayout('borderRadius', parseInt(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Spacing Ölçeği</label>
                                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                    {['compact', 'normal', 'relaxed'].map(sp => (
                                        <button
                                            key={sp}
                                            onClick={() => updateLayout('spacing', sp as any)}
                                            style={{
                                                padding: 'var(--space-md) var(--space-xl)',
                                                background: appearance.layout.spacing === sp ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                                                color: appearance.layout.spacing === sp ? 'white' : 'var(--color-text)',
                                                border: 'none',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {sp === 'compact' ? 'Sıkışık' : sp === 'normal' ? 'Normal' : 'Geniş'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sidebar Genişliği: {appearance.layout.sidebarWidth}px</label>
                                <input
                                    type="range"
                                    min="200"
                                    max="320"
                                    value={appearance.layout.sidebarWidth}
                                    onChange={(e) => updateLayout('sidebarWidth', parseInt(e.target.value))}
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ marginTop: 'var(--space-xl)', display: 'flex', gap: 'var(--space-md)' }}>
                                <div style={{
                                    padding: 'var(--space-lg)',
                                    background: 'var(--color-surface-elevated)',
                                    borderRadius: `${appearance.layout.borderRadius}px`,
                                    flex: 1,
                                }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Köşe önizleme</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'branding' && (
                        <div>
                            <h3 style={{ marginBottom: 'var(--space-lg)' }}>🏷️ Marka Ayarları</h3>

                            <div className="form-group">
                                <label className="form-label">Uygulama Adı</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={appearance.branding.appName}
                                    onChange={(e) => updateBranding('appName', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Slogan</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={appearance.branding.slogan}
                                    onChange={(e) => updateBranding('slogan', e.target.value)}
                                />
                            </div>

                            <div style={{
                                marginTop: 'var(--space-xl)',
                                padding: 'var(--space-lg)',
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>⚓</div>
                                <h2 style={{ color: appearance.theme.primaryColor }}>{appearance.branding.appName}</h2>
                                <p style={{ color: 'var(--color-text-muted)' }}>{appearance.branding.slogan}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
