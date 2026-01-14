# ServicePRO - Tekne Teknik Servis Takip Sistemi

<p align="center">
  <img src="public/logo.png" alt="ServicePRO" width="120">
</p>

<p align="center">
  <strong>⚓ Profesyonel Tekne Servis Yönetim Platformu</strong>
</p>

<p align="center">
  <a href="#özellikler">Özellikler</a> •
  <a href="#kurulum">Kurulum</a> •
  <a href="#kullanım">Kullanım</a> •
  <a href="#ekran-görüntüleri">Ekran Görüntüleri</a>
</p>

---

## 🚀 Özellikler

### 📊 Dashboard

- Günlük servis özeti
- Performans metrikleri (Ay En İyileri)
- Hızlı işlem linkleri
- Gerçek zamanlı istatistikler

### 📅 Servis Planlama

- Çoklu filtre (durum, konum, tarih)
- Drag & drop atama
- Toplu işlemler (admin)
- Detaylı servis görünümü

### ⭐ Marlin Yıldızı

- Objektif performans ölçümü
- Aylık değerlendirme sistemi
- Geçmiş & klasman takibi
- Teknisyen teşvik programı

### 📝 Admin CMS (v8.0)

- **Görünüm Ayarları**: Tema, renkler, fontlar
- **İçerik Yönetimi**: Konumlar, durumlar, iş türleri
- **Menü Düzenleme**: Drag & drop sıralama
- **Sistem Ayarları**: Yedekleme, şirket bilgileri

### 🔐 Güvenlik

- Rol tabanlı erişim kontrolü (Admin/Yetkili)
- Login-first uygulama akışı
- Oturum yönetimi

---

## 📦 Teknolojiler

| Teknoloji | Sürüm | Kullanım |
|-----------|-------|----------|
| Next.js | 14.x | Framework |
| React | 18.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Node.js | 18+ | Runtime |

---

## 🛠️ Kurulum

```bash
# Repository'yi klonla
git clone https://github.com/marlinyatcilik/servicepro-v8.git
cd servicepro-v8

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın.

### Varsayılan Giriş Bilgileri

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | <furkan@servicepro.com> | admin123 |

---

## 📁 Klasör Yapısı

```
servicepro/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── ayarlar/           # Ayarlar sayfaları
│   ├── planlama/          # Servis planlama
│   ├── personel/          # Personel yönetimi
│   └── puanlama/          # Marlin Yıldızı
├── components/            # React bileşenleri
│   └── cms/               # CMS bileşenleri
├── data/                  # JSON veri dosyaları
├── lib/                   # Yardımcı fonksiyonlar
├── public/                # Statik dosyalar
└── types/                 # TypeScript tipleri
```

---

## 📊 Veri Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `data/services.json` | Servis kayıtları |
| `data/personnel.json` | Personel listesi |
| `data/users.json` | Kullanıcı hesapları |
| `data/config.json` | Uygulama ayarları |

---

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Commit yapın (`git commit -m 'Yeni özellik eklendi'`)
4. Push yapın (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

---

## 📝 Lisans

Bu proje özel lisans altındadır. Tüm hakları Marlin Yatçılık'a aittir.

---

## 📞 İletişim

**Marlin Yatçılık**  
📍 Yatmarın Marina, Marmaris  
📧 <info@marlinyatcilik.com>

---

<p align="center">
  Made with ❤️ by Marlin Yatçılık
</p>
