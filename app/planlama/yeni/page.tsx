'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, IconName } from '@/lib/icons';
import { Service, ServisDurumu, DURUM_CONFIG, IS_TURU_CONFIG, IsTuru, YETKILI_LISTESI } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Mock personnel data (Temporary)
const personnel = [
    { id: '1', ad: 'Ali Can Yaylalı' },
    { id: '2', ad: 'Alican Yaylalı' },
    { id: '3', ad: 'Batuhan Çoban' },
    { id: '4', ad: 'Berkay Yalınkaya' },
    { id: '5', ad: 'Cüneyt Yaylalı' },
    { id: '6', ad: 'Emre Kaya' },
    { id: '7', ad: 'Erhan Turhan' },
    { id: '8', ad: 'Halil İbrahim Duru' },
    { id: '9', ad: 'İbrahim Yayalık' },
    { id: '10', ad: 'İbrahim Yaylalı' },
    { id: '11', ad: 'Mehmet Bacak' },
    { id: '12', ad: 'Mehmet Güven' },
    { id: '13', ad: 'Melih Çoban' },
    { id: '14', ad: 'Muhammed Bacak' },
    { id: '15', ad: 'Ömer Büdan' },
    { id: '16', ad: 'Sercan Sarız' },
    { id: '17', ad: 'Volkan Özkan' },
];

export default function NewServicePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        tarih: new Date().toISOString().split('T')[0],
        saat: '',
        tekneAdi: '',
        adres: '',
        yer: '',
        servisAciklamasi: '',
        irtibatKisi: '',
        telefon: '',
        isTuru: 'paket' as IsTuru,
        durum: 'PLANLANDI-RANDEVU' as ServisDurumu,
        sorumluId: '',
        destekId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Replace with actual API call when backend is ready
            console.log('Form data:', formData);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating delay
            toast.success('Servis oluşturuldu');
            router.push('/planlama');
        } catch (error) {
            console.error(error);
            toast.error('Servis oluşturulurken hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-2xl">✏️</span> Yeni Servis
                    </h1>
                    <p className="text-muted-foreground mt-1">Yeni bir servis kaydı oluşturun</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tarih & Saat */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tarih</label>
                        <Input
                            type="date"
                            value={formData.tarih}
                            onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Saat</label>
                        <Input
                            type="time"
                            value={formData.saat}
                            onChange={(e) => setFormData({ ...formData, saat: e.target.value })}
                        />
                    </div>

                    {/* Tekne */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tekne Adı</label>
                        <Input
                            value={formData.tekneAdi}
                            onChange={(e) => setFormData({ ...formData, tekneAdi: e.target.value })}
                            required
                            placeholder="Örn: S/Y BELLA BLUE"
                        />
                    </div>

                    {/* İş Tipi */}
                    <div className="space-y-2">
                        <label htmlFor="isTuru" className="text-sm font-medium">İş Tipi</label>
                        <select
                            id="isTuru"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.isTuru}
                            onChange={(e) => setFormData({ ...formData, isTuru: e.target.value as IsTuru })}
                            aria-label="İş Tipi Seçimi"
                        >
                            {Object.entries(IS_TURU_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.label} (×{config.carpan})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Konum */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Adres</label>
                        <Input
                            value={formData.adres}
                            onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                            required
                            placeholder="Örn: NETSEL, YATMARİN, BOZBURUN"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Yer (Detay)</label>
                        <Input
                            value={formData.yer}
                            onChange={(e) => setFormData({ ...formData, yer: e.target.value })}
                            placeholder="Örn: L Pontonu, Kara, DSV Marina"
                        />
                    </div>

                    {/* İletişim */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">İrtibat Kişi</label>
                        <Input
                            value={formData.irtibatKisi}
                            onChange={(e) => setFormData({ ...formData, irtibatKisi: e.target.value })}
                            placeholder="Kaptan / Yetkili adı"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefon</label>
                        <Input
                            value={formData.telefon}
                            onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                            placeholder="+90 5XX XXX XX XX"
                        />
                    </div>

                    {/* Personel Atama */}
                    <div className="space-y-2">
                        <label htmlFor="sorumluId" className="text-sm font-medium">Sorumlu Personel <span className="text-muted-foreground font-normal">(Opsiyonel)</span></label>
                        <select
                            id="sorumluId"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.sorumluId}
                            onChange={(e) => setFormData({ ...formData, sorumluId: e.target.value })}
                            aria-label="Sorumlu Personel Seçimi"
                        >
                            <option value="">Sonra atanacak...</option>
                            {personnel.map(p => (
                                <option key={p.id} value={p.id}>{p.ad}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="destekId" className="text-sm font-medium">Destek Personel</label>
                        <select
                            id="destekId"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.destekId}
                            onChange={(e) => setFormData({ ...formData, destekId: e.target.value })}
                            aria-label="Destek Personel Seçimi"
                        >
                            <option value="">Yok</option>
                            {personnel.filter(p => p.id !== formData.sorumluId).map(p => (
                                <option key={p.id} value={p.id}>{p.ad}</option>
                            ))}
                        </select>
                    </div>

                    {/* Durum */}
                    <div className="space-y-2 col-span-full">
                        <label htmlFor="durum" className="text-sm font-medium">Durum</label>
                        <select
                            id="durum"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.durum}
                            onChange={(e) => setFormData({ ...formData, durum: e.target.value as ServisDurumu })}
                            aria-label="Durum Seçimi"
                        >
                            {Object.entries(DURUM_CONFIG).map(([key, config]) => (
                                <option key={key} value={key}>
                                    {config.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Servis Açıklaması */}
                    <div className="space-y-2 col-span-full">
                        <label className="text-sm font-medium">Servis Açıklaması</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                            rows={4}
                            placeholder="Yapılacak işin detaylı açıklaması..."
                            value={formData.servisAciklamasi}
                            onChange={(e) => setFormData({ ...formData, servisAciklamasi: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        İptal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Kaydediliyor...' : '✓ Servisi Oluştur'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
