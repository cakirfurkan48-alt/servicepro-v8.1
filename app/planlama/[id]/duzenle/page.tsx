'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Icon, IconName } from '@/lib/icons';
import { fetchServiceById, updateService } from '@/lib/api';
import { Service, ServisDurumu, DURUM_CONFIG, IS_TURU_CONFIG, IsTuru } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

export default function EditServicePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Service>>({});

    useEffect(() => {
        loadService();
    }, [id]);

    const loadService = async () => {
        try {
            const data = await fetchServiceById(id);
            if (data) {
                setFormData(data);
            } else {
                toast.error('Servis bulunamadı');
                router.push('/planlama');
            }
        } catch (error) {
            console.error(error);
            toast.error('Servis yüklenirken hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateService(id, formData);
            toast.success('Servis güncellendi');
            router.push(`/planlama/${id}`);
        } catch (error) {
            console.error(error);
            toast.error('Güncelleme başarısız');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-2xl">✏️</span> Servis Düzenle
                    </h1>
                    <p className="text-muted-foreground mt-1">{formData.tekneAdi}</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tarih</label>
                        <Input
                            type="date"
                            value={formData.tarih || ''}
                            onChange={e => setFormData({ ...formData, tarih: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Saat</label>
                        <Input
                            type="time"
                            value={formData.saat || ''}
                            onChange={e => setFormData({ ...formData, saat: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tekne Adı</label>
                        <Input
                            value={formData.tekneAdi || ''}
                            onChange={e => setFormData({ ...formData, tekneAdi: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="durum" className="text-sm font-medium">Durum</label>
                        <Select
                            id="durum"
                            value={formData.durum}
                            onChange={e => setFormData({ ...formData, durum: e.target.value as any })}
                            aria-label="Durum Seçimi"
                        >
                            {Object.entries(DURUM_CONFIG).map(([key, conf]) => (
                                <option key={key} value={key}>{conf.label}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-2 col-span-full">
                        <label htmlFor="servisAciklamasi" className="text-sm font-medium">Açıklama</label>
                        <textarea
                            id="servisAciklamasi"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            rows={4}
                            value={formData.servisAciklamasi || ''}
                            onChange={e => setFormData({ ...formData, servisAciklamasi: e.target.value })}
                            aria-label="Servis Açıklaması"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        İptal
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
