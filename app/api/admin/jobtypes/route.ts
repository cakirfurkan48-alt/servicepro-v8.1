import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Get all job types
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const jobTypes = await prisma.configJobType.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(jobTypes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch job types' }, { status: 500 });
    }
}

// POST - Create new job type
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        const key = body.key || body.label
            .toUpperCase()
            .replace(/\s+/g, '_')
            .replace(/[^A-Z0-9_]/g, '');

        const maxOrder = await prisma.configJobType.aggregate({
            _max: { sortOrder: true },
        });

        const jobType = await prisma.configJobType.create({
            data: {
                key,
                label: body.label,
                multiplier: body.multiplier || 1.0,
                sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                active: body.active ?? true,
            },
        });

        await audit.create('ConfigJobType', jobType.id, { key, label: body.label, multiplier: body.multiplier });

        return NextResponse.json(jobType, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create job type' }, { status: 500 });
    }
}

// PUT - Update job type
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Job type ID required' }, { status: 400 });
        }

        const current = await prisma.configJobType.findUnique({ where: { id: body.id } });
        if (!current) {
            return NextResponse.json({ error: 'Job type not found' }, { status: 404 });
        }

        const updated = await prisma.configJobType.update({
            where: { id: body.id },
            data: {
                label: body.label ?? current.label,
                multiplier: body.multiplier ?? current.multiplier,
                sortOrder: body.sortOrder ?? current.sortOrder,
                active: body.active ?? current.active,
            },
        });

        await audit.update('ConfigJobType', body.id,
            { label: current.label, multiplier: current.multiplier },
            { label: updated.label, multiplier: updated.multiplier }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update job type' }, { status: 500 });
    }
}

// DELETE - Delete job type
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Job type ID required' }, { status: 400 });
        }

        const inUse = await prisma.service.count({ where: { jobTypeId: id } });
        if (inUse > 0) {
            return NextResponse.json({
                error: `Bu iş türü ${inUse} serviste kullanılıyor.`
            }, { status: 400 });
        }

        const jobType = await prisma.configJobType.delete({ where: { id } });

        await audit.delete('ConfigJobType', id, { key: jobType.key, label: jobType.label });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete job type' }, { status: 500 });
    }
}
