// ==================== SERVIS DURUMLARI ====================
export type ServisDurumu =
    | 'RANDEVU_VERILDI'       // Randevu verilen
    | 'DEVAM_EDIYOR'          // Devam eden
    | 'PARCA_BEKLIYOR'        // Parça bekleyen
    | 'MUSTERI_ONAY_BEKLIYOR' // Müşteri onayı bekleyen
    | 'RAPOR_BEKLIYOR'        // Atölyeden rapor bekleyen
    | 'KESIF_KONTROL'         // Keşif-Kontrol
    | 'TAMAMLANDI';           // Tamamen tamamlanan

export const DURUM_CONFIG: Record<ServisDurumu, { label: string; color: string; bgColor: string; icon: string }> = {
    RANDEVU_VERILDI: { label: 'Randevu Verildi', color: '#0891b2', bgColor: '#ecfeff', icon: '📅' },
    DEVAM_EDIYOR: { label: 'Devam Ediyor', color: '#16a34a', bgColor: '#f0fdf4', icon: '🔄' },
    PARCA_BEKLIYOR: { label: 'Parça Bekliyor', color: '#ea580c', bgColor: '#fff7ed', icon: '📦' },
    MUSTERI_ONAY_BEKLIYOR: { label: 'Onay Bekliyor', color: '#ca8a04', bgColor: '#fefce8', icon: '⏳' },
    RAPOR_BEKLIYOR: { label: 'Rapor Bekliyor', color: '#2563eb', bgColor: '#eff6ff', icon: '📝' },
    KESIF_KONTROL: { label: 'Keşif-Kontrol', color: '#9333ea', bgColor: '#faf5ff', icon: '🔍' },
    TAMAMLANDI: { label: 'Tamamlandı', color: '#57534e', bgColor: '#f5f5f4', icon: '✅' },
};

// ==================== KONUM GRUPLARI ====================
export type KonumGrubu = 'YATMARIN' | 'NETSEL' | 'DIS_SERVIS';

export const KONUM_CONFIG: Record<KonumGrubu, { label: string; color: string; icon: string }> = {
    YATMARIN: { label: 'Yatmarin (Merkez)', color: '#0f766e', icon: '🏠' },
    NETSEL: { label: 'Netsel', color: '#1d4ed8', icon: '⚓' },
    DIS_SERVIS: { label: 'Dış Servis', color: '#7c3aed', icon: '🚗' },
};

export function getKonumGrubu(adres: string): KonumGrubu {
    const upper = adres.toUpperCase();
    if (upper.includes('YATMARİN') || upper.includes('YATMARIN')) return 'YATMARIN';
    if (upper.includes('NETSEL')) return 'NETSEL';
    return 'DIS_SERVIS';
}

// ==================== İŞ TİPLERİ ====================
export type IsTuru = 'paket' | 'ariza' | 'proje';

export const IS_TURU_CONFIG: Record<IsTuru, { label: string; carpan: number }> = {
    paket: { label: 'Paket İş (Rutin)', carpan: 1.0 },
    ariza: { label: 'Arıza / Keşif', carpan: 1.2 },
    proje: { label: 'Proje / Refit', carpan: 1.5 },
};

// ==================== PERSONEL ====================
export type PersonelUnvan = 'usta' | 'cirak' | 'yonetici' | 'ofis';

export interface Personnel {
    id: string;
    ad: string;
    rol: 'teknisyen' | 'yetkili';
    unvan: PersonelUnvan;
    aktif: boolean;
    girisYili?: number;
    aylikServisSayisi?: number;
    aylikOrtalamaPuan?: number;
    toplamRozetSayisi?: number;
    altinRozet?: number;
    gumusRozet?: number;
    bronzRozet?: number;
}

