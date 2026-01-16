
import fs from 'fs';
import path from 'path';
import { importFromCSV } from './import-sheets';

const filePath = process.argv[2];

if (!filePath) {
    console.error('Lütfen bir CSV dosyası yolu belirtin: npx tsx scripts/run-import.ts <dosya-yolu>');
    process.exit(1);
}

try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    importFromCSV(csvContent)
        .then(() => console.log('Import işlemi tamamlandı.'))
        .catch(err => console.error('Import hatası:', err));
} catch (error) {
    console.error(`Dosya okunamadı: ${filePath}`, error);
}
