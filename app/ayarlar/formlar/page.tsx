'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';

interface FormField {
    id: string;
    fieldKey: string;
    label: string;
    type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DATE' | 'SELECT' | 'CHECKBOX' | 'FILE';
    placeholder?: string;
    helpText?: string;
    required: boolean;
    sortOrder: number;
    active: boolean;
    visibleTo: string[];
}

const FIELD_TYPES = [
    { value: 'TEXT', label: 'Metin', icon: '📝' },
    { value: 'TEXTAREA', label: 'Uzun Metin', icon: '📄' },
    { value: 'NUMBER', label: 'Sayı', icon: '🔢' },
    { value: 'DATE', label: 'Tarih', icon: '📅' },
    { value: 'SELECT', label: 'Seçim', icon: '📋' },
    { value: 'CHECKBOX', label: 'Onay Kutusu', icon: '☑️' },
    { value: 'FILE', label: 'Dosya', icon: '📎' },
];

// Mock data
const MOCK_FIELDS: FormField[] = [
    { id: '1', fieldKey: 'tekneAdi', label: 'Tekne Adı', type: 'TEXT', required: true, sortOrder: 1, active: true, visibleTo: ['ADMIN', 'COORDINATOR'] },
    { id: '2', fieldKey: 'tarih', label: 'Tarih', type: 'DATE', required: true, sortOrder: 2, active: true, visibleTo: ['ADMIN', 'COORDINATOR'] },
    { id: '3', fieldKey: 'aciklama', label: 'Servis Açıklaması', type: 'TEXTAREA', required: true, sortOrder: 3, active: true, visibleTo: ['ADMIN', 'COORDINATOR'], helpText: 'Yapılacak işin detaylı açıklaması' },
    { id: '4', fieldKey: 'adres', label: 'Konum / Adres', type: 'TEXT', required: false, sortOrder: 4, active: true, visibleTo: ['ADMIN', 'COORDINATOR'] },
    { id: '5', fieldKey: 'irtibat', label: 'İrtibat Kişisi', type: 'TEXT', required: false, sortOrder: 5, active: true, visibleTo: ['ADMIN', 'COORDINATOR'] },
    { id: '6', fieldKey: 'telefon', label: 'Telefon', type: 'TEXT', required: false, sortOrder: 6, active: true, visibleTo: ['ADMIN'], placeholder: '+90 5XX XXX XX XX' },
];

