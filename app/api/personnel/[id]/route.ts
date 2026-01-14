
import { NextResponse } from 'next/server';
import { getPersonnelById } from '@/lib/data-store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const personnel = getPersonnelById(params.id);
        if (!personnel) {
            return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
        }
        return NextResponse.json(personnel);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
    }
}
