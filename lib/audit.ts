import prisma from './db';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { headers } from 'next/headers';

type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'STATUS_CHANGE'
    | 'OVERRIDE'
    | 'EXPORT'
    | 'IMPORT';

interface AuditLogParams {
    action: AuditAction;
    entity: string;
    entityId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
    try {
        const session = await getServerSession(authOptions);
        const headersList = headers();

        await prisma.auditLog.create({
            data: {
                userId: session?.user?.id || null,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : null,
                newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : null,
                ipAddress: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
                userAgent: headersList.get('user-agent') || 'unknown',
            },
        });
    } catch (error) {
        console.error('Audit log error:', error);
        // Don't throw - audit logs shouldn't break the main operation
    }
}

// Convenience functions for common operations
export const audit = {
    create: (entity: string, entityId: string, newValue: Record<string, any>) =>
        createAuditLog({ action: 'CREATE', entity, entityId, newValue }),

    update: (entity: string, entityId: string, oldValue: Record<string, any>, newValue: Record<string, any>) =>
        createAuditLog({ action: 'UPDATE', entity, entityId, oldValue, newValue }),

    delete: (entity: string, entityId: string, oldValue: Record<string, any>) =>
        createAuditLog({ action: 'DELETE', entity, entityId, oldValue }),

    statusChange: (entity: string, entityId: string, fromStatus: string, toStatus: string) =>
        createAuditLog({
            action: 'STATUS_CHANGE',
            entity,
            entityId,
            oldValue: { status: fromStatus },
            newValue: { status: toStatus },
        }),

    override: (entity: string, entityId: string, oldValue: any, newValue: any, note?: string) =>
        createAuditLog({
            action: 'OVERRIDE',
            entity,
            entityId,
            oldValue: { value: oldValue },
            newValue: { value: newValue, note },
        }),
};

export default audit;
