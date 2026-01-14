
import { NextResponse } from 'next/server';
import { getServiceById, updateService, deleteService } from '@/lib/data-store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const service = getServiceById(params.id);
        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }
        return NextResponse.json(service);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const success = updateService(params.id, body);
        if (!success) {
            return NextResponse.json({ error: 'Service not found or update failed' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const success = deleteService(params.id);
        if (!success) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
