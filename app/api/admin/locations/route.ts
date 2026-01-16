import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Get all locations
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const locations = await prisma.configLocation.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(locations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
}

// POST - Create new location
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

        const maxOrder = await prisma.configLocation.aggregate({
            _max: { sortOrder: true },
        });

        const location = await prisma.configLocation.create({
            data: {
                key,
                label: body.label,
                color: body.color || '#0ea5e9',
                icon: body.icon,
                sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                active: body.active ?? true,
            },
        });

        await audit.create('ConfigLocation', location.id, { key, label: body.label });

        return NextResponse.json(location, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
    }
}

// PUT - Update location
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
        }

        const current = await prisma.configLocation.findUnique({ where: { id: body.id } });
        if (!current) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        const updated = await prisma.configLocation.update({
            where: { id: body.id },
            data: {
                label: body.label ?? current.label,
                color: body.color ?? current.color,
                icon: body.icon ?? current.icon,
                sortOrder: body.sortOrder ?? current.sortOrder,
                active: body.active ?? current.active,
            },
        });

        await audit.update('ConfigLocation', body.id,
            { label: current.label, color: current.color },
            { label: updated.label, color: updated.color }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}

// DELETE - Delete location
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Location ID required' }, { status: 400 });
        }

        const inUse = await prisma.service.count({ where: { locationId: id } });
        if (inUse > 0) {
            return NextResponse.json({
                error: `Bu konum ${inUse} serviste kullanılıyor.`
            }, { status: 400 });
        }

        const location = await prisma.configLocation.delete({ where: { id } });

        await audit.delete('ConfigLocation', id, { key: location.key, label: location.label });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }
}
