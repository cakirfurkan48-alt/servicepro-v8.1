/**
 * Google Sheets Data Import Script (Enhanced)
 * 
 * Bu script, Google Sheets'teki servis verilerini ServicePRO veritabanına aktarır.
 * 
 * Kurallar (Sprint 3):
 *   1. Status: normalizeStatus() kullanılarak 8 kanonik değere maplenir.
 *   2. Location: isYatmarin() kullanılarak belirlenir.
 *   3. Closure: Kapanış tarihi yoksa (CSV'de yok), completedAt = null ve incompleteClosure = true flag set edilir.
 *   4. Hedef: Prisma DB
 */

import { PrismaClient } from '@prisma/client';
import { normalizeStatus, STATUS, isCompletedStatus, StatusValue } from '../lib/status';
import { isYatmarin } from '../lib/yatmarin';

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

// Utility to get config IDs
// Uses a cache-like pattern (fetches once per run usually, but here we check per row for simplicity or fetch all first)
// Better to fetch all configs first.

async function getConfigMap() {
    const locations = await prisma.configLocation.findMany();
    const statuses = await prisma.configStatus.findMany();
    const jobTypes = await prisma.configJobType.findMany();

    // Helper to find ID
    const findLoc = (key: string) => locations.find(l => l.key === key)?.id;
    const findStat = (key: string) => statuses.find(s => s.key === key)?.id;
    const findJob = (key: string) => jobTypes.find(j => j.key === key)?.id;

    // Ensure default fallback exists (create if missing logic removed for brevity, assuming seeded DB or create on fly if really needed)
    // For this script, we assume DB is seeded with canonicals.

    return { locations, statuses, jobTypes, findLoc, findStat, findJob };
}

// Import a single row
async function importRow(row: SheetRow, configs: Awaited<ReturnType<typeof getConfigMap>>) {
    const { findLoc, findStat, findJob } = configs;

    // 1. Status Mapping
    const normalizedStatus = normalizeStatus(row.durum) as StatusValue;
    const statusId = findStat(normalizedStatus);

    if (!statusId) {
        console.warn(`  ⚠️ Status not found in DB: ${normalizedStatus} (original: ${row.durum}). Skipping row.`);
        return;
    }

    // 2. Location Mapping
    const isYat = isYatmarin(row.adres, row.yer);
    const locationKey = isYat ? 'YATMARIN' : 'DIS_SERVIS';
    const locationId = findLoc(locationKey) || findLoc('DIS_SERVIS'); // Fallback

    if (!locationId) {
        console.warn(`  ⚠️ Location not found in DB: ${locationKey}. Skipping row.`);
        return;
    }

    // 3. Job Type (Default to GENEL/Paket/Ariza logic? Using simple fallback for now)
    const jobTypeId = findJob('ariza') || findJob('paket') || configs.jobTypes[0]?.id;

    // 4. Boat
    const boat = await findOrCreateBoat(row.tekneAdi);

    // 5. Date
    const scheduledDate = parseDate(row.tarih) || new Date();

    // 6. Closure Logic
    let completedAt = null;
    let customFields: any = {};

    if (isCompletedStatus(normalizedStatus)) {
        // Source implies completion but has no date -> Incomplete Closure
        customFields.incompleteClosure = true;
        // active statuses: closedAt should remain null
    }

    // Generate service code
    const code = await generateServiceCode();

    // Create service
    const service = await prisma.service.create({
        data: {
            code,
            boatId: boat.id,
            boatName: row.tekneAdi,
            locationId,
            statusId,
            jobTypeId: jobTypeId!,
            description: row.servisAciklamasi || 'İçe aktarılan servis',
            address: row.adres,
            contactPerson: row.irtibatKisi,
            contactPhone: row.telefon,
            scheduledDate,
            scheduledTime: row.saat,
            completedAt: null, // Always null as per user request for imported data without explicit date
            customFields: customFields
        }
    });

    console.log(`  📦 Servis: ${code} | ${row.tekneAdi} | ${normalizedStatus} | ${isYat ? 'YAT' : 'DIS'} ${customFields.incompleteClosure ? '[INCOMPLETE_CLOSURE]' : ''}`);
    return service;
}

// Main import function
export async function importFromCSV(csvContent: string) {
    console.log('🚀 Google Sheets import (Sprint 3 Enhanced) başlatılıyor...\n');

    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

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

    const configs = await getConfigMap();
    if (configs.statuses.length === 0) {
        console.error("❌ Veritabanında STATUS konfigürasyonu bulunamadı. Lütfen önce seed çalıştırın.");
        return;
    }

    let imported = 0;
    let skipped = 0;

    // Start from 1 to skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Parse CSV line (handle quoted values)
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        for (const char of line) {
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
            else current += char;
        }
        values.push(current.trim());

        const row: Partial<SheetRow> = {};
        headers.forEach((header, index) => {
            const field = headerMap[header];
            if (field && values[index]) {
                (row as any)[field] = values[index].replace(/^"|"$/g, ''); // Remove surrounding quotes
            }
        });

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
    console.log('Bu script doğrudan çalıştırılamaz.');
    console.log('CSV içeriğini importFromCSV() fonksiyonuna gönderin.');
    // In a real scenario, we might want to read a local file here for testing
    // fs.readFile...
}
