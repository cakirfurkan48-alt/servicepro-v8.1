import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const PERSONNEL_FILE = path.join(process.cwd(), 'data', 'personnel.json');

interface Personnel {
    id: string;
    ad: string;
    rol: string;
    unvan: string;
    aktif: boolean;
    girisYili?: number;
}

function getPersonnel(): Personnel[] {
    try {
        if (!fs.existsSync(PERSONNEL_FILE)) {
            return [];
        }
        const content = fs.readFileSync(PERSONNEL_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading personnel:', error);
        return [];
    }
}

function savePersonnel(personnel: Personnel[]): void {
    fs.writeFileSync(PERSONNEL_FILE, JSON.stringify(personnel, null, 2));
}

// GET all personnel
export async function GET() {
    try {
        const personnel = getPersonnel();
        return NextResponse.json(personnel);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
    }
}

// POST create new personnel
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const personnel = getPersonnel();

        const newPersonnel: Personnel = {
            id: String(personnel.length + 1),
            ad: body.ad,
            rol: body.rol || 'teknisyen',
            unvan: body.unvan || 'teknisyen',
            aktif: body.aktif !== undefined ? body.aktif : true,
            girisYili: body.girisYili || new Date().getFullYear(),
        };

        personnel.push(newPersonnel);
        savePersonnel(personnel);

        return NextResponse.json(newPersonnel, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create personnel' }, { status: 500 });
    }
}
