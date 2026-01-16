'use client';

import { useState } from 'react';
import { APP_ICONS } from '@/lib/icons';
import { Icon } from '@/components/Icon';

interface IconPickerProps {
    value: string;
    onChange: (iconName: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const icons = Object.keys(APP_ICONS);
    const filteredIcons = icons.filter(icon =>
        icon.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--color-text)',
                }}
            >
                {value ? <Icon name={value as any} size="lg" /> : <span>❓</span>}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    zIndex: 100,
                    marginTop: 'var(--space-xs)',
                    width: '300px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 'var(--space-md)',
                }}>
                    <input
                        type="text"
                        placeholder="İkon ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 'var(--space-sm)',
                            marginBottom: 'var(--space-md)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-bg)',
                            color: 'var(--color-text)',
                        }}
                        autoFocus
                    />

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: 'var(--space-sm)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                    }}>
                        {filteredIcons.map(iconName => (
                            <button
                                key={iconName}
                                type="button"
                                onClick={() => {
                                    onChange(iconName);
                                    setIsOpen(false);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    aspectRatio: '1',
                                    background: value === iconName ? 'var(--color-primary)' : 'var(--color-surface-elevated)',
                                    color: value === iconName ? 'white' : 'var(--color-text)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                }}
                                title={iconName}
                            >
                                <Icon name={iconName as any} size="md" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99,
                    }}
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
