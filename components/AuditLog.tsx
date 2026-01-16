'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface AuditLogEntry {
    id: string;
    serviceId: string;
    action: 'STATUS_CHANGE' | 'CLOSURE_TEAM_CHANGE' | 'SERVICE_CREATED' | 'SERVICE_UPDATED' | 'FIELD_CHANGE';
    userId: string;
    userName: string;
    timestamp: string;
    details: {
        before?: any;
        after?: any;
        field?: string;
        note?: string;
        changes?: Record<string, { from: any; to: any }>;
    };
}

const ACTION_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
    STATUS_CHANGE: { icon: '🔄', label: 'Durum Değişikliği', color: 'text-amber-500' },
    CLOSURE_TEAM_CHANGE: { icon: '👥', label: 'Kapanış Ekibi Değişti', color: 'text-emerald-500' },
    SERVICE_CREATED: { icon: '➕', label: 'Servis Oluşturuldu', color: 'text-blue-500' },
    SERVICE_UPDATED: { icon: '✏️', label: 'Servis Güncellendi', color: 'text-primary' },
    FIELD_CHANGE: { icon: '📝', label: 'Alan Güncellendi', color: 'text-violet-500' },
};

interface AuditLogProps {
    serviceId: string;
    logs?: AuditLogEntry[];
}

// Utility to create audit log entry
export function createAuditEntry(
    serviceId: string,
    action: AuditLogEntry['action'],
    userId: string,
    userName: string,
    details: AuditLogEntry['details']
): AuditLogEntry {
    return {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        serviceId,
        action,
        userId,
        userName,
        timestamp: new Date().toISOString(),
        details,
    };
}

// Mock data for demonstration
function generateMockLogs(serviceId: string): AuditLogEntry[] {
    const now = new Date();
    return [
        {
            id: '1',
            serviceId,
            action: 'STATUS_CHANGE',
            userId: 'user-1',
            userName: 'Furkan Ç.',
            timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
            details: {
                before: 'DEVAM EDİYOR',
                after: 'PARÇA BEKLİYOR',
                note: 'Yedek parça siparişi verildi',
            },
        },
        {
            id: '2',
            serviceId,
            action: 'CLOSURE_TEAM_CHANGE',
            userId: 'user-1',
            userName: 'Furkan Ç.',
            timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
            details: {
                before: { responsibles: ['Mehmet A.'], supports: [] },
                after: { responsibles: ['Mehmet A.', 'Ahmet K.'], supports: ['Ali V.'] },
            },
        },
        {
            id: '3',
            serviceId,
            action: 'SERVICE_CREATED',
            userId: 'user-2',
            userName: 'Sistem',
            timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
            details: {
                note: 'Google Sheets import ile oluşturuldu',
            },
        },
    ];
}

export default function AuditLog({ serviceId, logs: propLogs }: AuditLogProps) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In real app, fetch from API
        setTimeout(() => {
            setLogs(propLogs || generateMockLogs(serviceId));
            setIsLoading(false);
        }, 300);
    }, [serviceId, propLogs]);

    if (isLoading) {
        return (
            <div className="space-y-3">
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
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <span className="text-3xl block mb-2">📜</span>
                <span>Henüz aktivite kaydı yok</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {logs.map((log, index) => {
                const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.SERVICE_UPDATED;
                const isLast = index === logs.length - 1;

                return (
                    <div key={log.id} className="relative flex gap-3">
                        {/* Timeline line */}
                        {!isLast && (
                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                        )}

                        {/* Icon */}
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm flex-shrink-0 z-10">
                            {config.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <span className={`text-sm font-medium ${config.color}`}>
                                        {config.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                        {log.userName}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTimeAgo(log.timestamp)}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="mt-1 text-sm">
                                {log.action === 'STATUS_CHANGE' && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-muted rounded text-xs">
                                            {log.details.before}
                                        </span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                                            {log.details.after}
                                        </span>
                                    </div>
                                )}

                                {log.action === 'CLOSURE_TEAM_CHANGE' && log.details.after && (
                                    <div className="text-xs space-y-1 mt-1">
                                        <div>
                                            👤 Sorumlular: {(log.details.after.responsibles || []).join(', ') || '-'}
                                        </div>
                                        <div>
                                            🤝 Destek: {(log.details.after.supports || []).join(', ') || '-'}
                                        </div>
                                    </div>
                                )}

                                {log.details.changes && (
                                    <div className="space-y-1 mt-1">
                                        {Object.entries(log.details.changes).map(([field, change]) => (
                                            <div key={field} className="text-xs flex items-center gap-2">
                                                <span className="font-medium text-muted-foreground">{field}:</span>
                                                <span className="line-through opacity-70">{String(change.from || '-')}</span>
                                                <span>→</span>
                                                <span className="font-medium">{String(change.to || '-')}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {log.details.note && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {log.details.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function formatTimeAgo(dateString: string): string {
    try {
        return formatDistanceToNow(new Date(dateString), {
            addSuffix: true,
            locale: tr
        });
    } catch {
        return dateString;
    }
}

// Export helper for logging from other components
export function logStatusChange(
    serviceId: string,
    userId: string,
    userName: string,
    before: string,
    after: string,
    note?: string
): AuditLogEntry {
    return createAuditEntry(serviceId, 'STATUS_CHANGE', userId, userName, {
        before,
        after,
        note,
    });
}

export function logClosureTeamChange(
    serviceId: string,
    userId: string,
    userName: string,
    before: { responsibles: string[]; supports: string[] },
    after: { responsibles: string[]; supports: string[] }
): AuditLogEntry {
    return createAuditEntry(serviceId, 'CLOSURE_TEAM_CHANGE', userId, userName, {
        before,
        after,
    });
}
