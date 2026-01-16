import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Get all scoring criteria
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') !== 'false';

        const criteria = await prisma.scoringCriteria.findMany({
            where: activeOnly ? { active: true } : {},
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(criteria);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch criteria' }, { status: 500 });
    }
}

// POST - Create new criterion
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        const criteriaKey = body.key || body.name
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        const maxOrder = await prisma.scoringCriteria.aggregate({
            _max: { sortOrder: true },
        });

        const criterion = await prisma.scoringCriteria.create({
            data: {
                criteriaKey,
                label: body.name,
                description: body.description,
                maxScore: body.maxScore || 5,
                weight: body.weight || 1.0,
                category: body.category || 'general',
                sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                active: body.active ?? true,
            },
        });

        await audit.create('ScoringCriteria', criterion.id, { criteriaKey, label: body.name });

        return NextResponse.json(criterion, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Bu kriter anahtarı zaten mevcut' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create criterion' }, { status: 500 });
    }
}

// PUT - Update criterion
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Criterion ID required' }, { status: 400 });
        }

        const current = await prisma.scoringCriteria.findUnique({ where: { id: body.id } });
        if (!current) {
            return NextResponse.json({ error: 'Criterion not found' }, { status: 404 });
        }

        const updated = await prisma.scoringCriteria.update({
            where: { id: body.id },
            data: {
                label: body.name ?? current.label,
                description: body.description ?? current.description,
                maxScore: body.maxScore ?? current.maxScore,
                weight: body.weight ?? current.weight,
                category: body.category ?? current.category,
                sortOrder: body.sortOrder ?? current.sortOrder,
                active: body.active ?? current.active,
            },
        });

        await audit.update('ScoringCriteria', body.id,
            { label: current.label, weight: current.weight },
            { label: updated.label, weight: updated.weight }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update criterion' }, { status: 500 });
    }
}

// DELETE - Delete criterion
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Criterion ID required' }, { status: 400 });
        }

        // Check usage - Removed as criteriaId is not indexed relationally
        // const inUse = await prisma.evaluation.count({ where: { criteriaId: id } });

        const criterion = await prisma.scoringCriteria.delete({ where: { id } });

        await audit.delete('ScoringCriteria', id, { criteriaKey: criterion.criteriaKey, label: criterion.label });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete criterion' }, { status: 500 });
    }
}
