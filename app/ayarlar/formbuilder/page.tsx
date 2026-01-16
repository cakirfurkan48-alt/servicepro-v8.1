'use client';

import { useState, useEffect } from 'react';

interface FormField {
    id: string;
    formType: string;
    fieldKey: string;
    label: string;
    type: string;
    placeholder?: string;
    helpText?: string;
    defaultValue?: string;
    options?: any;
    validation?: any;
    sortOrder: number;
    active: boolean;
    visibleTo: string[];
    editableBy: string[];
}

const FIELD_TYPES = [
    { value: 'TEXT', label: 'Metin', icon: '📝' },
    { value: 'TEXTAREA', label: 'Uzun Metin', icon: '📄' },
    { value: 'NUMBER', label: 'Sayı', icon: '🔢' },
    { value: 'DATE', label: 'Tarih', icon: '📅' },
    { value: 'DATETIME', label: 'Tarih/Saat', icon: '🕐' },
    { value: 'SELECT', label: 'Seçim Listesi', icon: '📋' },
    { value: 'MULTISELECT', label: 'Çoklu Seçim', icon: '☑️' },
    { value: 'CHECKBOX', label: 'Onay Kutusu', icon: '✅' },
    { value: 'RADIO', label: 'Radyo Buton', icon: '🔘' },
    { value: 'FILE', label: 'Dosya', icon: '📎' },
];

