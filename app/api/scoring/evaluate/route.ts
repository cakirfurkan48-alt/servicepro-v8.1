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
                personnel: { select: { id: true, name: true } },
                service: { select: { id: true, code: true, boatName: true } },
                // evaluatedBy: { select: { id: true, name: true } }, // Removed temporarily to be safe
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
        // Expected body: { serviceId, evaluations: [{ personnelId, scores: { [criteriaId]: { score: 5, note: '' } } }] }

        if (!serviceId || !evaluations || !Array.isArray(evaluations)) {
            return NextResponse.json({ error: 'Service ID and evaluations array required' }, { status: 400 });
        }

        const results = [];

        for (const eval_ of evaluations) {
            const { personnelId, scores, totalScore } = eval_;

            // Check if evaluation exists
            const existing = await prisma.evaluation.findFirst({
                where: { serviceId, personnelId }
            });

            let record;
            if (existing) {
                record = await prisma.evaluation.update({
                    where: { id: existing.id },
                    data: {
                        scores: scores || {}, // Store as JSON
                        totalScore: totalScore || 0,
                        evaluatorId: session.user.id,
                    }
                });
            } else {
                record = await prisma.evaluation.create({
                    data: {
                        serviceId,
                        personnelId,
                        scores: scores || {},
                        totalScore: totalScore || 0,
                        evaluatorId: session.user.id,
                    }
                });
            }
            results.push(record);
        }

        // await updateStarScores(serviceId); // Disabled for stabilization

        await audit.create('Evaluation', serviceId, {
            count: results.length,
            evaluatedBy: session.user.name,
        });

        return NextResponse.json({ success: true, count: results.length }, { status: 201 });
    } catch (error) {
        console.error('Evaluation submit error:', error);
        return NextResponse.json({ error: 'Failed to submit evaluations' }, { status: 500 });
    }
}

// Disabled complex logic for now
/*
async function updateStarScores(serviceId: string) {
   // ... implementation that needs to fetch criteria ...
}
*/
