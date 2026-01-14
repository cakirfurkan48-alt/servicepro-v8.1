'use client';

import { useAdmin } from '@/lib/admin-context';

export default function AdminEditBar() {
    const { isAdmin, isEditMode, toggleEditMode, user } = useAdmin();

    if (!isAdmin) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: '260px', // Sidebar width
                right: 0,
                height: '40px',
                background: isEditMode
                    ? 'linear-gradient(90deg, var(--color-warning) 0%, #f59e0b 100%)'
                    : 'linear-gradient(90deg, var(--color-primary) 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--space-lg)',
                zIndex: 1000,
                boxShadow: 'var(--shadow-md)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                    👑 Admin Modu
                </span>
                {isEditMode && (
                    <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'white',
                    }}>
                        ✏️ Düzenleme aktif - Metinlere çift tıklayarak düzenleyin
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                    {user?.ad}
                </span>
                <button
                    onClick={toggleEditMode}
                    style={{
                        padding: '4px 12px',
                        background: isEditMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 'var(--radius-md)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        transition: 'all 0.2s',
                    }}
                >
                    {isEditMode ? '✓ Düzenlemeyi Bitir' : '✏️ Düzenleme Modu'}
                </button>
            </div>
        </div>
    );
}
