import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// GET - Get configuration data
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');

        // Fetch all config in parallel
        const [statuses, locations, jobTypes, titles, appConfig, menuItems] = await Promise.all([
            prisma.configStatus.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
            prisma.configLocation.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
            prisma.configJobType.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
            prisma.configPersonnelTitle.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
            prisma.appConfig.findUnique({ where: { id: 'main' } }),
            prisma.menuItem.findMany({ where: { visible: true }, orderBy: { sortOrder: 'asc' } }),
        ]);

        // If specific section requested
        if (section) {
            switch (section) {
                case 'statuses': return NextResponse.json(statuses);
                case 'locations': return NextResponse.json(locations);
                case 'jobTypes': return NextResponse.json(jobTypes);
                case 'titles': return NextResponse.json(titles);
                case 'appearance': return NextResponse.json(appConfig);
                case 'menu': return NextResponse.json(menuItems);
            }
        }

        // Return all config
        return NextResponse.json({
            statuses: statuses.map(s => ({
                key: s.key,
                label: s.label,
                color: s.color,
                icon: s.icon,
            })),
            locations: locations.map(l => ({
                key: l.key,
                label: l.label,
                color: l.color,
                icon: l.icon,
            })),
            jobTypes: jobTypes.map(j => ({
                key: j.key,
                label: j.label,
                multiplier: j.multiplier,
            })),
            titles: titles.map(t => ({
                key: t.key,
                label: t.label,
                level: t.level,
            })),
            appearance: appConfig ? {
                appName: appConfig.appName,
                slogan: appConfig.slogan,
                logoUrl: appConfig.logoUrl,
                primaryColor: appConfig.primaryColor,
                secondaryColor: appConfig.secondaryColor,
                themeMode: appConfig.themeMode,
                fontFamily: appConfig.fontFamily,
                baseFontSize: appConfig.baseFontSize,
                borderRadius: appConfig.borderRadius,
                sidebarWidth: appConfig.sidebarWidth,
            } : null,
            menu: menuItems.map(m => ({
                id: m.id,
                href: m.href,
                label: m.label,
                icon: m.icon,
                adminOnly: m.adminOnly,
            })),
        });
    } catch (error) {
        console.error('Config fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}
