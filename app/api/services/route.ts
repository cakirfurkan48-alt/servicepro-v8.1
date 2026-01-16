import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - List all services with filters
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const statusKey = searchParams.get('status');
        const locationKey = searchParams.get('location');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const search = searchParams.get('search');

        // Build where clause
        const where: any = {};

        if (statusKey && statusKey !== 'all') {
            where.status = { key: statusKey };
        }

        if (locationKey && locationKey !== 'all') {
            where.location = { key: locationKey };
        }

        if (startDate) {
            where.scheduledDate = {
                ...where.scheduledDate,
                gte: new Date(startDate),
            };
        }

        if (endDate) {
            where.scheduledDate = {
                ...where.scheduledDate,
                lte: new Date(endDate),
            };
        }

        if (search) {
            where.OR = [
                { boatName: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }

        const services = await prisma.service.findMany({
            where,
            include: {
                status: true,
                location: true,
                jobType: true,
                responsible: {
                    include: { title: true },
                },
                supportTeam: {
                    include: {
                        personnel: { include: { title: true } },
                    },
                },
                parts: true,
            },
            orderBy: { scheduledDate: 'asc' },
        });

        // Transform to match existing frontend format
        const formattedServices = services.map(s => ({
            id: s.id,
            code: s.code,
            boatName: s.boatName,
            description: s.description,
            status: s.status.key,
            statusLabel: s.status.label,
            statusColor: s.status.color,
            location: s.location.key,
            locationLabel: s.location.label,
            locationColor: s.location.color,
            jobType: s.jobType.key,
            jobTypeLabel: s.jobType.label,
            jobTypeMultiplier: s.jobType.multiplier,
            scheduledDate: s.scheduledDate.toISOString().split('T')[0],
            scheduledTime: s.scheduledTime,
            completedAt: s.completedAt?.toISOString(),
            responsible: s.responsible ? {
                id: s.responsible.id,
                name: s.responsible.name,
                title: s.responsible.title.label,
            } : null,
            supportTeam: s.supportTeam.map(st => ({
                id: st.personnel.id,
                name: st.personnel.name,
                title: st.personnel.title.label,
                role: st.role,
            })),
            parts: s.parts.map(p => ({
                id: p.id,
                name: p.partName,
                quantity: p.quantity,
                status: p.status,
            })),
            contactPerson: s.contactPerson,
            contactPhone: s.contactPhone,
            address: s.address,
            customFields: s.customFields,
            createdAt: s.createdAt.toISOString(),
            updatedAt: s.updatedAt.toISOString(),
        }));

        return NextResponse.json(formattedServices);
    } catch (error) {
        console.error('Service fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

// POST - Create new service
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Generate service code
        const year = new Date().getFullYear();
        const count = await prisma.service.count({
            where: {
                code: { startsWith: `SRV-${year}-` },
            },
        });
        const code = `SRV-${year}-${String(count + 1).padStart(4, '0')}`;

        // Get config IDs from keys
        const status = await prisma.configStatus.findUnique({ where: { key: body.status || 'RANDEVU_VERILDI' } });
        const location = await prisma.configLocation.findUnique({ where: { key: body.location } });
        const jobType = await prisma.configJobType.findUnique({ where: { key: body.jobType || 'PAKET' } });

        if (!status || !location || !jobType) {
            return NextResponse.json({ error: 'Invalid status, location, or job type' }, { status: 400 });
        }

        // Create service
        const service = await prisma.service.create({
            data: {
                code,
                boatName: body.boatName,
                description: body.description || '',
                statusId: status.id,
                locationId: location.id,
                jobTypeId: jobType.id,
                scheduledDate: new Date(body.scheduledDate),
                scheduledTime: body.scheduledTime,
                contactPerson: body.contactPerson,
                contactPhone: body.contactPhone,
                address: body.address,
                responsibleId: body.responsibleId || null,
                customFields: body.customFields || {},
                createdById: session.user.id,
            },
            include: {
                status: true,
                location: true,
                jobType: true,
            },
        });

        // Add support team
        if (body.supportTeamIds && body.supportTeamIds.length > 0) {
            await prisma.serviceSupport.createMany({
                data: body.supportTeamIds.map((personnelId: string) => ({
                    serviceId: service.id,
                    personnelId,
                    role: 'support',
                })),
            });
        }

        // Create initial status history
        await prisma.statusHistory.create({
            data: {
                serviceId: service.id,
                toStatusId: status.id,
                changedById: session.user.id,
                notes: 'Servis oluşturuldu',
            },
        });

        // Audit log
        await audit.create('Service', service.id, {
            code: service.code,
            boatName: service.boatName,
            status: status.key,
            location: location.key,
        });

        return NextResponse.json({
            id: service.id,
            code: service.code,
        }, { status: 201 });
    } catch (error) {
        console.error('Service create error:', error);
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}
