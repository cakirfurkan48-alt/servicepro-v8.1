import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Get evaluations for a service
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const serviceId = searchParams.get('serviceId');
        const personnelId = searchParams.get('personnelId');

        if (!serviceId && !personnelId) {
            return NextResponse.json({ error: 'Service ID or Personnel ID required' }, { status: 400 });
        }

        const where: any = {};
        if (serviceId) where.serviceId = serviceId;
        if (personnelId) where.personnelId = personnelId;

        const evaluations = await prisma.evaluation.findMany({
            where,
            include: {
                criteria: true,
                personnel: { select: { id: true, name: true } },
                service: { select: { id: true, code: true, boatName: true } },
                evaluatedBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(evaluations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch evaluations' }, { status: 500 });
    }
}

// POST - Submit evaluations for a service
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { serviceId, evaluations } = body;

        if (!serviceId || !evaluations || !Array.isArray(evaluations)) {
            return NextResponse.json({ error: 'Service ID and evaluations array required' }, { status: 400 });
        }

        // Validate service exists and is completed
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: { status: true },
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Create evaluations in transaction
        const created = await prisma.$transaction(async (tx) => {
            const results = [];

            for (const eval_ of evaluations) {
                // Check if evaluation already exists
                const existing = await tx.evaluation.findFirst({
                    where: {
                        serviceId,
                        personnelId: eval_.personnelId,
                        criteriaId: eval_.criteriaId,
                    },
                });

                if (existing) {
                    // Update existing
                    const updated = await tx.evaluation.update({
                        where: { id: existing.id },
                        data: {
                            score: eval_.score,
                            notes: eval_.notes,
                            evaluatedById: session.user.id,
                        },
                    });
                    results.push(updated);
                } else {
                    // Create new
                    const created = await tx.evaluation.create({
                        data: {
                            serviceId,
                            personnelId: eval_.personnelId,
                            criteriaId: eval_.criteriaId,
                            score: eval_.score,
                            notes: eval_.notes,
                            evaluatedById: session.user.id,
                        },
                    });
                    results.push(created);
                }
            }

            return results;
        });

        // Calculate and update star scores
        await updateStarScores(serviceId);

        await audit.create('Evaluation', serviceId, {
            count: created.length,
            evaluatedBy: session.user.name,
        });

        return NextResponse.json({ success: true, count: created.length }, { status: 201 });
    } catch (error) {
        console.error('Evaluation submit error:', error);
        return NextResponse.json({ error: 'Failed to submit evaluations' }, { status: 500 });
    }
}

// Helper function to update star scores
async function updateStarScores(serviceId: string) {
    const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
            supportTeam: { include: { personnel: true } },
            responsible: true,
        },
    });

    if (!service) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get all personnel involved
    const personnelIds = [
        ...(service.responsible ? [service.responsible.id] : []),
        ...service.supportTeam.map(st => st.personnelId),
    ];

    for (const personnelId of personnelIds) {
        // Calculate average score for this personnel in this month
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);

        const evals = await prisma.evaluation.findMany({
            where: {
                personnelId,
                createdAt: { gte: monthStart, lte: monthEnd },
            },
            include: { criteria: true },
        });

        if (evals.length === 0) continue;

        // Calculate weighted average
        let totalWeightedScore = 0;
        let totalWeight = 0;

        for (const ev of evals) {
            const normalizedScore = (ev.score / ev.criteria.maxScore) * 5; // Normalize to 5-star scale
            totalWeightedScore += normalizedScore * ev.criteria.weight;
            totalWeight += ev.criteria.weight;
        }

        const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

        // Upsert star score
        await prisma.starScore.upsert({
            where: {
                personnelId_month_year: { personnelId, month, year },
            },
            update: {
                totalScore: averageScore,
                evaluationCount: evals.length,
            },
            create: {
                personnelId,
                month,
                year,
                totalScore: averageScore,
                evaluationCount: evals.length,
            },
        });
    }
}
