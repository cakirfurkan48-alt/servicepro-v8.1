'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdmin } from '@/lib/admin-context';

interface EditableTextProps {
    children: string;
    path: string; // Path in settings.json like "konumlar.yatmarin.label"
    className?: string;
    style?: React.CSSProperties;
    tag?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

export default function EditableText({
    children,
    path,
    className = '',
    style = {},
    tag = 'span',
}: EditableTextProps) {
    const { isAdmin, isEditMode } = useAdmin();
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(children);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(children);
    }, [children]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        if (isAdmin && isEditMode) {
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (value === children) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        try {
            // Save to API
            await fetch('/api/labels', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, value }),
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save:', error);
            setValue(children); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setValue(children);
            setIsEditing(false);
        }
    };

    const handleBlur = () => {
        handleSave();
    };

    const Tag = tag;

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                disabled={isSaving}
                style={{
                    background: 'var(--color-surface-elevated)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 6px',
                    color: 'var(--color-text)',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                    width: `${Math.max(value.length * 8, 50)}px`,
                    ...style,
                }}
            />
        );
    }

    return (
        <Tag
            className={className}
            style={{
                ...style,
                cursor: isAdmin && isEditMode ? 'text' : 'inherit',
                outline: isAdmin && isEditMode ? '1px dashed var(--color-primary)' : 'none',
                outlineOffset: '2px',
            }}
            onDoubleClick={handleDoubleClick}
            title={isAdmin && isEditMode ? 'Düzenlemek için çift tıklayın' : undefined}
        >
            {value}
        </Tag>
    );
}
