# Changelog

All notable changes to ServicePRO will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [8.0.0] - 2026-01-14

### Added

- **WordPress-style Admin CMS**
  - Görünüm Ayarları: Tema renkleri, tipografi, layout
  - İçerik Yönetimi: Konumlar, durumlar, iş türleri, unvanlar
  - Menü Düzenleme: Drag & drop sıralama, hızlı linkler
  - Sistem Ayarları: Yedekleme, şirket bilgileri
- ColorPicker component with preset colors
- Config API with backup/restore functionality
- Comprehensive `config.json` for all settings

### Changed

- Ayarlar page redesigned as modular CMS dashboard
- Version bumped to 8.0

## [7.0.0] - 2026-01-14

### Added

- **Admin Inline Editing System**
  - AdminContext for global admin state
  - EditableText component for inline editing
  - AdminEditBar floating toolbar
  - Labels API for storing editable content
- **Bulk Service Operations**
  - Checkbox selection for services
  - "Tümünü Seç" (Select All) functionality
  - Bulk status change dropdown
  - Bulk delete functionality
- **Login-First Application Flow**
  - Automatic redirect to /login when not authenticated
  - Role-based sidebar navigation
  - User info and logout in sidebar
- Optional personnel assignment in service creation

### Changed

- Layout updated with AdminProvider wrapper
- Sidebar now uses AdminContext for user state
- Delete service API implemented

## [6.0.0] - 2026-01-13

### Added

- User authentication system
- Admin settings panel
- User management (Admin can add/edit users)
- Theme customization (colors, dark mode)
- Role-based access control (Admin vs Yetkili)

### Changed

- Sidebar updated with login state
- Personnel page fetches from API

## [5.0.0] - 2026-01-12

### Added

- Marlin Yıldızı (Star Rating) system
- Monthly evaluation forms
- Performance leaderboards
- Historical performance tracking
- WhatsApp report generation

### Changed

- Dashboard redesigned with "Bu Ay En İyiler" section
- Service types with multipliers

## [4.0.0] - 2026-01-11

### Added

- Service planning page with filters
- Personnel management
- Service completion workflow
- Parts tracking

### Changed

- Complete UI overhaul with dark theme

## [3.0.0] - 2026-01-10

### Added

- Initial Next.js 14 migration
- App Router implementation
- TypeScript support
- New component library

## [2.0.0] - 2026-01-09

### Added

- Basic CRUD operations for services
- Personnel listing
- Simple dashboard

## [1.0.0] - 2026-01-08

### Added

- Initial project setup
- Basic HTML/CSS structure
- Mock data