export const UNVAN_CONFIG: Record<PersonelUnvan, { label: string; icon: string }> = {
    usta: { label: 'Usta', icon: '👨‍🔧' },
    cirak: { label: 'Çırak', icon: '👷' },
    yonetici: { label: 'Yönetici', icon: '👔' },
    ofis: { label: 'Ofis', icon: '🏢' },
};

// ==================== SERVİS ====================
export interface PersonelAtama {
    personnelId: string;
    personnelAd: string;
    rol: 'sorumlu' | 'destek';
    unvan?: PersonelUnvan;
    bonus?: boolean;
}

export interface ParcaBekleme {
    parcaAdi: string;
    miktar: number;
    tedarikci?: string;
    beklenenTarih?: string;
}

export interface Service {
    id: string;
    tarih: string;
    saat?: string;
    tekneAdi: string;
    adres: string;
    yer: string;
    servisAciklamasi: string;
    irtibatKisi?: string;
    telefon?: string;
    isTuru: IsTuru;
    durum: ServisDurumu;
    atananPersonel: PersonelAtama[];
    ofisYetkilisi?: string;
    bekleyenParcalar?: ParcaBekleme[];
    taseronNotlari?: string;
    kapanisRaporu?: KapanisRaporu;
}

// ==================== KAPANIŞ RAPORU ====================
export interface KapanisRaporu {
    uniteBilgileri: boolean;
    fotograf: boolean;
    tekneKonum: boolean;
    sarfMalzeme: boolean;
    adamSaat: boolean;
    taseronBilgisi: boolean;
    stokMalzeme: boolean;
    aciklama: string;
    raporlayanPersonel: string;
    raporTarihi: string;
}

export const RAPOR_GEREKSINIMLERI: Record<IsTuru, (keyof Omit<KapanisRaporu, 'aciklama' | 'raporlayanPersonel' | 'raporTarihi'>)[]> = {
    paket: ['uniteBilgileri', 'fotograf', 'tekneKonum', 'sarfMalzeme', 'stokMalzeme'],
    ariza: ['uniteBilgileri', 'fotograf', 'tekneKonum', 'sarfMalzeme', 'adamSaat', 'stokMalzeme'],
    proje: ['uniteBilgileri', 'fotograf', 'tekneKonum', 'sarfMalzeme', 'adamSaat', 'taseronBilgisi', 'stokMalzeme'],
};

// ==================== PUANLAMA SİSTEMİ ====================

// Yanıt tipleri
export type YetkiliYanit = 'EVET' | 'KISMEN' | 'HAYIR' | 'ATLA';

export const YANIT_PUANLARI: Record<YetkiliYanit, number | null> = {
    EVET: 100,
    KISMEN: 60,
    HAYIR: 0,
    ATLA: null,
};

// ==================== ROL BAZLI SORU SETLERİ ====================

export interface SoruConfig {
    key: string;
    label: string;
    aciklama: string;
    ustaAgirlik: number;
    cirakAgirlik: number;
}

export const DEGERLENDIRME_SORULARI: SoruConfig[] = [
    {
        key: 'uniformaVeIsg',
        label: 'Üniforma ve İSG Uyumu',
        aciklama: 'KKD kullanımı ve kılık kıyafet düzeni.',
        ustaAgirlik: 10,
        cirakAgirlik: 15
    },
    {
        key: 'musteriIletisimi',
        label: 'Müşteri İletişim Kalitesi',
        aciklama: 'Müşteri ile iletişim ve şikayet durumu.',
        ustaAgirlik: 15,
        cirakAgirlik: 10
    },
    {
        key: 'planlamaKoordinasyon',
        label: 'Planlama ve Koordinasyon',
        aciklama: 'İş planına uyum ve koordinasyon.',
        ustaAgirlik: 20,
        cirakAgirlik: 15
    },
    {
        key: 'teknikTespit',
        label: 'Teknik Tespit Yeteneği',
        aciklama: 'Doğru arıza tespiti ve çözüm önerisi.',
        ustaAgirlik: 25,
        cirakAgirlik: 15
    },
    {
        key: 'raporDokumantasyon',
        label: 'Rapor ve Dokümantasyon',
        aciklama: 'Raporların zamanında ve eksiksiz girilmesi.',
        ustaAgirlik: 15,
        cirakAgirlik: 20
    },
    {
        key: 'genelLiderlik', // Usta için
        label: 'Genel Liderlik / Öğrenme', // Çırak için Öğrenme
        aciklama: 'Liderlik vasıfları veya öğrenme isteği.',
        ustaAgirlik: 15,
        cirakAgirlik: 25
    }
];

