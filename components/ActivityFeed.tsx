'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ActivityItem {
    id: string;
    action: string;
    entity: string;
    entityId?: string;
    entityName?: string;
    user?: string;
    createdAt: string;
    note?: string;
}

// Action icons and labels
const ACTION_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
    CREATE: { icon: '➕', label: 'oluşturuldu', color: 'text-emerald-500' },
    UPDATE: { icon: '✏️', label: 'güncellendi', color: 'text-blue-500' },
    STATUS_CHANGE: { icon: '🔄', label: 'durum değişti', color: 'text-amber-500' },
    DELETE: { icon: '🗑️', label: 'silindi', color: 'text-red-500' },
    COMPLETE: { icon: '✅', label: 'tamamlandı', color: 'text-emerald-600' },
    ASSIGN: { icon: '👤', label: 'atandı', color: 'text-violet-500' },
};

// Mock data for demo - will be replaced with API call
const MOCK_ACTIVITIES: ActivityItem[] = [
    {
        id: '1',
        action: 'CREATE',
        entity: 'Service',
        entityId: 'srv-001',
        entityName: 'M/Y Serenity',
        user: 'Furkan Ç.',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        note: 'Jeneratör bakımı için servis kaydı',
    },
    {
        id: '2',
        action: 'STATUS_CHANGE',
        entity: 'Service',
        entityId: 'srv-002',
        entityName: 'M/V Asterias',
        user: 'Mehmet A.',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        note: 'Devam Ediyor → Parça Bekliyor',
    },
    {
        id: '3',
        action: 'COMPLETE',
        entity: 'Service',
        entityId: 'srv-003',
        entityName: 'CAT. Zaya',
        user: 'Furkan Ç.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        note: 'Pervane montajı tamamlandı',
    },
    {
        id: '4',
        action: 'ASSIGN',
        entity: 'Service',
        entityId: 'srv-004',
        entityName: 'S/Y Maritza',
        user: 'Admin',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        note: 'Mehmet A. olarak atandı',
    },
    {
        id: '5',
        action: 'UPDATE',
        entity: 'Service',
        entityId: 'srv-005',
        entityName: 'M/V NMN',
        user: 'Furkan Ç.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        note: 'Açıklama güncellendi',
    },
];

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dk önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setActivities(MOCK_ACTIVITIES);
            setIsLoading(false);
        }, 500);
    }, []);

    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Son Aktiviteler</h3>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-8 h-8 bg-muted rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-muted rounded" />
                                <div className="h-3 w-1/2 bg-muted rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    ⚡ Son Aktiviteler
                </h3>
                <span className="text-xs text-muted-foreground">Son 24 saat</span>
            </div>

            <div className="space-y-4">
                {activities.map((activity) => {
                    const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG.UPDATE;

                    return (
                        <div key={activity.id} className="flex gap-3 group">
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm
                bg-muted/50 group-hover:bg-muted transition-colors
              `}>
                                {config.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="text-sm">
                                        <Link
                                            href={`/planlama/${activity.entityId}`}
                                            className="font-medium text-foreground hover:text-primary transition-colors"
                                        >
                                            {activity.entityName}
                                        </Link>
                                        <span className={`ml-1 ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatTimeAgo(activity.createdAt)}
                                    </span>
                                </div>

                                {activity.note && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                        {activity.note}
                                    </p>
                                )}

                                {activity.user && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-[10px] text-muted-foreground">
                                            👤 {activity.user}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <Link
                    href="/ayarlar/audit"
                    className="text-xs text-primary hover:underline"
                >
                    Tüm aktiviteleri gör →
                </Link>
            </div>
        </div>
    );
}
