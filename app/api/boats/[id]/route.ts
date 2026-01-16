import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Get boat service history
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const boatId = params.id;

        // Get boat details
        const boat = await prisma.boat.findUnique({
            where: { id: boatId },
        });

        if (!boat) {
            return NextResponse.json({ error: 'Boat not found' }, { status: 404 });
        }

        // Get all services for this boat
        const services = await prisma.service.findMany({
            where: { boatId },
            include: {
                status: true,
                location: true,
                jobType: true,
                responsible: { include: { title: true } },
                parts: true,
                evaluations: {
                    include: {
                        criteria: true,
                        personnel: { select: { name: true } },
                    },
                },
            },
            orderBy: { scheduledDate: 'desc' },
        });

        // Calculate boat stats
        const completedServices = services.filter(s => s.status.key === 'TAMAMLANDI');
        const totalParts = services.reduce((sum, s) => sum + s.parts.length, 0);

        const averageSatisfaction = completedServices.length > 0
            ? completedServices.reduce((sum, s) => {
                const evals = s.evaluations.filter(e => e.criteria.key === 'customer_satisfaction');
                if (evals.length === 0) return sum;
                return sum + (evals.reduce((es, e) => es + e.score, 0) / evals.length);
            }, 0) / completedServices.filter(s => s.evaluations.length > 0).length || 0
            : 0;

        return NextResponse.json({
            boat: {
                id: boat.id,
                name: boat.name,
                model: boat.model,
                year: boat.year,
                owner: boat.ownerName,
                phone: boat.ownerPhone,
            },
            stats: {
                totalServices: services.length,
                completedServices: completedServices.length,
                pendingServices: services.filter(s => s.status.key !== 'TAMAMLANDI').length,
                totalParts: totalParts,
                averageSatisfaction: Math.round(averageSatisfaction * 100) / 100,
            },
            services: services.map(s => ({
                id: s.id,
                code: s.code,
                description: s.description,
                status: s.status.label,
                statusColor: s.status.color,
                location: s.location.label,
                jobType: s.jobType.label,
                scheduledDate: s.scheduledDate.toISOString().split('T')[0],
                completedAt: s.completedAt?.toISOString(),
                responsible: s.responsible?.name || 'Atanmadı',
                partsCount: s.parts.length,
                hasEvaluation: s.evaluations.length > 0,
            })),
        });
    } catch (error) {
        console.error('Boat history fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch boat history' }, { status: 500 });
    }
}
