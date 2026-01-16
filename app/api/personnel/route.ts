import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - List all personnel
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') !== 'false';
        const titleKey = searchParams.get('title');

        const where: any = {};
        if (activeOnly) where.active = true;
        if (titleKey) where.title = { key: titleKey };

        const personnel = await prisma.personnel.findMany({
            where,
            include: {
                title: true,
                _count: {
                    select: {
                        servicesResponsible: true,
                        servicesSupport: true,
                        evaluations: true,
                    },
                },
            },
            orderBy: [
                { title: { level: 'desc' } },
                { name: 'asc' },
            ],
        });

        // Format for frontend compatibility
        const formatted = personnel.map(p => ({
            id: p.id,
            name: p.name,
            title: p.title.key,
            titleLabel: p.title.label,
            titleLevel: p.title.level,
            phone: p.phone,
            email: p.email,
            avatar: p.avatar,
            active: p.active,
            serviceCount: p._count.servicesResponsible + p._count.servicesSupport,
            evaluationCount: p._count.evaluations,
            createdAt: p.createdAt.toISOString(),
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Personnel fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
    }
}

// POST - Create new personnel
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        const body = await request.json();

        // Get title ID from key
        const title = await prisma.configPersonnelTitle.findUnique({
            where: { key: body.title || 'TEKNISYEN' },
        });

        if (!title) {
            return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
        }

        const personnel = await prisma.personnel.create({
            data: {
                name: body.name,
                titleId: title.id,
                phone: body.phone,
                email: body.email,
                avatar: body.avatar,
                active: body.active ?? true,
            },
            include: { title: true },
        });

        await audit.create('Personnel', personnel.id, {
            name: personnel.name,
            title: title.key,
        });

        return NextResponse.json({
            id: personnel.id,
            name: personnel.name,
        }, { status: 201 });
    } catch (error) {
        console.error('Personnel create error:', error);
        return NextResponse.json({ error: 'Failed to create personnel' }, { status: 500 });
    }
}