export const GENEL_PERFORMANS_SORULARI = {
    key: 'genelSahaPerformansi',
    label: 'Genel Saha Performansı',
    ustaAgirlik: 0, // Dahil edildi
    cirakAgirlik: 0
};


export type PerformansYanit = 'BEKLENTININ_ALTINDA' | 'BEKLENTIYI_KARSILIYOR' | 'BEKLENTININ_UZERINDE' | 'MUKEMMEL';

export const PERFORMANS_PUANLARI: Record<PerformansYanit, number> = {
    BEKLENTININ_ALTINDA: 50,
    BEKLENTIYI_KARSILIYOR: 80,
    BEKLENTININ_UZERINDE: 100,
    MUKEMMEL: 120
};

// Legacy Arrays (Kept for compatibility references if needed, but logic uses master list above)
export const USTA_SORULARI = DEGERLENDIRME_SORULARI;
export const CIRAK_SORULARI = DEGERLENDIRME_SORULARI;

// ==================== İSMAİL ÇOBAN DEĞERLENDİRMESİ ====================

export interface IsmailDegerlendirmesi {
    id: string;
    personnelId: string;
    personnelAd: string;
    ay: string;
    puan: 1 | 2 | 3 | 4 | 5;
    kilitlendi: boolean; // Bir kez kaydedildikten sonra değiştirilemez
    kayitTarihi: string;
}

export const ISMAIL_PUAN_ACIKLAMALARI: Record<1 | 2 | 3 | 4 | 5, { label: string; color: string }> = {
    1: { label: 'Çok Yetersiz', color: '#ef4444' },
    2: { label: 'Geliştirilmeli', color: '#f97316' },
    3: { label: 'Standart', color: '#eab308' },
    4: { label: 'İyi', color: '#22c55e' },
    5: { label: 'Mükemmel', color: '#10b981' },
};

// ==================== YETKİLİ DEĞERLENDİRMESİ ====================

export interface YetkiliDegerlendirmesiUsta {
    personnelId: string;
    personnelAd: string;
    ay: string;
    yetkiliId: string;
    sorular: {
        uniformaVeIsg: YetkiliYanit;
        musteriIletisimi: YetkiliYanit;
        planlamaKoordinasyon: YetkiliYanit;
        teknikTespit: YetkiliYanit;
        raporDokumantasyon: YetkiliYanit;
        genelLiderlik: YetkiliYanit;
    };
    toplamPuan: number;
}

export interface YetkiliDegerlendirmesiCirak {
    personnelId: string;
    personnelAd: string;
    ay: string;
    yetkiliId: string;
    sorular: {
        uniformaVeIsg: YetkiliYanit;
        ekipIciDavranis: YetkiliYanit;
        destekKalitesi: YetkiliYanit;
        ogrenmeGelisim: YetkiliYanit;
    };
    toplamPuan: number;
}

export type YetkiliDegerlendirmesi = YetkiliDegerlendirmesiUsta | YetkiliDegerlendirmesiCirak;

// Bireysel Servis Puanı
export interface ServisPuani {
    id: string;
    serviceId: string;
    personnelId: string;
    personnelAd: string;
    rol: 'sorumlu' | 'destek';
    isTuru: IsTuru;
    raporBasarisi: number;
    hamPuan: number;
    zorlukCarpani: number;
    finalPuan: number;
    bonus: boolean;
    tarih: string;
}

