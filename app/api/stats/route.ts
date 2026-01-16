
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            bugunServisleri,
            devamEdenler,
            parcaBekleyenler,
            randevular,
            tamamlananlar,
            toplamServis,
            aktifPersonel
        ] = await prisma.$transaction([
            prisma.service.count({
                where: {
                    scheduledDate: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            prisma.service.count({ where: { status: { key: 'DEVAM_EDIYOR' } } }),
            prisma.service.count({ where: { status: { key: 'PARCA_BEKLIYOR' } } }),
            prisma.service.count({ where: { status: { key: 'RANDEVU_VERILDI' } } }),
            prisma.service.count({ where: { status: { key: 'TAMAMLANDI' } } }),
            prisma.service.count(),
            prisma.personnel.count({ where: { active: true } })
        ]);

        return NextResponse.json({
            bugunServisleri,
            devamEdenler,
            parcaBekleyenler,
            randevular,
            tamamlananlar,
            toplamServis,
            aktifPersonel,
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
