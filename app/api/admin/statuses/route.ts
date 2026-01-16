import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Get all statuses (including inactive)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const statuses = await prisma.configStatus.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(statuses);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch statuses' }, { status: 500 });
    }
}

// POST - Create new status
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        // Generate key from label
        const key = body.key || body.label
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_]/g, '');

        // Get max sortOrder
        const maxOrder = await prisma.configStatus.aggregate({
            _max: { sortOrder: true },
        });

        const status = await prisma.configStatus.create({
            data: {
                key,
                label: body.label,
                color: body.color || '#6366f1',
                icon: body.icon,
                sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                active: body.active ?? true,
            },
        });

        await audit.create('ConfigStatus', status.id, { key, label: body.label });

        return NextResponse.json(status, { status: 201 });
    } catch (error) {
        console.error('Status create error:', error);
        return NextResponse.json({ error: 'Failed to create status' }, { status: 500 });
    }
}

// PUT - Update status
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Status ID required' }, { status: 400 });
        }

        const current = await prisma.configStatus.findUnique({ where: { id: body.id } });
        if (!current) {
            return NextResponse.json({ error: 'Status not found' }, { status: 404 });
        }

        const updated = await prisma.configStatus.update({
            where: { id: body.id },
            data: {
                label: body.label ?? current.label,
                color: body.color ?? current.color,
                icon: body.icon ?? current.icon,
                sortOrder: body.sortOrder ?? current.sortOrder,
                active: body.active ?? current.active,
            },
        });

        await audit.update('ConfigStatus', body.id,
            { label: current.label, color: current.color },
            { label: updated.label, color: updated.color }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }
}

// DELETE - Delete status
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Status ID required' }, { status: 400 });
        }

        // Check if status is in use
        const inUse = await prisma.service.count({ where: { statusId: id } });
        if (inUse > 0) {
            return NextResponse.json({
                error: `Bu durum ${inUse} serviste kullanılıyor. Önce servisleri güncelleyin.`
            }, { status: 400 });
        }

        const status = await prisma.configStatus.delete({ where: { id } });

        await audit.delete('ConfigStatus', id, { key: status.key, label: status.label });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete status' }, { status: 500 });
    }
}
