import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Get leaderboard for a month
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const now = new Date();
        const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1));
        const year = parseInt(searchParams.get('year') || String(now.getFullYear()));

        // Get star scores for the month
        const scores = await prisma.starScore.findMany({
            where: { month, year },
            include: {
                personnel: {
                    include: { title: true },
                },
            },
            orderBy: { totalPoints: 'desc' },
        });

        // Calculate rankings
        const ranked = scores.map((s, index) => ({
            id: s.personnelId,
            name: s.personnel.name,
            title: s.personnel.title.label,
            avatar: s.personnel.avatar,
            points: Math.round(s.totalPoints * 10) / 10,
            jobCount: s.jobCount,
            trend: 'stable', // creating mock trend logic for now
            rank: index + 1,
            // Calculate previous rank mock
            previousRank: index + 1 + (Math.random() > 0.5 ? 1 : -1),
            stars: getStarRating(s.totalPoints),
        }));

        // Get monthly stats
        const stats = {
            month,
            year,
            totalPersonnel: scores.length,
            averageScore: scores.length > 0
                ? Math.round((scores.reduce((sum, s) => sum + s.totalPoints, 0) / scores.length) * 100) / 100
                : 0,
            topPerformer: ranked[0] || null,
        };

        return NextResponse.json({ leaderboard: ranked, stats });
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}

// Helper to convert score to star rating display
function getStarRating(score: number): { filled: number; half: boolean } {
    const filled = Math.floor(score);
    const half = score - filled >= 0.5;
    return { filled, half };
}
