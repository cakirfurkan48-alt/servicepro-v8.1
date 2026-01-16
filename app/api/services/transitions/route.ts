import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Get allowed transitions for a service's current status
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const currentStatus = searchParams.get('current');
        const serviceId = searchParams.get('serviceId');

        if (!currentStatus) {
            return NextResponse.json({ error: 'Current status required' }, { status: 400 });
        }

        // Get transitions from current status OR from any status (*)
        const transitions = await prisma.workflowTransition.findMany({
            where: {
                active: true,
                OR: [
                    { fromStatusKey: currentStatus },
                    { fromStatusKey: '*' },
                ],
            },
        });

        // Filter by user role
        const userRole = session.user.role;
        const allowedTransitions = transitions.filter(t =>
            t.allowedRoles.includes(userRole)
        );

        // Get target statuses info
        const targetStatusKeys = Array.from(new Set(allowedTransitions.map(t => t.toStatusKey)));
        const targetStatuses = await prisma.configStatus.findMany({
            where: { key: { in: targetStatusKeys } },
        });

        const statusMap = Object.fromEntries(
            targetStatuses.map(s => [s.key, { key: s.key, label: s.label, color: s.color }])
        );

        const result = allowedTransitions.map(t => ({
            toStatus: statusMap[t.toStatusKey],
            requiresNote: t.requiresNote,
            requiresParts: t.requiresParts,
        }));

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch transitions' }, { status: 500 });
    }
}
