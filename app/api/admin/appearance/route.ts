import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// PUT - Update AppConfig (appearance settings)
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        const body = await request.json();

        // Get current config for audit
        const current = await prisma.appConfig.findUnique({ where: { id: 'main' } });

        const updated = await prisma.appConfig.upsert({
            where: { id: 'main' },
            update: {
                appName: body.appName ?? current?.appName,
                slogan: body.slogan ?? current?.slogan,
                logoUrl: body.logoUrl ?? current?.logoUrl,
                faviconUrl: body.faviconUrl ?? current?.faviconUrl,
                primaryColor: body.primaryColor ?? current?.primaryColor,
                secondaryColor: body.secondaryColor ?? current?.secondaryColor,
                themeMode: body.themeMode ?? current?.themeMode,
                fontFamily: body.fontFamily ?? current?.fontFamily,
                baseFontSize: body.baseFontSize ?? current?.baseFontSize,
                borderRadius: body.borderRadius ?? current?.borderRadius,
                sidebarWidth: body.sidebarWidth ?? current?.sidebarWidth,
            },
            create: {
                id: 'main',
                appName: body.appName || 'ServicePRO',
                slogan: body.slogan,
                logoUrl: body.logoUrl,
                faviconUrl: body.faviconUrl,
                primaryColor: body.primaryColor || '#0ea5e9',
                secondaryColor: body.secondaryColor || '#6366f1',
                themeMode: body.themeMode || 'dark',
                fontFamily: body.fontFamily || 'Inter',
                baseFontSize: body.baseFontSize || 16,
                borderRadius: body.borderRadius || 10,
                sidebarWidth: body.sidebarWidth || 260,
            },
        });

        await audit.update('AppConfig', 'main',
            { appName: current?.appName, themeMode: current?.themeMode },
            { appName: updated.appName, themeMode: updated.themeMode }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('AppConfig update error:', error);
        return NextResponse.json({ error: 'Failed to update appearance' }, { status: 500 });
    }
}
