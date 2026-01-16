'use client';

import { useState, useEffect } from 'react';

interface EvaluationModalProps {
    serviceId: string;
    serviceName: string;
    personnel: Array<{ id: string; name: string; role: string }>;
    onComplete: () => void;
    onClose: () => void;
}

interface Criterion {
    id: string;
    key: string;
    name: string;
    description?: string;
    maxScore: number;
    weight: number;
    category: string;
}

interface EvaluationScore {
    personnelId: string;
    criteriaId: string;
    score: number;
    notes?: string;
}

export default function EvaluationModal({
    serviceId,
    serviceName,
    personnel,
    onComplete,
    onClose,
}: EvaluationModalProps) {
    const [criteria, setCriteria] = useState<Criterion[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [scores, setScores] = useState<Record<string, EvaluationScore[]>>({});
    const [activePersonnel, setActivePersonnel] = useState<string | null>(null);

    useEffect(() => {
        fetchCriteria();
    }, []);

    useEffect(() => {
        if (personnel.length > 0 && !activePersonnel) {
            setActivePersonnel(personnel[0].id);
        }
    }, [personnel, activePersonnel]);

    const fetchCriteria = async () => {
        try {
            const res = await fetch('/api/scoring/criteria');
            const data = await res.json();
            setCriteria(data);

            // Initialize scores for each personnel
            const initialScores: Record<string, EvaluationScore[]> = {};
            personnel.forEach(p => {
                initialScores[p.id] = data.map((c: Criterion) => ({
                    personnelId: p.id,
                    criteriaId: c.id,
                    score: 0,
                    notes: '',
                }));
            });
            setScores(initialScores);
        } catch (err) {
            console.error('Failed to fetch criteria:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateScore = (personnelId: string, criteriaId: string, score: number) => {
        setScores(prev => ({
            ...prev,
            [personnelId]: prev[personnelId].map(s =>
                s.criteriaId === criteriaId ? { ...s, score } : s
            ),
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Flatten all scores
            const allScores = Object.values(scores).flat().filter(s => s.score > 0);

            const res = await fetch('/api/scoring/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    evaluations: allScores,
                }),
            });

            if (res.ok) {
                onComplete();
            } else {
                const err = await res.json();
                alert(err.error || 'Değerlendirme kaydedilemedi');
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('Bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const getCompletionPercentage = () => {
        const allScores = Object.values(scores).flat();
        const scored = allScores.filter(s => s.score > 0).length;
        return Math.round((scored / allScores.length) * 100);
    };

    if (loading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                        ⏳ Yükleniyor...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="evaluation-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h3>⭐ Servis Değerlendirmesi</h3>
                        <p className="service-name">{serviceName}</p>
                    </div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Progress */}
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${getCompletionPercentage()}%` }}
                    />
                    <span className="progress-text">{getCompletionPercentage()}% tamamlandı</span>
                </div>

                {/* Personnel Tabs */}
                <div className="personnel-tabs">
                    {personnel.map(p => (
                        <button
                            key={p.id}
                            className={`tab ${activePersonnel === p.id ? 'active' : ''}`}
                            onClick={() => setActivePersonnel(p.id)}
                        >
                            {p.name}
                            <span className="role">{p.role}</span>
                        </button>
                    ))}
                </div>

                {/* Criteria Scores */}
                <div className="modal-body">
                    {activePersonnel && criteria.map(c => {
                        const score = scores[activePersonnel]?.find(s => s.criteriaId === c.id)?.score || 0;
                        return (
                            <div key={c.id} className="criterion-row">
                                <div className="criterion-info">
                                    <div className="criterion-name">{c.name}</div>
                                    {c.description && (
                                        <div className="criterion-desc">{c.description}</div>
                                    )}
                                </div>
                                <div className="star-rating">
                                    {[...Array(c.maxScore)].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`star ${i < score ? 'filled' : ''}`}
                                            onClick={() => updateScore(activePersonnel, c.id, i + 1)}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <span className="score-text">{score}/{c.maxScore}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        İptal
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={submitting || getCompletionPercentage() === 0}
                    >
                        {submitting ? '⏳ Kaydediliyor...' : '✓ Değerlendirmeyi Kaydet'}
                    </button>
                </div>

                <style jsx>{`
                    .evaluation-modal {
                        background: var(--color-surface);
                        border-radius: var(--radius-lg);
                        width: 90%;
                        max-width: 600px;
                        max-height: 85vh;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        border: 1px solid var(--color-border);
                    }

                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding: var(--space-lg);
                        border-bottom: 1px solid var(--color-border);
                    }

                    .modal-header h3 { margin: 0; }

                    .service-name {
                        color: var(--color-text-muted);
                        font-size: 0.9rem;
                        margin-top: 4px;
                    }

                    .modal-close {
                        background: none;
                        border: none;
                        font-size: 1.25rem;
                        cursor: pointer;
                        color: var(--color-text-muted);
                    }

                    .progress-bar {
                        height: 8px;
                        background: var(--color-bg);
                        position: relative;
                    }

                    .progress-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #fbbf24, #f59e0b);
                        transition: width 0.3s;
                    }

                    .progress-text {
                        position: absolute;
                        right: var(--space-sm);
                        top: 50%;
                        transform: translateY(-50%);
                        font-size: 0.7rem;
                        color: var(--color-text-muted);
                    }

                    .personnel-tabs {
                        display: flex;
                        gap: 1px;
                        background: var(--color-border);
                        border-bottom: 1px solid var(--color-border);
                    }

                    .tab {
                        flex: 1;
                        padding: var(--space-md);
                        background: var(--color-bg);
                        border: none;
                        cursor: pointer;
                        text-align: center;
                        transition: background 0.2s;
                    }

                    .tab:hover { background: var(--color-surface); }

                    .tab.active {
                        background: var(--color-surface);
                        font-weight: 600;
                    }

                    .tab .role {
                        display: block;
                        font-size: 0.75rem;
                        color: var(--color-text-muted);
                        margin-top: 2px;
                    }

                    .modal-body {
                        flex: 1;
                        overflow-y: auto;
                        padding: var(--space-lg);
                    }

                    .criterion-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: var(--space-md) 0;
                        border-bottom: 1px solid var(--color-border);
                    }

                    .criterion-row:last-child { border-bottom: none; }

                    .criterion-info { flex: 1; }

                    .criterion-name {
                        font-weight: 500;
                        margin-bottom: 2px;
                    }

                    .criterion-desc {
                        font-size: 0.8rem;
                        color: var(--color-text-muted);
                    }

                    .star-rating {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    }

                    .star {
                        font-size: 1.5rem;
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: var(--color-border);
                        transition: transform 0.1s, color 0.1s;
                    }

                    .star:hover {
                        transform: scale(1.2);
                        color: #fbbf24;
                    }

                    .star.filled {
                        color: #f59e0b;
                    }

                    .score-text {
                        margin-left: var(--space-sm);
                        font-size: 0.85rem;
                        color: var(--color-text-muted);
                        min-width: 30px;
                    }

                    .modal-footer {
                        display: flex;
                        justify-content: flex-end;
                        gap: var(--space-sm);
                        padding: var(--space-lg);
                        border-top: 1px solid var(--color-border);
                    }

                    .modal-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                    }
                `}</style>
            </div>
        </div>
    );
}
