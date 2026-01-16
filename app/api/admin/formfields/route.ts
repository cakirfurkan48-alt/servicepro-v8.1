import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import audit from '@/lib/audit';

// GET - Get all form fields
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const formType = searchParams.get('formType') || 'service';
        const activeOnly = searchParams.get('active') !== 'false';

        const where: any = { formType };
        if (activeOnly) where.active = true;

        const fields = await prisma.formField.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });

        return NextResponse.json(fields);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch form fields' }, { status: 500 });
    }
}

// POST - Create new form field
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        // Generate field key from label
        const fieldKey = body.fieldKey || body.label
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        // Get max sortOrder
        const maxOrder = await prisma.formField.aggregate({
            where: { formType: body.formType || 'service' },
            _max: { sortOrder: true },
        });

        const field = await prisma.formField.create({
            data: {
                formType: body.formType || 'service',
                fieldKey,
                label: body.label,
                type: body.type || 'TEXT',
                placeholder: body.placeholder,
                helpText: body.helpText,
                defaultValue: body.defaultValue,
                options: body.options || null,
                validation: body.validation || null,
                sortOrder: (maxOrder._max.sortOrder || 0) + 1,
                active: body.active ?? true,
                visibleTo: body.visibleTo || ['ADMIN', 'COORDINATOR'],
                editableBy: body.editableBy || ['ADMIN', 'COORDINATOR'],
            },
        });

        await audit.create('FormField', field.id, { fieldKey, label: body.label, type: body.type });

        return NextResponse.json(field, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Bu alan anahtarı zaten mevcut' }, { status: 400 });
        }
        console.error('FormField create error:', error);
        return NextResponse.json({ error: 'Failed to create field' }, { status: 500 });
    }
}

// PUT - Update form field
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        if (!body.id) {
            return NextResponse.json({ error: 'Field ID required' }, { status: 400 });
        }

        const current = await prisma.formField.findUnique({ where: { id: body.id } });
        if (!current) {
            return NextResponse.json({ error: 'Field not found' }, { status: 404 });
        }

        const updated = await prisma.formField.update({
            where: { id: body.id },
            data: {
                label: body.label ?? current.label,
                type: body.type ?? current.type,
                placeholder: body.placeholder ?? current.placeholder,
                helpText: body.helpText ?? current.helpText,
                defaultValue: body.defaultValue ?? current.defaultValue,
                options: body.options !== undefined ? body.options : current.options,
                validation: body.validation !== undefined ? body.validation : current.validation,
                sortOrder: body.sortOrder ?? current.sortOrder,
                active: body.active ?? current.active,
                visibleTo: body.visibleTo ?? current.visibleTo,
                editableBy: body.editableBy ?? current.editableBy,
            },
        });

        await audit.update('FormField', body.id,
            { label: current.label, type: current.type },
            { label: updated.label, type: updated.type }
        );

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update field' }, { status: 500 });
    }
}

// DELETE - Delete form field
export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Field ID required' }, { status: 400 });
        }

        const field = await prisma.formField.delete({ where: { id } });

        await audit.delete('FormField', id, { fieldKey: field.fieldKey, label: field.label });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete field' }, { status: 500 });
    }
}
