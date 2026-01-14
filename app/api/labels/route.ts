import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const LABELS_FILE = path.join(process.cwd(), 'data', 'labels.json');

function getLabels(): Record<string, any> {
    try {
        if (!fs.existsSync(LABELS_FILE)) {
            // Initialize with default labels
            const defaults = {
                konumlar: {
                    yatmarin: { label: 'Yatmarın (Merkez)' },
                    netsel: { label: 'Netsel' },
                    dis_servis: { label: 'Dış Servis' },
                },
                durumlar: {
                    devam_ediyor: { label: 'Devam Ediyor' },
                    parca_bekliyor: { label: 'Parça Bekliyor' },
                    tamamlandi: { label: 'Tamamlandı' },
                },
                genel: {
                    sirket_adi: 'ServicePRO',
                    slogan: 'Tekne Teknik Servis Takip Sistemi',
                },
            };
            fs.writeFileSync(LABELS_FILE, JSON.stringify(defaults, null, 2));
            return defaults;
        }
        const content = fs.readFileSync(LABELS_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading labels:', error);
        return {};
    }
}

function setNestedValue(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
            current[keys[i]] = {};
        }
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return result;
}

function saveLabels(labels: Record<string, any>): void {
    fs.writeFileSync(LABELS_FILE, JSON.stringify(labels, null, 2));
}

// GET all labels
export async function GET() {
    try {
        const labels = getLabels();
        return NextResponse.json(labels);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch labels' }, { status: 500 });
    }
}

// PUT update a label
export async function PUT(request: Request) {
    try {
        const { path: labelPath, value } = await request.json();

        if (!labelPath || value === undefined) {
            return NextResponse.json({ error: 'Path and value required' }, { status: 400 });
        }

        const labels = getLabels();
        const updatedLabels = setNestedValue(labels, labelPath, value);
        saveLabels(updatedLabels);

        return NextResponse.json({ success: true, path: labelPath, value });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update label' }, { status: 500 });
    }
}
