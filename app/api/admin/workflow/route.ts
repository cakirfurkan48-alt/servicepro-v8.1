import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Get all workflow transitions
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const fromStatusKey = searchParams.get('from');
        const activeOnly = searchParams.get('active') !== 'false';

        const where: any = {};
        if (fromStatusKey) where.fromStatusKey = fromStatusKey;
        if (activeOnly) where.active = true;

        const transitions = await prisma.workflowTransition.findMany({
            where,
            orderBy: [
                { fromStatusKey: 'asc' },
                { toStatusKey: 'asc' },
            ],
        });

        // Fetch status info for display
        const statuses = await prisma.configStatus.findMany({
            where: { active: true },
            orderBy: { sortOrder: 'asc' },
        });

        const statusMap = Object.fromEntries(
            statuses.map(s => [s.key, { label: s.label, color: s.color }])
        );

        const enrichedTransitions = transitions.map(t => ({
            ...t,
            fromStatus: statusMap[t.fromStatusKey] || { label: t.fromStatusKey, color: '#888' },
            toStatus: statusMap[t.toStatusKey] || { label: t.toStatusKey, color: '#888' },
        }));

        return NextResponse.json({
            transitions: enrichedTransitions,
            statuses,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch transitions' }, { status: 500 });
    }
}

// POST - Create new workflow transition
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.fromStatusKey || !body.toStatusKey) {
            return NextResponse.json({ error: 'From and To status required' }, { status: 400 });
        }

        // Check if transition already exists
        const existing = await prisma.workflowTransition.findUnique({
            where: {
                fromStatusKey_toStatusKey: {
                    fromStatusKey: body.fromStatusKey,
                    toStatusKey: body.toStatusKey,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Bu geçiş zaten tanımlı' }, { status: 400 });
        }

        const transition = await prisma.workflowTransition.create({
            data: {
                fromStatusKey: body.fromStatusKey,
                toStatusKey: body.toStatusKey,
                allowedRoles: body.allowedRoles || ['ADMIN', 'COORDINATOR'],
                requiresNote: body.requiresNote || false,
                requiresParts: body.requiresParts || false,
                autoActions: body.autoActions || null,
                active: body.active ?? true,
            },
        });

        await audit.create('WorkflowTransition', transition.id, {
            from: body.fromStatusKey,
            to: body.toStatusKey,
        });

        return NextResponse.json(transition, { status: 201 });
    } catch (error) {
        console.error('Transition create error:', error);
        return NextResponse.json({ error: 'Failed to create transition' }, { status: 500 });
    }
}

// PUT - Update workflow transition
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Transition ID required' }, { status: 400 });
        }

        const current = await prisma.workflowTransition.findUnique({ where: { id: body.id } });
        if (!current) {
            return NextResponse.json({ error: 'Transition not found' }, { status: 404 });
        }

        const updated = await prisma.workflowTransition.update({
            where: { id: body.id },
            data: {
                allowedRoles: body.allowedRoles ?? current.allowedRoles,
                requiresNote: body.requiresNote ?? current.requiresNote,
                requiresParts: body.requiresParts ?? current.requiresParts,
                autoActions: body.autoActions !== undefined ? body.autoActions : current.autoActions,
                active: body.active ?? current.active,
            },
        });

        await audit.update('WorkflowTransition', body.id,
            { requiresNote: current.requiresNote, requiresParts: current.requiresParts },
            { requiresNote: updated.requiresNote, requiresParts: updated.requiresParts }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update transition' }, { status: 500 });
    }
}

// DELETE - Delete workflow transition
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Transition ID required' }, { status: 400 });
        }

        const transition = await prisma.workflowTransition.delete({ where: { id } });

        await audit.delete('WorkflowTransition', id, {
            from: transition.fromStatusKey,
            to: transition.toStatusKey,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete transition' }, { status: 500 });
    }
}
