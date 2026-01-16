// prisma/seed.ts
// Database seed script for initial data

import { PrismaClient, Role, FieldType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // ═══════════════════════════════════════════════════════════
    // 1. APP CONFIG
    // ═══════════════════════════════════════════════════════════

    await prisma.appConfig.upsert({
        where: { id: 'main' },
        update: {},
        create: {
            id: 'main',
            appName: 'ServicePRO',
            slogan: 'Tekne Teknik Servis Takip Sistemi',
            primaryColor: '#0ea5e9',
            secondaryColor: '#6366f1',
            themeMode: 'dark',
            fontFamily: 'Inter',
            baseFontSize: 16,
            borderRadius: 10,
            sidebarWidth: 260,
        },
    });
    console.log('✅ App config created');

    // ═══════════════════════════════════════════════════════════
    // 2. STATUSES
    // ═══════════════════════════════════════════════════════════

    const statuses = [
        { key: 'RANDEVU_VERILDI', label: 'Randevu Verildi', color: '#6366f1', icon: '📅', sortOrder: 1 },
        { key: 'DEVAM_EDIYOR', label: 'Devam Ediyor', color: '#0ea5e9', icon: '🔧', sortOrder: 2 },
        { key: 'PARCA_BEKLIYOR', label: 'Parça Bekliyor', color: '#f59e0b', icon: '📦', sortOrder: 3 },
        { key: 'MUSTERI_ONAY_BEKLIYOR', label: 'Müşteri Onay Bekliyor', color: '#8b5cf6', icon: '⏳', sortOrder: 4 },
        { key: 'RAPOR_BEKLIYOR', label: 'Rapor Bekliyor', color: '#ec4899', icon: '📝', sortOrder: 5 },
        { key: 'KESIF_KONTROL', label: 'Keşif/Kontrol', color: '#14b8a6', icon: '🔍', sortOrder: 6 },
        { key: 'TAMAMLANDI', label: 'Tamamlandı', color: '#10b981', icon: '✅', sortOrder: 7 },
    ];

    for (const status of statuses) {
        await prisma.configStatus.upsert({
            where: { key: status.key },
            update: status,
            create: status,
        });
    }
    console.log('✅ Statuses created');

    // ═══════════════════════════════════════════════════════════
    // 3. LOCATIONS
    // ═══════════════════════════════════════════════════════════

    const locations = [
        { key: 'YATMARIN', label: 'Yatmarın (Merkez)', color: '#0ea5e9', icon: '⚓', sortOrder: 1 },
        { key: 'NETSEL', label: 'Netsel', color: '#8b5cf6', icon: '🏝️', sortOrder: 2 },
        { key: 'DIS_SERVIS', label: 'Dış Servis', color: '#f59e0b', icon: '🚗', sortOrder: 3 },
    ];

    for (const location of locations) {
        await prisma.configLocation.upsert({
            where: { key: location.key },
            update: location,
            create: location,
        });
    }
    console.log('✅ Locations created');

    // ═══════════════════════════════════════════════════════════
    // 4. JOB TYPES
    // ═══════════════════════════════════════════════════════════

    const jobTypes = [
        { key: 'PAKET', label: 'Paket İş (Rutin)', multiplier: 1.0, sortOrder: 1 },
        { key: 'SAATLIK', label: 'Saatlik İş', multiplier: 1.2, sortOrder: 2 },
        { key: 'ACIL', label: 'Acil Servis', multiplier: 1.5, sortOrder: 3 },
        { key: 'PROJE', label: 'Proje Bazlı', multiplier: 2.0, sortOrder: 4 },
    ];

    for (const jobType of jobTypes) {
        await prisma.configJobType.upsert({
            where: { key: jobType.key },
            update: jobType,
            create: jobType,
        });
    }
    console.log('✅ Job types created');

    // ═══════════════════════════════════════════════════════════
    // 5. PERSONNEL TITLES
    // ═══════════════════════════════════════════════════════════

    const titles = [
        { key: 'USTABASI', label: 'Ustabaşı', level: 3, sortOrder: 1 },
        { key: 'TEKNISYEN', label: 'Teknisyen', level: 2, sortOrder: 2 },
        { key: 'CIRAK', label: 'Çırak', level: 1, sortOrder: 3 },
    ];

    for (const title of titles) {
        await prisma.configPersonnelTitle.upsert({
            where: { key: title.key },
            update: title,
            create: title,
        });
    }
    console.log('✅ Personnel titles created');

    // ═══════════════════════════════════════════════════════════
    // 6. ADMIN USER
    // ═══════════════════════════════════════════════════════════

    const hashedPassword = await bcrypt.hash('admin123', 12);

    await prisma.user.upsert({
        where: { email: 'furkan@servicepro.com' },
        update: {},
        create: {
            email: 'furkan@servicepro.com',
            name: 'Furkan Çakır',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });
    console.log('✅ Admin user created');

    // ═══════════════════════════════════════════════════════════
    // 7. MENU ITEMS
    // ═══════════════════════════════════════════════════════════

    const menuItems = [
        { href: '/', label: 'Dashboard', icon: '📊', sortOrder: 1, adminOnly: false },
        { href: '/planlama', label: 'Servis Planlama', icon: '📅', sortOrder: 2, adminOnly: false },
        { href: '/personel', label: 'Personel Yönetimi', icon: '👥', sortOrder: 3, adminOnly: false },
        { href: '/puanlama', label: 'Marlin Yıldızı', icon: '⭐', sortOrder: 4, adminOnly: false },
        { href: '/puanlama/gecmis', label: 'Geçmiş & Klasman', icon: '🏆', sortOrder: 5, adminOnly: false },
        { href: '/deger', label: 'Aylık Değerlendirme', icon: '📝', sortOrder: 6, adminOnly: false },
        { href: '/raporlar/whatsapp', label: 'WhatsApp Rapor', icon: '📤', sortOrder: 7, adminOnly: false },
        { href: '/ayarlar', label: 'Ayarlar', icon: '⚙️', sortOrder: 8, adminOnly: true },
    ];

    for (const item of menuItems) {
        await prisma.menuItem.upsert({
            where: { id: item.href.replace(/\//g, '_') || 'home' },
            update: item,
            create: {
                id: item.href.replace(/\//g, '_') || 'home',
                ...item,
            },
        });
    }
    console.log('✅ Menu items created');

    // ═══════════════════════════════════════════════════════════
    // 8. SCORING CRITERIA
    // ═══════════════════════════════════════════════════════════

    const scoringCriteria = [
        {
            criteriaKey: 'work_quality',
            category: 'quality',
            label: 'İş Kalitesi',
            description: 'İşin teknik olarak doğru ve kaliteli yapılması',
            maxScore: 5,
            weight: 1.5,
            applicableTo: ['responsible', 'support'],
            requireEvidence: false,
            sortOrder: 1,
        },
        {
            criteriaKey: 'time_efficiency',
            category: 'efficiency',
            label: 'Zaman Verimliliği',
            description: 'İşin makul sürede tamamlanması',
            maxScore: 5,
            weight: 1.0,
            applicableTo: ['responsible'],
            requireEvidence: false,
            sortOrder: 2,
        },
        {
            criteriaKey: 'teamwork',
            category: 'teamwork',
            label: 'Takım Çalışması',
            description: 'Ekip arkadaşlarıyla uyumlu çalışma',
            maxScore: 5,
            weight: 0.8,
            applicableTo: ['responsible', 'support'],
            requireEvidence: false,
            sortOrder: 3,
        },
        {
            criteriaKey: 'safety_compliance',
            category: 'safety',
            label: 'Güvenlik Kuralları',
            description: 'İş güvenliği kurallarına uyum',
            maxScore: 5,
            weight: 1.2,
            applicableTo: ['responsible', 'support'],
            requireEvidence: true,
            evidenceType: 'checklist',
            sortOrder: 4,
        },
        {
            criteriaKey: 'customer_satisfaction',
            category: 'quality',
            label: 'Müşteri Memnuniyeti',
            description: 'Müşteri geri bildirimi',
            maxScore: 5,
            weight: 1.3,
            applicableTo: ['responsible'],
            requireEvidence: true,
            evidenceType: 'note',
            sortOrder: 5,
        },
    ];

    for (const criteria of scoringCriteria) {
        await prisma.scoringCriteria.upsert({
            where: { criteriaKey: criteria.criteriaKey },
            update: criteria,
            create: criteria,
        });
    }
    console.log('✅ Scoring criteria created');

    // ═══════════════════════════════════════════════════════════
    // 9. WORKFLOW TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    const transitions = [
        { fromStatusKey: 'RANDEVU_VERILDI', toStatusKey: 'DEVAM_EDIYOR', allowedRoles: ['ADMIN', 'COORDINATOR'] },
        { fromStatusKey: 'DEVAM_EDIYOR', toStatusKey: 'PARCA_BEKLIYOR', allowedRoles: ['ADMIN', 'COORDINATOR'], requiresParts: true },
        { fromStatusKey: 'DEVAM_EDIYOR', toStatusKey: 'MUSTERI_ONAY_BEKLIYOR', allowedRoles: ['ADMIN', 'COORDINATOR'] },
        { fromStatusKey: 'DEVAM_EDIYOR', toStatusKey: 'RAPOR_BEKLIYOR', allowedRoles: ['ADMIN', 'COORDINATOR'] },
        { fromStatusKey: 'PARCA_BEKLIYOR', toStatusKey: 'DEVAM_EDIYOR', allowedRoles: ['ADMIN', 'COORDINATOR'] },
        { fromStatusKey: 'MUSTERI_ONAY_BEKLIYOR', toStatusKey: 'DEVAM_EDIYOR', allowedRoles: ['ADMIN', 'COORDINATOR'] },
        { fromStatusKey: 'RAPOR_BEKLIYOR', toStatusKey: 'TAMAMLANDI', allowedRoles: ['ADMIN', 'COORDINATOR'], requiresNote: true },
        { fromStatusKey: '*', toStatusKey: 'TAMAMLANDI', allowedRoles: ['ADMIN'] },
    ];

    for (const transition of transitions) {
        const id = `${transition.fromStatusKey}_to_${transition.toStatusKey}`;
        await prisma.workflowTransition.upsert({
            where: { fromStatusKey_toStatusKey: { fromStatusKey: transition.fromStatusKey, toStatusKey: transition.toStatusKey } },
            update: transition,
            create: transition,
        });
    }
    console.log('✅ Workflow transitions created');

    console.log('🎉 Database seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