export default function FormBuilderPage() {
    const [fields, setFields] = useState<FormField[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingField, setEditingField] = useState<FormField | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        fieldKey: '',
        label: '',
        type: 'TEXT' as FormField['type'],
        placeholder: '',
        helpText: '',
        required: false,
    });

    useEffect(() => {
        setTimeout(() => {
            setFields(MOCK_FIELDS);
            setIsLoading(false);
        }, 300);
    }, []);

    const handleAddNew = () => {
        setEditingField(null);
        setFormData({
            fieldKey: '',
            label: '',
            type: 'TEXT',
            placeholder: '',
            helpText: '',
            required: false,
        });
        setDrawerOpen(true);
    };

    const handleEdit = (field: FormField) => {
        setEditingField(field);
        setFormData({
            fieldKey: field.fieldKey,
            label: field.label,
            type: field.type,
            placeholder: field.placeholder || '',
            helpText: field.helpText || '',
            required: field.required,
        });
        setDrawerOpen(true);
    };

    const handleSave = () => {
        if (editingField) {
            // Update existing
            setFields(prev => prev.map(f =>
                f.id === editingField.id
                    ? { ...f, ...formData }
                    : f
            ));
        } else {
            // Add new
            const newField: FormField = {
                id: `new-${Date.now()}`,
                ...formData,
                sortOrder: fields.length + 1,
                active: true,
                visibleTo: ['ADMIN', 'COORDINATOR'],
            };
            setFields(prev => [...prev, newField]);
        }
        setDrawerOpen(false);
    };

    const handleToggleActive = (id: string) => {
        setFields(prev => prev.map(f =>
            f.id === id ? { ...f, active: !f.active } : f
        ));
    };

    const handleToggleRequired = (id: string) => {
        setFields(prev => prev.map(f =>
            f.id === id ? { ...f, required: !f.required } : f
        ));
    };

    const handleDelete = (id: string) => {
        if (!confirm('Bu alanı silmek istediğinize emin misiniz?')) return;
        setFields(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        📋 Form Builder
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Servis formu alanlarını dinamik olarak yönetin
                    </p>
                </div>
                <Button onClick={handleAddNew}>➕ Yeni Alan Ekle</Button>
            </header>

            {/* Info Card */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                <div className="flex gap-3">
                    <span className="text-xl">ℹ️</span>
                    <div>
                        <h3 className="font-medium text-foreground">Form Alanları</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Burada tanımladığınız alanlar servis oluşturma ve düzenleme formlarında görünür.
                            Zorunlu alanlar kırmızı yıldız ile işaretlenir. Pasif alanlar formlarda gösterilmez.
                        </p>
                    </div>
                </div>
            </div>

            {/* Fields Table */}
            <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-16">Sıra</TableHead>
                            <TableHead>Alan Adı</TableHead>
                            <TableHead>Anahtar</TableHead>
                            <TableHead>Tip</TableHead>
                            <TableHead>Zorunlu</TableHead>
                            <TableHead>Aktif</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <span className="text-muted-foreground">Yükleniyor...</span>
                                </TableCell>
                            </TableRow>
                        ) : fields.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <span className="text-4xl block mb-2">📭</span>
                                    <span className="text-muted-foreground">Henüz alan tanımlanmamış</span>
                                </TableCell>
                            </TableRow>
                        ) : (
                            fields.map((field) => (
                                <TableRow key={field.id} className={!field.active ? 'opacity-50' : ''}>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">{field.sortOrder}</span>
                                    </TableCell>

                                    <TableCell>
                                        <div>
                                            <span className="font-medium">{field.label}</span>
                                            {field.helpText && (
                                                <p className="text-xs text-muted-foreground mt-0.5">{field.helpText}</p>
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                            {field.fieldKey}
                                        </code>
                                    </TableCell>

                                    <TableCell>
                                        <span className="text-sm">
                                            {FIELD_TYPES.find(t => t.value === field.type)?.icon}{' '}
                                            {FIELD_TYPES.find(t => t.value === field.type)?.label}
                                        </span>
                                    </TableCell>

                                    <TableCell>
                                        <button
                                            onClick={() => handleToggleRequired(field.id)}
                                            className={`
                        px-3 py-1 rounded-full text-xs font-medium transition-colors
                        ${field.required
                                                    ? 'bg-red-500/10 text-red-600'
                                                    : 'bg-muted text-muted-foreground'
                                                }
                      `}
                                        >
                                            {field.required ? '* Zorunlu' : 'Opsiyonel'}
                                        </button>
                                    </TableCell>

                                    <TableCell>
                                        <button
                                            onClick={() => handleToggleActive(field.id)}
                                            className={`
                        px-3 py-1 rounded-full text-xs font-medium transition-colors
                        ${field.active
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-muted text-muted-foreground'
                                                }
                      `}
                                        >
                                            {field.active ? '✓ Aktif' : '○ Pasif'}
                                        </button>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => handleEdit(field)}>
                                                ✏️
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(field.id)}>
                                                🗑️
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Add/Edit Drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent side="right" className="w-full max-w-md">
                    <DrawerHeader>
                        <DrawerTitle>
                            {editingField ? '✏️ Alan Düzenle' : '➕ Yeni Alan Ekle'}
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Alan Adı *</label>
                            <Input
                                value={formData.label}
                                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                placeholder="örn: Tekne Adı"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Anahtar (key) *</label>
                            <Input
                                value={formData.fieldKey}
                                onChange={(e) => setFormData(prev => ({ ...prev, fieldKey: e.target.value }))}
                                placeholder="örn: tekneAdi"
                                disabled={!!editingField}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Sistem tarafından kullanılır. Değiştirilemez.
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Alan Tipi *</label>
                            <Select
                                value={formData.type}
                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FormField['type'] }))}
                            >
                                {FIELD_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Placeholder</label>
                            <Input
                                value={formData.placeholder}
                                onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                                placeholder="örn: Tekne adını girin..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Yardım Metni</label>
                            <Input
                                value={formData.helpText}
                                onChange={(e) => setFormData(prev => ({ ...prev, helpText: e.target.value }))}
                                placeholder="Alan hakkında açıklama"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="required"
                                checked={formData.required}
                                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                                className="w-4 h-4 rounded"
                            />
                            <label htmlFor="required" className="text-sm">Zorunlu Alan</label>
                        </div>
                    </div>

                    <DrawerFooter>
                        <Button onClick={handleSave}>
                            {editingField ? '💾 Güncelle' : '➕ Ekle'}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="secondary">İptal</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
