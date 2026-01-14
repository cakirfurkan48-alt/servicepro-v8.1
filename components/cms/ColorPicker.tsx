'use client';

import { useState } from 'react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
}

const presetColors = [
    '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6',
];

export default function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className="color-picker-wrapper">
            <label className="form-label">{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    style={{
                        width: '40px',
                        height: '40px',
                        background: value,
                        border: '2px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                />
                <input
                    type="text"
                    className="form-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: '120px', fontFamily: 'monospace' }}
                />
            </div>

            {showPicker && (
                <div style={{
                    position: 'absolute',
                    zIndex: 100,
                    marginTop: 'var(--space-sm)',
                    padding: 'var(--space-md)',
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-xs)' }}>
                        {presetColors.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    onChange(color);
                                    setShowPicker(false);
                                }}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    background: color,
                                    border: value === color ? '2px solid white' : 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ marginTop: 'var(--space-sm)' }}>
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            style={{ width: '100%', height: '32px', cursor: 'pointer' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
