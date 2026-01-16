/**
 * Google Sheets Data Import Script
 * 
 * Bu script, Google Sheets'teki servis verilerini ServicePRO veritabanına aktarır.
 * 
 * Kullanım:
 *   npx ts-node scripts/import-sheets.ts
 * 
 * Gereksinimler:
 *   1. .env dosyasında GOOGLE_SHEETS_ID tanımlı olmalı
 *   2. Google APIs erişim ayarları yapılmış olmalı
 */

import { PrismaClient } from '@prisma/client';
import { normalizeStatus, STATUS } from '../lib/status';

const prisma = new PrismaClient();

// CSV row interface
interface SheetRow {
    tarih: string;
    saat?: string;
    tekneAdi: string;
    adres: string;
    yer?: string;
    servisAciklamasi: string;
    irtibatKisi?: string;
    telefon?: string;
    durum: string;
}

// Parse DD.MM.YYYY date format
function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    const date = new Date(`${year}-${month}-${day}`);

    return isNaN(date.getTime()) ? null : date;
}

// Normalize status from sheets to new Marlin standard
function mapStatus(sheetStatus: string): string {
    return normalizeStatus(sheetStatus);
}

// Find or create boat by name
async function findOrCreateBoat(name: string) {
    let boat = await prisma.boat.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (!boat) {
        boat = await prisma.boat.create({
            data: { name }
        });
        console.log(`  ✅ Yeni tekne oluşturuldu: ${name}`);
    }

    return boat;
}

// Generate service code SRV-YYYY-NNNN
async function generateServiceCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SRV-${year}-`;

    const lastService = await prisma.service.findFirst({
        where: { code: { startsWith: prefix } },
        orderBy: { code: 'desc' }
    });

    let nextNumber = 1;
    if (lastService) {
        const lastNumber = parseInt(lastService.code.split('-')[2], 10);
        nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

// Find default location and status configs
async function getDefaultConfigs() {
    // Get or create default location
    let defaultLocation = await prisma.configLocation.findFirst({
        where: { key: 'DIS_SERVIS' }
    });

    if (!defaultLocation) {
        defaultLocation = await prisma.configLocation.create({
            data: {
                key: 'DIS_SERVIS',
                label: 'Dış Servis',
                color: '#94a3b8',
                sortOrder: 99
            }
        });
    }

    // Get or create default status
    let defaultStatus = await prisma.configStatus.findFirst({
        where: { key: 'PLANLANDI_RANDEVU' }
    });

    if (!defaultStatus) {
        defaultStatus = await prisma.configStatus.create({
            data: {
                key: 'PLANLANDI_RANDEVU',
                label: 'Planlandı/Randevu',
                color: '#86efac',
                sortOrder: 1
            }
        });
    }

    // Get or create default job type
    let defaultJobType = await prisma.configJobType.findFirst({
        where: { key: 'GENEL' }
    });

    if (!defaultJobType) {
        defaultJobType = await prisma.configJobType.create({
            data: {
                key: 'GENEL',
                label: 'Genel Servis',
                multiplier: 1.0,
                sortOrder: 1
            }
        });
    }

    return { defaultLocation, defaultStatus, defaultJobType };
}

// Import a single row
async function importRow(row: SheetRow, configs: Awaited<ReturnType<typeof getDefaultConfigs>>) {
    const { defaultLocation, defaultStatus, defaultJobType } = configs;

    // Find or create boat
    const boat = await findOrCreateBoat(row.tekneAdi);

    // Parse date
    const scheduledDate = parseDate(row.tarih) || new Date();

    // Generate service code
    const code = await generateServiceCode();

    // Create service
    const service = await prisma.service.create({
        data: {
            code,
            boatId: boat.id,
            boatName: row.tekneAdi,
            locationId: defaultLocation.id,
            statusId: defaultStatus.id,
            jobTypeId: defaultJobType.id,
            description: row.servisAciklamasi || 'İçe aktarılan servis',
            address: row.adres,
            contactPerson: row.irtibatKisi,
            contactPhone: row.telefon,
            scheduledDate,
            scheduledTime: row.saat,
        }
    });

    console.log(`  📦 Servis oluşturuldu: ${code} - ${row.tekneAdi}`);
    return service;
}

// Main import function
export async function importFromCSV(csvContent: string) {
    console.log('🚀 Google Sheets import başlatılıyor...\n');

    // Parse CSV (simple implementation)
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Map header names to expected fields
    const headerMap: Record<string, keyof SheetRow> = {
        'tarih': 'tarih',
        'saat': 'saat',
        'tekne adı': 'tekneAdi',
        'tekne adi': 'tekneAdi',
        'adres': 'adres',
        'yer': 'yer',
        'servis açiklamasi': 'servisAciklamasi',
        'servis aciklamasi': 'servisAciklamasi',
        'irtibat kisi': 'irtibatKisi',
        'irtibat kişi': 'irtibatKisi',
        'telefon': 'telefon',
        'durum': 'durum',
    };

    // Get default configs
    const configs = await getDefaultConfigs();

    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Parse CSV line (handle quoted values)
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (const char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        // Build row object
        const row: Partial<SheetRow> = {};
        headers.forEach((header, index) => {
            const field = headerMap[header];
            if (field && values[index]) {
                (row as any)[field] = values[index];
            }
        });

        // Skip if missing required fields
        if (!row.tekneAdi || !row.tarih) {
            skipped++;
            continue;
        }

        try {
            await importRow(row as SheetRow, configs);
            imported++;
        } catch (error) {
            console.error(`  ❌ Hata (satır ${i + 1}):`, error);
            skipped++;
        }
    }

    console.log(`\n✅ Import tamamlandı!`);
    console.log(`   📦 Aktarılan: ${imported}`);
    console.log(`   ⏭️ Atlanan: ${skipped}`);
}

// Run if executed directly
if (require.main === module) {
    // For direct execution, you would fetch from Google Sheets
    // This is a placeholder - real implementation would use googleapis
    console.log('Bu script doğrudan çalıştırılamaz.');
    console.log('CSV içeriğini importFromCSV() fonksiyonuna gönderin.');
    process.exit(1);
}
