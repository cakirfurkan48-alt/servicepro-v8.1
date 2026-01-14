import { google } from 'googleapis';
import { Service, Personnel, ServiceScore } from '@/types';

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '';
const SHEETS = {
    PLANLAMA: 'DB_Planlama',
    PERSONEL: 'Personel_Listesi',
    PUANLAMA: 'Puanlama',
    AYLIK_OZET: 'Aylik_Ozet',
    LOGS: 'DB_Logs',
};

// Google Sheets client initialization
async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
}

// ==================== SERVICES ====================

export async function getAllServices(): Promise<Service[]> {
    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.PLANLAMA}!A:M`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // Skip header row

    return rows.slice(1).map((row, index) => ({
        id: row[0] || String(index + 1),
        tarih: row[1] || '',
        saat: row[2] || undefined,
        tekneAdi: row[3] || '',
        adres: row[4] || '',
        yer: row[5] || '',
        servisAciklamasi: row[6] || '',
        irtibatKisi: row[7] || undefined,
        telefon: row[8] || undefined,
        durum: (row[9] as Service['durum']) || 'BEKLEMEDE',
        kapanisDurumu: row[10] || undefined,
        kapanisId: row[11] || undefined,
        kapanisYapan: row[12] || undefined,
    }));
}

export async function getServiceById(id: string): Promise<Service | null> {
    const services = await getAllServices();
    return services.find(s => s.id === id) || null;
}

export async function addService(service: Omit<Service, 'id'>): Promise<string> {
    const sheets = await getGoogleSheetsClient();

    // Generate new ID
    const allServices = await getAllServices();
    const newId = String(Math.max(...allServices.map(s => parseInt(s.id) || 0), 0) + 1);

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.PLANLAMA}!A:M`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                newId,
                service.tarih,
                service.saat || '',
                service.tekneAdi,
                service.adres,
                service.yer,
                service.servisAciklamasi,
                service.irtibatKisi || '',
                service.telefon || '',
                service.durum,
                service.kapanisDurumu || '',
                service.kapanisId || '',
                service.kapanisYapan || '',
            ]],
        },
    });

    return newId;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<boolean> {
    const sheets = await getGoogleSheetsClient();
    const allServices = await getAllServices();

    const serviceIndex = allServices.findIndex(s => s.id === id);
    if (serviceIndex === -1) return false;

    const rowIndex = serviceIndex + 2; // +1 for header, +1 for 1-based index
    const existingService = allServices[serviceIndex];
    const updatedService = { ...existingService, ...updates };

    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.PLANLAMA}!A${rowIndex}:M${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                updatedService.id,
                updatedService.tarih,
                updatedService.saat || '',
                updatedService.tekneAdi,
                updatedService.adres,
                updatedService.yer,
                updatedService.servisAciklamasi,
                updatedService.irtibatKisi || '',
                updatedService.telefon || '',
                updatedService.durum,
                updatedService.kapanisDurumu || '',
                updatedService.kapanisId || '',
                updatedService.kapanisYapan || '',
            ]],
        },
    });

    return true;
}

// ==================== PERSONNEL ====================

export async function getAllPersonnel(): Promise<Personnel[]> {
    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.PERSONEL}!A:A`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return [];

    return rows.slice(1).map((row, index) => ({
        id: String(index + 1),
        ad: row[0] || '',
        aktif: true,
        rol: 'teknisyen' as const,
    }));
}

// ==================== SCORING (Marlin Yıldızı) ====================

export async function addScore(score: Omit<ServiceScore, 'id' | 'toplamPuan'>): Promise<string> {
    const sheets = await getGoogleSheetsClient();

    const toplamPuan = score.musteriMemnuniyeti + score.raporlamaKalitesi + score.takimIsBirligi;
    const newId = `SCR-${Date.now()}`;

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.PUANLAMA}!A:I`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                newId,
                score.serviceId,
                score.personnelId,
                score.musteriMemnuniyeti,
                score.raporlamaKalitesi,
                score.takimIsBirligi,
                toplamPuan,
                score.notlar || '',
                score.tarih,
            ]],
        },
    });

    return newId;
}

export async function getScoresByPersonnel(personnelId: string): Promise<ServiceScore[]> {
    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.PUANLAMA}!A:I`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return [];

    return rows
        .slice(1)
        .filter(row => row[2] === personnelId)
        .map(row => ({
            id: row[0],
            serviceId: row[1],
            personnelId: row[2],
            musteriMemnuniyeti: parseInt(row[3]) as 1 | 2 | 3 | 4 | 5,
            raporlamaKalitesi: parseInt(row[4]) as 1 | 2 | 3 | 4 | 5,
            takimIsBirligi: parseInt(row[5]) as 1 | 2 | 3 | 4 | 5,
            toplamPuan: parseInt(row[6]),
            notlar: row[7] || undefined,
            tarih: row[8],
        }));
}

// ==================== LOGGING ====================

export async function addLog(
    kullanici: string,
    islemTuru: string,
    isId: string,
    detay: string
): Promise<void> {
    const sheets = await getGoogleSheetsClient();

    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEETS.LOGS}!A:E`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                new Date().toISOString(),
                kullanici,
                islemTuru,
                isId,
                detay,
            ]],
        },
    });
}
