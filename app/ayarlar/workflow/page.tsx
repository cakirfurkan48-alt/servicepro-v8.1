'use client';

import { useState, useEffect } from 'react';

interface WorkflowTransition {
    id: string;
    fromStatusKey: string;
    toStatusKey: string;
    allowedRoles: string[];
    requiresNote: boolean;
    requiresParts: boolean;
    autoActions: any;
    active: boolean;
    fromStatus: { label: string; color: string };
    toStatus: { label: string; color: string };
}

interface Status {
    id: string;
    key: string;
    label: string;
    color: string;
}

export default function WorkflowPage() {
    const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTransition, setEditingTransition] = useState<WorkflowTransition | null>(null);
    const [newTransition, setNewTransition] = useState({
        fromStatusKey: '',
        toStatusKey: '',
        requiresNote: false,
        requiresParts: false,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/workflow?active=false');
            const data = await res.json();
            setTransitions(data.transitions);
            setStatuses(data.statuses);
        } catch (err) {
            console.error('Failed to fetch workflow:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async () => {
        if (!newTransition.fromStatusKey || !newTransition.toStatusKey) {
            alert('Başlangıç ve hedef durum seçiniz');
            return;
        }

        if (newTransition.fromStatusKey === newTransition.toStatusKey) {
            alert('Başlangıç ve hedef durum aynı olamaz');
            return;
        }

        try {
            const res = await fetch('/api/admin/workflow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTransition),
            });

            if (res.ok) {
                setShowAddModal(false);
                setNewTransition({ fromStatusKey: '', toStatusKey: '', requiresNote: false, requiresParts: false });
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || 'Geçiş oluşturulamadı');
            }
        } catch (err) {
            console.error('Create error:', err);
        }
    };

    const handleUpdate = async (transition: WorkflowTransition) => {
        try {
            const res = await fetch('/api/admin/workflow', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: transition.id,
                    requiresNote: transition.requiresNote,
                    requiresParts: transition.requiresParts,
                    active: transition.active,
                }),
            });

            if (res.ok) {
                setEditingTransition(null);
                fetchData();
            }
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu geçişi silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/workflow?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleToggleActive = async (transition: WorkflowTransition) => {
        await handleUpdate({ ...transition, active: !transition.active });
    };

    // Group transitions by fromStatus for visualization
    const groupedTransitions = statuses.map(status => ({
        status,
        outgoing: transitions.filter(t => t.fromStatusKey === status.key),
    }));

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">🔄 Workflow Editor</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Durum geçiş kurallarını yönetin
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    ➕ Yeni Geçiş Ekle
                </button>
            </header>

            {/* Visual Workflow Diagram */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 style={{ marginBottom: 'var(--space-md)' }}>📊 Workflow Diyagramı</h3>
                <div className="workflow-diagram">
                    {statuses.map(status => (
                        <div key={status.key} className="status-node" style={{ borderColor: status.color }}>
                            <div className="status-header" style={{ backgroundColor: status.color + '20' }}>
                                {status.label}
                            </div>
                            <div className="status-transitions">
                                {transitions
                                    .filter(t => t.fromStatusKey === status.key && t.active)
                                    .map(t => (
                                        <div key={t.id} className="transition-arrow">
                                            → {t.toStatus.label}
                                            {t.requiresNote && ' 📝'}
                                            {t.requiresParts && ' 📦'}
                                        </div>
                                    ))
                                }
                                {transitions.filter(t => t.fromStatusKey === status.key && t.active).length === 0 && (
                                    <div className="no-transitions">Çıkış yok</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transitions Table */}
            <div className="card">
                <h3 style={{ marginBottom: 'var(--space-md)' }}>📋 Tüm Geçişler</h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>⏳ Yükleniyor...</div>
                ) : (
                    <table className="workflow-table">
                        <thead>
                            <tr>
                                <th>Başlangıç</th>
                                <th>→</th>
                                <th>Hedef</th>
                                <th>Not Gerekli</th>
                                <th>Parça Gerekli</th>
                                <th>Durum</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transitions.map(t => (
                                <tr key={t.id} className={!t.active ? 'inactive' : ''}>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: t.fromStatus.color + '20', color: t.fromStatus.color }}
                                        >
                                            {t.fromStatusKey === '*' ? 'Herhangi' : t.fromStatus.label}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: '1.2rem' }}>→</td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: t.toStatus.color + '20', color: t.toStatus.color }}
                                        >
                                            {t.toStatus.label}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {t.requiresNote ? '✅' : '—'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {t.requiresParts ? '✅' : '—'}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            className={`toggle-btn ${t.active ? 'active' : ''}`}
                                            onClick={() => handleToggleActive(t)}
                                        >
                                            {t.active ? 'Aktif' : 'Pasif'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setEditingTransition(t)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleDelete(t.id)}
                                            style={{ marginLeft: '4px' }}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Yeni Geçiş Ekle</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Başlangıç Durumu *</label>
                                <select
                                    className="form-input"
                                    value={newTransition.fromStatusKey}
                                    onChange={e => setNewTransition({ ...newTransition, fromStatusKey: e.target.value })}
                                >
                                    <option value="">Seçiniz...</option>
                                    <option value="*">* Herhangi bir durum</option>
                                    {statuses.map(s => (
                                        <option key={s.key} value={s.key}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Hedef Durum *</label>
                                <select
                                    className="form-input"
                                    value={newTransition.toStatusKey}
                                    onChange={e => setNewTransition({ ...newTransition, toStatusKey: e.target.value })}
                                >
                                    <option value="">Seçiniz...</option>
                                    {statuses.map(s => (
                                        <option key={s.key} value={s.key}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={newTransition.requiresNote}
                                        onChange={e => setNewTransition({ ...newTransition, requiresNote: e.target.checked })}
                                    />
                                    📝 Not gerekli
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={newTransition.requiresParts}
                                        onChange={e => setNewTransition({ ...newTransition, requiresParts: e.target.checked })}
                                    />
                                    📦 Parça bilgisi gerekli
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>İptal</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Oluştur</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingTransition && (
                <div className="modal-overlay" onClick={() => setEditingTransition(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Geçişi Düzenle</h3>
                            <button className="modal-close" onClick={() => setEditingTransition(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="transition-preview">
                                <span style={{ color: editingTransition.fromStatus.color }}>
                                    {editingTransition.fromStatus.label}
                                </span>
                                <span> → </span>
                                <span style={{ color: editingTransition.toStatus.color }}>
                                    {editingTransition.toStatus.label}
                                </span>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={editingTransition.requiresNote}
                                        onChange={e => setEditingTransition({
                                            ...editingTransition,
                                            requiresNote: e.target.checked
                                        })}
                                    />
                                    📝 Not gerekli
                                </label>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={editingTransition.requiresParts}
                                        onChange={e => setEditingTransition({
                                            ...editingTransition,
                                            requiresParts: e.target.checked
                                        })}
                                    />
                                    📦 Parça bilgisi gerekli
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setEditingTransition(null)}>İptal</button>
                            <button className="btn btn-primary" onClick={() => handleUpdate(editingTransition)}>Kaydet</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .workflow-diagram {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: var(--space-md);
                }

                .status-node {
                    border: 2px solid;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }

                .status-header {
                    padding: var(--space-sm);
                    font-weight: 600;
                    text-align: center;
                }

                .status-transitions {
                    padding: var(--space-sm);
                    font-size: 0.85rem;
                }

                .transition-arrow {
                    padding: 4px 0;
                    color: var(--color-text-muted);
                }

                .no-transitions {
                    color: var(--color-text-subtle);
                    font-style: italic;
                }

                .workflow-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .workflow-table th,
                .workflow-table td {
                    padding: var(--space-md);
                    border-bottom: 1px solid var(--color-border);
                }

                .workflow-table th {
                    background: var(--color-bg);
                    font-weight: 600;
                    text-align: left;
                }

                .workflow-table tr.inactive {
                    opacity: 0.5;
                }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-weight: 500;
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

                .transition-preview {
                    text-align: center;
                    font-size: 1.25rem;
                    font-weight: 600;
                    padding: var(--space-md);
                    background: var(--color-bg);
                    border-radius: var(--radius-md);
                    margin-bottom: var(--space-lg);
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    cursor: pointer;
                }

                .checkbox-label input {
                    width: 18px;
                    height: 18px;
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
                    max-width: 450px;
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
