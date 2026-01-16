'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useServices, updateService, Service } from '@/lib/hooks';
import CalendarView from '@/components/CalendarView';

export default function TakvimPage() {
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const { services, loading, error, refetch } = useServices();
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const handleDateChange = async (serviceId: string, newDate: string) => {
        try {
            await updateService(serviceId, { scheduledDate: newDate } as any);
            refetch();
        } catch (err) {
            console.error('Failed to update service date:', err);
            alert('Tarih güncellenemedi');
        }
    };

    const handleServiceClick = (service: Service) => {
        setSelectedService(service);
    };

    const closeModal = () => {
        setSelectedService(null);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">⏳</div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>❌ Hata</h2>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={refetch}>Tekrar Dene</button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">📅 Servis Takvimi</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Sürükle-bırak ile servisleri yeniden planla
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <div className="btn-group">
                        <button
                            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('calendar')}
                        >
                            📅 Takvim
                        </button>
                        <button
                            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('list')}
                        >
                            📋 Liste
                        </button>
                    </div>
                    <Link href="/planlama/yeni" className="btn btn-primary">
                        ➕ Yeni Servis
                    </Link>
                </div>
            </header>

            {/* Stats */}
            <div className="stats-row" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="stat-card">
                    <div className="stat-value">{services.length}</div>
                    <div className="stat-label">Toplam Servis</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {services.filter(s => s.status === 'DEVAM_EDIYOR').length}
                    </div>
                    <div className="stat-label">Devam Eden</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {services.filter(s => s.status === 'RANDEVU_VERILDI').length}
                    </div>
                    <div className="stat-label">Randevu Bekliyor</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {services.filter(s => s.status === 'TAMAMLANDI').length}
                    </div>
                    <div className="stat-label">Tamamlanan</div>
                </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' ? (
                <CalendarView
                    services={services}
                    onServiceClick={handleServiceClick}
                    onDateChange={handleDateChange}
                />
            ) : (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tarih</th>
                                <th>Tekne</th>
                                <th>Durum</th>
                                <th>Konum</th>
                                <th>Sorumlu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services
                                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                                .map(service => (
                                    <tr
                                        key={service.id}
                                        onClick={() => handleServiceClick(service)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td>{new Date(service.scheduledDate).toLocaleDateString('tr-TR')}</td>
                                        <td><strong>{service.boatName}</strong></td>
                                        <td>
                                            <span className="status-badge" style={{
                                                backgroundColor: service.statusColor + '20',
                                                color: service.statusColor,
                                                borderColor: service.statusColor
                                            }}>
                                                {service.statusLabel}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: service.locationColor }}>
                                                {service.locationLabel}
                                            </span>
                                        </td>
                                        <td>{service.responsible?.name || '-'}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            )}

            {/* Service Detail Modal */}
            {selectedService && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedService.boatName}</h3>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-row">
                                <span className="detail-label">Kod:</span>
                                <span>{selectedService.code}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Durum:</span>
                                <span className="status-badge" style={{
                                    backgroundColor: selectedService.statusColor + '20',
                                    color: selectedService.statusColor
                                }}>
                                    {selectedService.statusLabel}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Tarih:</span>
                                <span>{new Date(selectedService.scheduledDate).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Konum:</span>
                                <span>{selectedService.locationLabel}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">İş Türü:</span>
                                <span>{selectedService.jobTypeLabel}</span>
                            </div>
                            {selectedService.responsible && (
                                <div className="detail-row">
                                    <span className="detail-label">Sorumlu:</span>
                                    <span>{selectedService.responsible.name} ({selectedService.responsible.title})</span>
                                </div>
                            )}
                            {selectedService.description && (
                                <div className="detail-row">
                                    <span className="detail-label">Açıklama:</span>
                                    <span>{selectedService.description}</span>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <Link href={`/planlama/${selectedService.id}`} className="btn btn-primary">
                                Detayları Gör
                            </Link>
                            <button className="btn btn-secondary" onClick={closeModal}>Kapat</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-md);
                }

                .stat-card {
                    background: var(--color-surface);
                    padding: var(--space-lg);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--color-border);
                    text-align: center;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }

                .stat-label {
                    color: var(--color-text-muted);
                    font-size: 0.9rem;
                }

                .btn-group {
                    display: flex;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }

                .btn-group .btn {
                    border-radius: 0;
                }

                .btn-group .btn:first-child {
                    border-top-left-radius: var(--radius-md);
                    border-bottom-left-radius: var(--radius-md);
                }

                .btn-group .btn:last-child {
                    border-top-right-radius: var(--radius-md);
                    border-bottom-right-radius: var(--radius-md);
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .data-table th,
                .data-table td {
                    padding: var(--space-md);
                    text-align: left;
                    border-bottom: 1px solid var(--color-border);
                }

                .data-table th {
                    background: var(--color-bg);
                    font-weight: 600;
                }

                .data-table tr:hover {
                    background: var(--color-bg);
                }

                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
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
                    max-height: 80vh;
                    overflow: auto;
                    border: 1px solid var(--color-border);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-lg);
                    border-bottom: 1px solid var(--color-border);
                }

                .modal-header h3 {
                    margin: 0;
                }

                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--color-text-muted);
                }

                .modal-body {
                    padding: var(--space-lg);
                }

                .detail-row {
                    display: flex;
                    gap: var(--space-md);
                    margin-bottom: var(--space-sm);
                }

                .detail-label {
                    color: var(--color-text-muted);
                    min-width: 100px;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--space-sm);
                    padding: var(--space-lg);
                    border-top: 1px solid var(--color-border);
                }

                .loading-container,
                .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                }

                .loading-spinner {
                    font-size: 3rem;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .stats-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
}
