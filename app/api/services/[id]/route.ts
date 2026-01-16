import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Single service by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const service = await prisma.service.findUnique({
            where: { id: params.id },
            include: {
                status: true,
                location: true,
                jobType: true,
                boat: true,
                responsible: { include: { title: true } },
                supportTeam: {
                    include: {
                        personnel: { include: { title: true } },
                    },
                },
                parts: true,
                statusHistory: {
                    orderBy: { changedAt: 'desc' },
                    take: 10,
                },
                evaluations: {
                    include: { personnel: true },
                },
            },
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json(service);
    } catch (error) {
        console.error('Service fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
    }
}

// PUT - Update service
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Get current service for audit
        const currentService = await prisma.service.findUnique({
            where: { id: params.id },
            include: { status: true, location: true, jobType: true },
        });

        if (!currentService) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Build update data
        const updateData: any = {};

        if (body.boatName !== undefined) updateData.boatName = body.boatName;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.scheduledDate !== undefined) updateData.scheduledDate = new Date(body.scheduledDate);
        if (body.scheduledTime !== undefined) updateData.scheduledTime = body.scheduledTime;
        if (body.contactPerson !== undefined) updateData.contactPerson = body.contactPerson;
        if (body.contactPhone !== undefined) updateData.contactPhone = body.contactPhone;
        if (body.address !== undefined) updateData.address = body.address;
        if (body.responsibleId !== undefined) updateData.responsibleId = body.responsibleId || null;
        if (body.customFields !== undefined) updateData.customFields = body.customFields;

        // Handle status change
        if (body.status && body.status !== currentService.status.key) {
            const newStatus = await prisma.configStatus.findUnique({ where: { key: body.status } });
            if (newStatus) {
                updateData.statusId = newStatus.id;

                // Create status history entry
                await prisma.statusHistory.create({
                    data: {
                        serviceId: params.id,
                        fromStatusId: currentService.statusId,
                        toStatusId: newStatus.id,
                        changedById: session.user.id,
                        notes: body.statusNote || null,
                    },
                });

                // Audit status change
                await audit.statusChange('Service', params.id, currentService.status.key, body.status);

                // If completed, set completedAt
                if (body.status === 'TAMAMLANDI') {
                    updateData.completedAt = new Date();
                }
            }
        }

        // Handle location change
        if (body.location && body.location !== currentService.location.key) {
            const newLocation = await prisma.configLocation.findUnique({ where: { key: body.location } });
            if (newLocation) {
                updateData.locationId = newLocation.id;
            }
        }

        // Handle jobType change
        if (body.jobType && body.jobType !== currentService.jobType.key) {
            const newJobType = await prisma.configJobType.findUnique({ where: { key: body.jobType } });
            if (newJobType) {
                updateData.jobTypeId = newJobType.id;
            }
        }

        // Update service
        const updatedService = await prisma.service.update({
            where: { id: params.id },
            data: updateData,
        });

        // Handle support team update
        if (body.supportTeamIds !== undefined) {
            // Remove existing
            await prisma.serviceSupport.deleteMany({
                where: { serviceId: params.id },
            });

            // Add new
            if (body.supportTeamIds.length > 0) {
                await prisma.serviceSupport.createMany({
                    data: body.supportTeamIds.map((personnelId: string) => ({
                        serviceId: params.id,
                        personnelId,
                        role: 'support',
                    })),
                });
            }
        }

        // Audit update
        await audit.update('Service', params.id,
            { boatName: currentService.boatName, status: currentService.status.key },
            { boatName: updatedService.boatName, status: body.status || currentService.status.key }
        );

        return NextResponse.json({ success: true, id: updatedService.id });
    } catch (error) {
        console.error('Service update error:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

// DELETE - Delete service
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        const service = await prisma.service.findUnique({
            where: { id: params.id },
            select: { id: true, code: true, boatName: true },
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Delete service (cascades to related records)
        await prisma.service.delete({
            where: { id: params.id },
        });

        // Audit delete
        await audit.delete('Service', params.id, {
            code: service.code,
            boatName: service.boatName,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Service delete error:', error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
