'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeConfig {
    theme: {
        mode: 'dark' | 'light';
        primaryColor: string;
        secondaryColor: string;
        successColor: string;
        warningColor: string;
        errorColor: string;
        backgroundColor: string;
        surfaceColor: string;
        borderColor: string;
    };
    typography: {
        fontFamily: string;
        baseFontSize: number;
        headingWeight: number;
        bodyWeight: number;
    };
    layout: {
        borderRadius: number;
        spacing: 'compact' | 'normal' | 'relaxed';
        sidebarWidth: number;
    };
    branding: {
        appName: string;
        slogan: string;
        logoUrl: string | null;
        faviconUrl: string | null;
    };
}

interface ThemeContextType {
    theme: Theme;
    actualTheme: 'light' | 'dark';
    themeConfig: ThemeConfig | null;
    setTheme: (theme: Theme) => void;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    actualTheme: 'dark',
    themeConfig: null,
    setTheme: () => { },
    refreshTheme: async () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
}

export default function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');
    const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);

    // Initial load of theme preference
    useEffect(() => {
        const saved = localStorage.getItem('theme') as Theme | null;
        if (saved) {
            setTheme(saved);
        }
        refreshTheme();
    }, []);

    // Fetch config from API
    const refreshTheme = async () => {
        try {
            const res = await fetch('/api/config?section=appearance');
            if (res.ok) {
                const config = await res.json();
                setThemeConfig(config);
                applyThemeToDom(config);
            }
        } catch (error) {
            console.error('Failed to load theme config:', error);
        }
    };

    // Apply CSS variables to :root
    const applyThemeToDom = (config: ThemeConfig) => {
        const root = document.documentElement;

        // Apply Colors
        if (config.theme) {
            root.style.setProperty('--color-primary', config.theme.primaryColor);
            // We would need a utility to darken/lighten colors here for consistency
            // For now, we apply the main one.
            root.style.setProperty('--color-surface', config.theme.surfaceColor);
            root.style.setProperty('--color-bg', config.theme.backgroundColor);
            root.style.setProperty('--color-border', config.theme.borderColor);
        }

        // Apply Layout
        if (config.layout) {
            root.style.setProperty('--radius-sm', `${config.layout.borderRadius - 4}px`);
            root.style.setProperty('--radius-md', `${config.layout.borderRadius}px`);
            root.style.setProperty('--radius-lg', `${config.layout.borderRadius + 6}px`);
            root.style.setProperty('--sidebar-width', `${config.layout.sidebarWidth}px`);
        }

        // Apply Typography
        if (config.typography) {
            root.style.setProperty('--font-base', config.typography.fontFamily);
        }
    };

    // Handle System/Light/Dark logic
    useEffect(() => {
        let resolved: 'light' | 'dark' = 'dark';

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            resolved = prefersDark ? 'dark' : 'light';
        } else {
            resolved = theme;
        }

        setActualTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, themeConfig, setTheme, refreshTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Theme toggle button component
export function ThemeToggle() {
    const { theme, actualTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        if (theme === 'dark') setTheme('light');
        else if (theme === 'light') setTheme('system');
        else setTheme('dark');
    };

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Current: ${theme}. Click to change.`}
            aria-label="Toggle theme"
        >
            {actualTheme === 'dark' ? '🌙' : '☀️'}
            <style jsx>{`
                .theme-toggle {
                    background: var(--color-surface-elevated);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-full);
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    font-size: 1.1rem;
                }
                
                .theme-toggle:hover {
                    background: var(--color-border);
                    transform: scale(1.05);
                }
            `}</style>
        </button>
    );
}
