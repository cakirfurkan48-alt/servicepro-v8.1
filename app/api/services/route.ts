
import { NextResponse } from 'next/server';
import { getAllServices, addService } from '@/lib/data-store';

export async function GET() {
    try {
        const services = getAllServices();
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newId = addService(body);
        return NextResponse.json({ id: newId }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}