export default function FormBuilderPage() {
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingField, setEditingField] = useState<FormField | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newField, setNewField] = useState({
        label: '',
        type: 'TEXT',
        placeholder: '',
        helpText: '',
        options: '',
    });

    const fetchFields = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/formfields?active=false');
            const data = await res.json();
            setFields(data);
        } catch (err) {
            console.error('Failed to fetch fields:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
    }, []);

    const handleCreate = async () => {
        try {
            const payload: any = {
                label: newField.label,
                type: newField.type,
                placeholder: newField.placeholder || undefined,
                helpText: newField.helpText || undefined,
            };

            // Parse options for select/multiselect/radio
            if (['SELECT', 'MULTISELECT', 'RADIO'].includes(newField.type) && newField.options) {
                payload.options = newField.options.split('\n').map((opt: string) => opt.trim()).filter(Boolean);
            }

            const res = await fetch('/api/admin/formfields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewField({ label: '', type: 'TEXT', placeholder: '', helpText: '', options: '' });
                fetchFields();
            } else {
                const err = await res.json();
                alert(err.error || 'Alan oluşturulamadı');
            }
        } catch (err) {
            console.error('Create error:', err);
        }
    };

    const handleUpdate = async (field: FormField) => {
        try {
            const res = await fetch('/api/admin/formfields', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(field),
            });

            if (res.ok) {
                setEditingField(null);
                fetchFields();
            }
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu alanı silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/formfields?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchFields();
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleToggleActive = async (field: FormField) => {
        await handleUpdate({ ...field, active: !field.active });
    };

    const moveField = async (field: FormField, direction: 'up' | 'down') => {
        const idx = fields.findIndex(f => f.id === field.id);
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;

        if (newIdx < 0 || newIdx >= fields.length) return;

        const newFields = [...fields];
        [newFields[idx], newFields[newIdx]] = [newFields[newIdx], newFields[idx]];

        // Update sortOrder for both fields
        await handleUpdate({ ...newFields[idx], sortOrder: idx });
        await handleUpdate({ ...newFields[newIdx], sortOrder: newIdx });
    };

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">🛠️ Form Builder</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Servis formuna özel alanlar ekleyin
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    ➕ Yeni Alan Ekle
                </button>
            </header>

            {/* Fields List */}
            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>⏳ Yükleniyor...</div>
                ) : fields.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                        Henüz özel alan eklenmemiş
                    </div>
                ) : (
                    <div className="fields-list">
                        {fields.map((field, idx) => (
                            <div
                                key={field.id}
                                className={`field-item ${!field.active ? 'inactive' : ''}`}
                            >
                                <div className="field-drag">
                                    <button
                                        className="move-btn"
                                        disabled={idx === 0}
                                        onClick={() => moveField(field, 'up')}
                                    >▲</button>
                                    <button
                                        className="move-btn"
                                        disabled={idx === fields.length - 1}
                                        onClick={() => moveField(field, 'down')}
                                    >▼</button>
                                </div>

                                <div className="field-icon">
                                    {FIELD_TYPES.find(t => t.value === field.type)?.icon || '📝'}
                                </div>

                                <div className="field-info">
                                    <div className="field-label">{field.label}</div>
                                    <div className="field-meta">
                                        <span className="field-key">{field.fieldKey}</span>
                                        <span className="field-type">{field.type}</span>
                                    </div>
                                </div>

                                <div className="field-actions">
                                    <button
                                        className={`toggle-btn ${field.active ? 'active' : ''}`}
                                        onClick={() => handleToggleActive(field)}
                                    >
                                        {field.active ? '✓ Aktif' : '✗ Pasif'}
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setEditingField(field)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleDelete(field.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Yeni Alan Ekle</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Alan Adı *</label>
                                <input
                                    className="form-input"
                                    value={newField.label}
                                    onChange={e => setNewField({ ...newField, label: e.target.value })}
                                    placeholder="örn: Garanti Durumu"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Alan Tipi *</label>
                                <select
                                    className="form-input"
                                    value={newField.type}
                                    onChange={e => setNewField({ ...newField, type: e.target.value })}
                                >
                                    {FIELD_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>
                                            {t.icon} {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Placeholder</label>
                                <input
                                    className="form-input"
                                    value={newField.placeholder}
                                    onChange={e => setNewField({ ...newField, placeholder: e.target.value })}
                                    placeholder="Kullanıcıya gösterilecek örnek metin"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Yardım Metni</label>
                                <input
                                    className="form-input"
                                    value={newField.helpText}
                                    onChange={e => setNewField({ ...newField, helpText: e.target.value })}
                                    placeholder="Alan hakkında açıklama"
                                />
                            </div>

                            {['SELECT', 'MULTISELECT', 'RADIO'].includes(newField.type) && (
                                <div className="form-group">
                                    <label className="form-label">Seçenekler (her satıra bir seçenek)</label>
                                    <textarea
                                        className="form-input"
                                        rows={4}
                                        value={newField.options}
                                        onChange={e => setNewField({ ...newField, options: e.target.value })}
                                        placeholder="Seçenek 1&#10;Seçenek 2&#10;Seçenek 3"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                İptal
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={!newField.label}
                            >
                                Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .fields-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    background: var(--color-border);
                }

                .field-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-md);
                    background: var(--color-surface);
                    transition: opacity 0.2s;
                }

                .field-item.inactive {
                    opacity: 0.5;
                }

                .field-drag {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .move-btn {
                    background: var(--color-bg);
                    border: 1px solid var(--color-border);
                    padding: 2px 6px;
                    cursor: pointer;
                    border-radius: 2px;
                    font-size: 0.7rem;
                }

                .move-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .field-icon {
                    font-size: 1.5rem;
                    width: 40px;
                    text-align: center;
                }

                .field-info {
                    flex: 1;
                }

                .field-label {
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .field-meta {
                    display: flex;
                    gap: var(--space-sm);
                    font-size: 0.8rem;
                    color: var(--color-text-muted);
                }

                .field-key {
                    font-family: monospace;
                    background: var(--color-bg);
                    padding: 2px 6px;
                    border-radius: 2px;
                }

                .field-type {
                    color: var(--color-primary);
                }

                .field-actions {
                    display: flex;
                    gap: var(--space-xs);
                }

                .toggle-btn {
                    padding: 4px 8px;
                    border: 1px solid var(--color-border);
                    background: var(--color-bg);
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    font-size: 0.8rem;
                }

                .toggle-btn.active {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: var(--color-success);
                    color: var(--color-success);
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: var(--color-surface);
                    border-radius: var(--radius-lg);
                    width: 90%;
                    max-width: 500px;
                    border: 1px solid var(--color-border);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-lg);
                    border-bottom: 1px solid var(--color-border);
                }

                .modal-header h3 { margin: 0; }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: var(--color-text-muted);
                }

                .modal-body {
                    padding: var(--space-lg);
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--space-sm);
                    padding: var(--space-lg);
                    border-top: 1px solid var(--color-border);
                }
            `}</style>
        </div>
    );
}
