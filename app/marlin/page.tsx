'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
    rank: number;
    personnelId: string;
    name: string;
    title: string;
    avatar?: string;
    totalScore: number;
    evaluationCount: number;
    stars: { filled: number; half: boolean };
}

interface Stats {
    month: number;
    year: number;
    totalPersonnel: number;
    averageScore: number;
    topPerformer: LeaderboardEntry | null;
}

const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function MarlinPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/scoring/leaderboard?month=${selectedMonth}&year=${selectedYear}`);
            const data = await res.json();
            setLeaderboard(data.leaderboard);
            setStats(data.stats);
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [selectedMonth, selectedYear]);

    const renderStars = (stars: { filled: number; half: boolean }) => {
        return (
            <div className="stars">
                {[...Array(5)].map((_, i) => (
                    <span
                        key={i}
                        className={`star ${i < stars.filled ? 'filled' : ''} ${i === stars.filled && stars.half ? 'half' : ''}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">⭐ Marlin Yıldızı</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Aylık Teknisyen Performans Sıralaması
                    </p>
                </div>
                <div className="month-selector">
                    <select
                        className="form-input"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(Number(e.target.value))}
                    >
                        {MONTHS.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        className="form-input"
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                    >
                        {[2024, 2025, 2026].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-row">
                    <div className="stat-card highlight">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-content">
                            <div className="stat-label">Ayın Yıldızı</div>
                            <div className="stat-value">
                                {stats.topPerformer?.name || 'Henüz belirlenmedi'}
                            </div>
                            {stats.topPerformer && (
                                <div className="stat-sub">
                                    {renderStars(stats.topPerformer.stars)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <div className="stat-label">Değerlendirilen</div>
                            <div className="stat-value">{stats.totalPersonnel}</div>
                            <div className="stat-sub">teknisyen</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <div className="stat-label">Ortalama Puan</div>
                            <div className="stat-value">{stats.averageScore.toFixed(1)}</div>
                            <div className="stat-sub">/ 5.0</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            <div className="card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                        ⏳ Yükleniyor...
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--color-text-muted)' }}>
                        Bu ay için henüz değerlendirme yapılmamış
                    </div>
                ) : (
                    <div className="leaderboard">
                        {leaderboard.map(entry => (
                            <div key={entry.personnelId} className={`leaderboard-row rank-${entry.rank}`}>
                                <div className="rank-badge">{getRankBadge(entry.rank)}</div>
                                <div className="avatar">
                                    {entry.avatar ? (
                                        <img src={entry.avatar} alt={entry.name} />
                                    ) : (
                                        <span>{entry.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="personnel-info">
                                    <div className="personnel-name">{entry.name}</div>
                                    <div className="personnel-title">{entry.title}</div>
                                </div>
                                <div className="score-section">
                                    {renderStars(entry.stars)}
                                    <div className="score-value">{entry.totalScore.toFixed(2)}</div>
                                </div>
                                <div className="eval-count">
                                    {entry.evaluationCount} değerlendirme
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                .month-selector {
                    display: flex;
                    gap: var(--space-sm);
                }

                .month-selector .form-input {
                    width: auto;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: var(--space-md);
                    margin-bottom: var(--space-lg);
                }

                .stat-card {
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: var(--space-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                }

                .stat-card.highlight {
                    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
                    border-color: rgba(251, 191, 36, 0.3);
                }

                .stat-icon {
                    font-size: 2.5rem;
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: var(--color-text-muted);
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .stat-sub {
                    font-size: 0.85rem;
                    color: var(--color-text-muted);
                }

                .leaderboard {
                    display: flex;
                    flex-direction: column;
                }

                .leaderboard-row {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-md);
                    border-bottom: 1px solid var(--color-border);
                    transition: background 0.2s;
                }

                .leaderboard-row:hover {
                    background: var(--color-bg);
                }

                .leaderboard-row:last-child {
                    border-bottom: none;
                }

                .leaderboard-row.rank-1 {
                    background: linear-gradient(90deg, rgba(251, 191, 36, 0.1), transparent);
                }

                .leaderboard-row.rank-2 {
                    background: linear-gradient(90deg, rgba(156, 163, 175, 0.1), transparent);
                }

                .leaderboard-row.rank-3 {
                    background: linear-gradient(90deg, rgba(180, 83, 9, 0.1), transparent);
                }

                .rank-badge {
                    font-size: 1.5rem;
                    min-width: 50px;
                    text-align: center;
                }

                .avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--color-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1.25rem;
                    overflow: hidden;
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .personnel-info {
                    flex: 1;
                }

                .personnel-name {
                    font-weight: 600;
                }

                .personnel-title {
                    font-size: 0.85rem;
                    color: var(--color-text-muted);
                }

                .score-section {
                    text-align: right;
                }

                .score-value {
                    font-size: 0.85rem;
                    color: var(--color-text-muted);
                    margin-top: 2px;
                }

                .eval-count {
                    font-size: 0.8rem;
                    color: var(--color-text-muted);
                    min-width: 100px;
                    text-align: right;
                }

                .stars {
                    display: flex;
                    gap: 2px;
                }

                .star {
                    color: var(--color-border);
                    font-size: 1.1rem;
                }

                .star.filled {
                    color: #f59e0b;
                }

                .star.half {
                    background: linear-gradient(90deg, #f59e0b 50%, var(--color-border) 50%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                @media (max-width: 768px) {
                    .stats-row {
                        grid-template-columns: 1fr;
                    }

                    .eval-count {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
