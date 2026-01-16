'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';

interface AuditLog {
    id: string;
    userId: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    oldValue: any;
    newValue: any;
    ipAddress: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, pages: 0 });
    const [loading, setLoading] = useState(true);
    const [entityFilter, setEntityFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '50' });
            if (entityFilter) params.set('entity', entityFilter);
            if (actionFilter) params.set('action', actionFilter);

            const res = await fetch(`/api/admin/audit?${params}`);
            const data = await res.json();
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [entityFilter, actionFilter]);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return '#10b981';
            case 'UPDATE': return '#0ea5e9';
            case 'DELETE': return '#ef4444';
            case 'LOGIN': return '#8b5cf6';
            case 'LOGOUT': return '#6366f1';
            case 'STATUS_CHANGE': return '#f59e0b';
            case 'OVERRIDE': return '#ec4899';
            default: return '#64748b';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">📜 Denetim Kayıtları</h1>
                    <p className="text-muted">
                        Toplam {pagination.total} kayıt
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="card mb-lg">
                <div className="filter-bar">
                    <select
                        className="form-input filter-select"
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        aria-label="Varlık Filtresi"
                    >
                        <option value="">Tüm Varlıklar</option>
                        <option value="Service">Servis</option>
                        <option value="Personnel">Personel</option>
                        <option value="User">Kullanıcı</option>
                        <option value="ConfigStatus">Durum</option>
                        <option value="ConfigLocation">Konum</option>
                        <option value="ConfigJobType">İş Türü</option>
                        <option value="MenuItem">Menü</option>
                        <option value="AppConfig">Görünüm</option>
                    </select>

                    <select
                        className="form-input filter-select"
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        aria-label="İşlem Filtresi"
                    >
                        <option value="">Tüm İşlemler</option>
                        <option value="CREATE">Oluşturma</option>
                        <option value="UPDATE">Güncelleme</option>
                        <option value="DELETE">Silme</option>
                        <option value="LOGIN">Giriş</option>
                        <option value="STATUS_CHANGE">Durum Değişikliği</option>
                        <option value="OVERRIDE">Override</option>
                    </select>

                    <button className="btn btn-secondary" onClick={() => fetchLogs(1)}>
                        <Icon name="ArrowsClockwise" size="md" />
                        Yenile
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card">
                {loading ? (
                    <div className="loading-container">
                        <Icon name="Spinner" size="xl" className="loading-icon animate-spin" />
                        <p>Yükleniyor...</p>
                    </div>
                ) : (
                    <>
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '180px' }}>Tarih</th>
                                    <th style={{ width: '140px' }}>İşlem</th>
                                    <th style={{ width: '140px' }}>Varlık</th>
                                    <th>Kullanıcı</th>
                                    <th style={{ width: '80px' }}>Detay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <>
                                        <tr key={log.id} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                                            <td>{formatDate(log.createdAt)}</td>
                                            <td>
                                                <span
                                                    className="action-badge"
                                                    style={{
                                                        backgroundColor: getActionColor(log.action) + '20',
                                                        color: getActionColor(log.action),
                                                        borderColor: getActionColor(log.action)
                                                    }}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>{log.entity}</td>
                                            <td>{log.user?.name || 'Sistem'}</td>
                                            <td className="text-center">
                                                <button className="expand-btn">
                                                    <Icon name={expandedLog === log.id ? 'CaretUp' : 'CaretDown'} size="sm" />
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedLog === log.id && (
                                            <tr key={`${log.id}-detail`} className="detail-row">
                                                <td colSpan={5}>
                                                    <div className="log-detail">
                                                        <div className="detail-section">
                                                            <strong>Entity ID:</strong> {log.entityId || 'N/A'}
                                                        </div>
                                                        <div className="detail-section">
                                                            <strong>IP Adresi:</strong> {log.ipAddress || 'N/A'}
                                                        </div>
                                                        {log.oldValue && (
                                                            <div className="detail-section">
                                                                <strong>Önceki Değer:</strong>
                                                                <pre>{JSON.stringify(log.oldValue, null, 2)}</pre>
                                                            </div>
                                                        )}
                                                        {log.newValue && (
                                                            <div className="detail-section">
                                                                <strong>Yeni Değer:</strong>
                                                                <pre>{JSON.stringify(log.newValue, null, 2)}</pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="pagination-container">
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => fetchLogs(pagination.page - 1)}
                                >
                                    <Icon name="CaretLeft" size="sm" />
                                    Önceki
                                </button>
                                <span>
                                    Sayfa {pagination.page} / {pagination.pages}
                                </span>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => fetchLogs(pagination.page + 1)}
                                >
                                    Sonraki
                                    <Icon name="CaretRight" size="sm" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
