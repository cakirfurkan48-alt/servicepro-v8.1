import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Get all menu items
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const menuItems = await prisma.menuItem.findMany({
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(menuItems);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
    }
}

// POST - Create new menu item
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        const maxOrder = await prisma.menuItem.aggregate({
            _max: { sortOrder: true },
        });

        const menuItem = await prisma.menuItem.create({
            data: {
                href: body.href,
                label: body.label,
                icon: body.icon,
                parentId: body.parentId || null,
                sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                visible: body.visible ?? true,
                adminOnly: body.adminOnly ?? false,
            },
        });

        await audit.create('MenuItem', menuItem.id, { href: body.href, label: body.label });

        return NextResponse.json(menuItem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
    }
}

// PUT - Update menu items (batch update for reordering)
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        // Handle batch update (for drag-drop reordering)
        if (Array.isArray(body)) {
            const updates = body.map((item, index) =>
                prisma.menuItem.update({
                    where: { id: item.id },
                    data: {
                        sortOrder: index,
                        label: item.label,
                        icon: item.icon,
                        visible: item.visible,
                        adminOnly: item.adminOnly,
                    },
                })
            );

            await Promise.all(updates);

            await audit.update('MenuItem', 'batch', { action: 'reorder' }, { count: body.length });

            return NextResponse.json({ success: true });
        }

        // Single item update
        if (!body.id) {
            return NextResponse.json({ error: 'Menu item ID required' }, { status: 400 });
        }

        const current = await prisma.menuItem.findUnique({ where: { id: body.id } });
        if (!current) {
            return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
        }

        const updated = await prisma.menuItem.update({
            where: { id: body.id },
            data: {
                href: body.href ?? current.href,
                label: body.label ?? current.label,
                icon: body.icon ?? current.icon,
                sortOrder: body.sortOrder ?? current.sortOrder,
                visible: body.visible ?? current.visible,
                adminOnly: body.adminOnly ?? current.adminOnly,
            },
        });

        await audit.update('MenuItem', body.id,
            { label: current.label },
            { label: updated.label }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
    }
}

// DELETE - Delete menu item
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Menu item ID required' }, { status: 400 });
        }

        const menuItem = await prisma.menuItem.delete({ where: { id } });

        await audit.delete('MenuItem', id, { href: menuItem.href, label: menuItem.label });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
    }
}
