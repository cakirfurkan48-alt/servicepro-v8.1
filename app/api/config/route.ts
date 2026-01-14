import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'config.json');

interface Config {
    appearance: {
        theme: {
            mode: 'dark' | 'light';
            primaryColor: string;
            secondaryColor: string;
            successColor: string;
            warningColor: string;
            errorColor: string;
            backgroundColor: string;
            surfaceColor: string;
            borderColor: string;
        };
        typography: {
            fontFamily: string;
            baseFontSize: number;
            headingWeight: number;
            bodyWeight: number;
        };
        layout: {
            borderRadius: number;
            spacing: 'compact' | 'normal' | 'relaxed';
            sidebarWidth: number;
        };
        branding: {
            appName: string;
            slogan: string;
            logoUrl: string | null;
            faviconUrl: string | null;
        };
    };
    content: {
        locations: Array<{ id: string; label: string; color: string; icon: string }>;
        statuses: Array<{ id: string; label: string; color: string; icon: string }>;
        serviceTypes: Array<{ id: string; label: string; multiplier: number }>;
        personnelTitles: Array<{ id: string; label: string; level: number }>;
    };
    menu: {
        sidebar: Array<{
            id: string;
            href: string;
            label: string;
            icon: string;
            visible: boolean;
            adminOnly: boolean;
        }>;
        quickLinks: Array<{ id: string; href: string; label: string; icon: string }>;
    };
    system: {
        company: {
            name: string;
            address: string;
            phone: string;
            email: string;
            whatsapp: string;
        };
        version: string;
        lastBackup: string | null;
    };
}

function getConfig(): Config {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            throw new Error('Config file not found');
        }
        const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading config:', error);
        throw error;
    }
}

function saveConfig(config: Config): void {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 4));
}

function deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

// GET entire config or specific section
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');

        const config = getConfig();

        if (section && section in config) {
            return NextResponse.json((config as any)[section]);
        }

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

// PUT update config (partial update supported)
export async function PUT(request: Request) {
    try {
        const updates = await request.json();
        const config = getConfig();

        const updatedConfig = deepMerge(config, updates);
        saveConfig(updatedConfig);

        return NextResponse.json({ success: true, config: updatedConfig });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
}

// POST for specific operations (backup, restore)
export async function POST(request: Request) {
    try {
        const { action, data } = await request.json();

        if (action === 'backup') {
            const config = getConfig();
            config.system.lastBackup = new Date().toISOString();
            saveConfig(config);

            // Create backup file
            const backupPath = path.join(process.cwd(), 'data', `backup-${Date.now()}.json`);
            fs.writeFileSync(backupPath, JSON.stringify(config, null, 2));

            return NextResponse.json({ success: true, backupPath });
        }

        if (action === 'restore' && data) {
            saveConfig(data);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
    }
}