// Aylık Performans
export interface AylikPerformans {
    personnelId: string;
    personnelAd: string;
    ay: string;
    servisSayisi: number;
    bireyselPuanOrtalama: number;
    yetkiliPuanOrtalama: number;
    ismailPuani: number;
    toplamPuan: number;
    siralama: number;
    rozetDurumu?: 'ALTIN' | 'GUMUS' | 'BRONZ';
}

// Yıllık Klasman
export interface YillikKlasman {
    personnelId: string;
    personnelAd: string;
    altinRozet: number;
    gumusRozet: number;
    bronzRozet: number;
    toplamAylikPuan: number;
    siralama: number;
}

// ==================== KULLANICI ====================
export interface AuthUser {
    email: string;
    role: 'admin' | 'yetkili' | 'teknisyen';
    active: boolean;
    ad: string;
}

// ==================== SABİTLER ====================
export const PUAN_AGIRLIKLARI = {
    bireysel: 0.40,
    yetkili: 0.35,
    ismail: 0.25,
};

export const YETKILI_LISTESI = [
    'Furkan Çakır',
    'İsmail Çoban',
    'Senem Kaptan',
    'Diğer',
];

// Tüm personel listesi
export const TUM_PERSONEL: Personnel[] = [
    { id: '1', ad: 'Ali Can Yaylalı', rol: 'teknisyen', unvan: 'cirak', aktif: true },
    { id: '2', ad: 'Alican Yaylalı', rol: 'teknisyen', unvan: 'usta', aktif: true },
    { id: '3', ad: 'Batuhan Çoban', rol: 'teknisyen', unvan: 'cirak', aktif: true },
    { id: '4', ad: 'Cüneyt Yaylalı', rol: 'teknisyen', unvan: 'usta', aktif: true },
    { id: '5', ad: 'Emre Kaya', rol: 'teknisyen', unvan: 'cirak', aktif: true },
    { id: '6', ad: 'Erhan Turhan', rol: 'teknisyen', unvan: 'usta', aktif: true },
    { id: '7', ad: 'Halil İbrahim Duru', rol: 'teknisyen', unvan: 'cirak', aktif: true },
    { id: '8', ad: 'İbrahim Yayalık', rol: 'teknisyen', unvan: 'usta', aktif: true },
    { id: '9', ad: 'İbrahim Yaylalı', rol: 'teknisyen', unvan: 'cirak', aktif: true },
    { id: '10', ad: 'Mehmet Bacak', rol: 'teknisyen', unvan: 'cirak', aktif: false },
    { id: '11', ad: 'Mehmet Güven', rol: 'teknisyen', unvan: 'usta', aktif: true },
    { id: '12', ad: 'Melih Çoban', rol: 'teknisyen', unvan: 'cirak', aktif: true },
    { id: '13', ad: 'Sercan Sarız', rol: 'teknisyen', unvan: 'usta', aktif: true },
    { id: '14', ad: 'Volkan Özkan', rol: 'teknisyen', unvan: 'cirak', aktif: true },
    { id: '15', ad: 'Yusuf Kara', rol: 'teknisyen', unvan: 'cirak', aktif: true },
    { id: '16', ad: 'Ahmet Demir', rol: 'teknisyen', unvan: 'usta', aktif: true },
    { id: '17', ad: 'Mustafa Yıldız', rol: 'teknisyen', unvan: 'cirak', aktif: true },
];
// ==================== LEGACY SCORING (Google Sheets) ====================
export interface ServiceScore {
    id: string;
    serviceId: string;
    personnelId: string;
    musteriMemnuniyeti: 1 | 2 | 3 | 4 | 5;
    raporlamaKalitesi: 1 | 2 | 3 | 4 | 5;
    takimIsBirligi: 1 | 2 | 3 | 4 | 5;
    toplamPuan: number;
    notlar?: string;
    tarih: string;
}
