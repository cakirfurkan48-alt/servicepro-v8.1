# ServicePRO React/Next.js Best Practices

> **Kaynak**: Vercel Labs Agent Skills - React Best Practices
> **Adaptasyon**: ServicePRO Enterprise için özelleştirilmiş

---

## 📊 Kural Kategorileri

| Kategori | Etki | Açıklama |
|----------|------|----------|
| **async** | CRITICAL | Waterfall'ları ortadan kaldırma, paralel fetching |
| **bundle** | CRITICAL | Bundle boyutu optimizasyonu, dynamic imports |
| **rendering** | HIGH | İlk render optimizasyonu, hydration |
| **rerender** | MEDIUM | Gereksiz re-render'ları önleme |
| **server** | HIGH | Server-side caching, parallel fetching |
| **client** | MEDIUM | Client-side optimizasyonlar |
| **js** | LOW | JavaScript micro-optimizasyonlar |

---

## 🔴 CRITICAL Kurallar (Mutlaka Uygulanmalı)

### 1. Async Waterfall'ları Ortadan Kaldır

**Problem**: Sıralı await'ler toplam gecikmeyi artırır.

```tsx
// ❌ YANLIŞ - Waterfall
async function Page() {
  const user = await getUser();      // 200ms
  const posts = await getPosts();    // 300ms
  const comments = await getComments(); // 200ms
  // TOPLAM: 700ms
}

// ✅ DOĞRU - Paralel
async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),     // 200ms
    getPosts(),    // 300ms ← En yavaş
    getComments()  // 200ms
  ]);
  // TOPLAM: 300ms
}
```

### 2. Dynamic Imports for Heavy Components

**Problem**: Büyük kütüphaneler (Monaco, Chart.js) ana bundle'ı şişirir.

```tsx
// ❌ YANLIŞ - Statik import (bundle'a dahil)
import { MonacoEditor } from './monaco-editor';

// ✅ DOĞRU - Dynamic import (lazy load)
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(
  () => import('./monaco-editor'),
  { 
    loading: () => <div className="skeleton" />,
    ssr: false 
  }
);
```

**ServicePRO'da uygulanacak yerler**:
- `CalendarView` (FullCalendar kütüphanesi)
- `ChartComponents` (Chart.js/Recharts)
- `IconPicker` (Phosphor icon grid)
- `FormBuilder` (drag-drop builder)

### 3. Strategic Suspense Boundaries

**Problem**: Tüm sayfa veri beklerken bloklama.

```tsx
// ❌ YANLIŞ - Tüm sayfa bekliyor
async function DashboardPage() {
  const data = await fetchData(); // Tüm sayfa bloklanır
  return <Dashboard data={data} />;
}

// ✅ DOĞRU - Suspense ile streaming
import { Suspense } from 'react';

function DashboardPage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      <Suspense fallback={<ServiceListSkeleton />}>
        <ServiceList />
      </Suspense>
    </div>
  );
}
```

### 4. Barrel Import'larından Kaçın

**Problem**: Barrel dosyaları tree-shaking'i engeller.

```tsx
// ❌ YANLIŞ - Barrel import (tüm components yüklenir)
import { Button, Card, Modal } from '@/components';

// ✅ DOĞRU - Direkt import
import Button from '@/components/Button';
import Card from '@/components/Card';
```

---

## 🟡 HIGH Kurallar (Önerilen)

### 5. Use Explicit Conditional Rendering

```tsx
// ❌ YANLIŞ - && ile falsy value render edilebilir
{count && <Badge count={count} />}  // count=0 ise "0" render edilir

// ✅ DOĞRU - Ternary kullan
{count > 0 ? <Badge count={count} /> : null}
```

### 6. Extract to Memoized Components

**Pahalı hesaplamaları erken çıkış ile optimize et:**

```tsx
// ❌ YANLIŞ - Her render'da hesaplama
function Profile({ user, loading }) {
  const avatar = computeAvatar(user); // loading true olsa bile çalışır
  
  if (loading) return <Skeleton />;
  return <div>{avatar}</div>;
}

// ✅ DOĞRU - Erken çıkış
function Profile({ user, loading }) {
  if (loading) return <Skeleton />;
  
  const avatar = computeAvatar(user); // Sadece gerektiğinde
  return <div>{avatar}</div>;
}
```

### 7. Lazy State Initialization

```tsx
// ❌ YANLIŞ - Her render'da hesaplama
const [items, setItems] = useState(expensiveComputation());

// ✅ DOĞRU - Sadece ilk render'da
const [items, setItems] = useState(() => expensiveComputation());
```

### 8. Derived State Hesaplama

```tsx
// ❌ YANLIŞ - Gereksiz state
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  setFilteredItems(items.filter(i => i.active));
}, [items]);

// ✅ DOĞRU - Computed value
const [items, setItems] = useState([]);
const filteredItems = useMemo(
  () => items.filter(i => i.active),
  [items]
);
```

### 9. Server-Side Caching with React Cache

```tsx
import { cache } from 'react';

// ✅ Request boyunca dedupe edilir
const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});

// Aynı request'te birden fazla çağrılsa bile tek sorgu çalışır
async function Page() {
  const user = await getUser(id);
  return <Profile user={user} />;
}

async function Sidebar() {
  const user = await getUser(id); // Cache'den gelir
  return <UserBadge user={user} />;
}
```

---

## 🟢 MEDIUM Kurallar (İyi Pratik)

### 10. Use Transitions for Non-Urgent Updates

```tsx
import { useTransition } from 'react';

function SearchBox() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // Urgent: Input değeri hemen güncellenir
    setQuery(e.target.value);
    
    // Non-urgent: Sonuçlar transition ile güncellenir
    startTransition(() => {
      setSearchResults(filterResults(e.target.value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results />
    </div>
  );
}
```

### 11. Defer Layout Reads

```tsx
// ❌ YANLIŞ - Layout thrashing
function Component() {
  useEffect(() => {
    const height = element.offsetHeight; // Force layout
    element.style.height = height + 10 + 'px'; // Force layout again
  });
}

// ✅ DOĞRU - useLayoutEffect ile batch
import { useLayoutEffect } from 'react';

function Component() {
  useLayoutEffect(() => {
    const height = element.offsetHeight;
    element.style.height = height + 10 + 'px';
  });
}
```

### 12. Content Visibility for Long Lists

```css
/* ❌ YANLIŞ - Tüm liste render edilir */
.list-item {
  /* normal styles */
}

/* ✅ DOĞRU - Viewport dışındakiler skip edilir */
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

### 13. Hoist Static JSX

```tsx
// ❌ YANLIŞ - Her render'da yeni referans
function Component() {
  return (
    <div>
      <StaticHeader />  {/* Her render'da yeni */}
      <DynamicContent />
    </div>
  );
}

// ✅ DOĞRU - Module scope'da tanımla
const staticHeader = <StaticHeader />;

function Component() {
  return (
    <div>
      {staticHeader}  {/* Aynı referans */}
      <DynamicContent />
    </div>
  );
}
```

---

## 🔵 LOW Kurallar (Micro-Optimizasyonlar)

### 14. Early Exit in Functions

```tsx
// ❌ YANLIŞ
function processItems(items) {
  const results = [];
  for (const item of items) {
    if (item.active) {
      results.push(transform(item));
    }
  }
  return results;
}

// ✅ DOĞRU - Early exit
function processItems(items) {
  if (!items?.length) return [];
  return items.filter(i => i.active).map(transform);
}
```

### 15. Use Set/Map for Lookups

```tsx
// ❌ YANLIŞ - O(n) her lookup
const selectedIds = [1, 2, 3, 4, 5];
items.filter(item => selectedIds.includes(item.id));

// ✅ DOĞRU - O(1) lookup
const selectedIds = new Set([1, 2, 3, 4, 5]);
items.filter(item => selectedIds.has(item.id));
```

### 16. Combine Array Iterations

```tsx
// ❌ YANLIŞ - 3 iteration
const active = items.filter(i => i.active);
const sorted = active.sort((a, b) => a.date - b.date);
const mapped = sorted.map(i => i.name);

// ✅ DOĞRU - reduce ile tek iteration
const result = items.reduce((acc, item) => {
  if (item.active) acc.push(item);
  return acc;
}, []).sort((a, b) => a.date - b.date).map(i => i.name);
```

---

## 📋 ServicePRO Uygulama Kontrol Listesi

### Sayfa Bazlı Kontroller

| Sayfa | Async | Bundle | Suspense | Memo |
|-------|-------|--------|----------|------|
| `/dashboard` | ⬜ | ⬜ | ⬜ | ⬜ |
| `/takvim` | ⬜ | ⬜ | ⬜ | ⬜ |
| `/ismail` | ⬜ | ⬜ | ⬜ | ⬜ |
| `/personel` | ⬜ | ⬜ | ⬜ | ⬜ |
| `/ayarlar/*` | ⬜ | ⬜ | ⬜ | ⬜ |

### Component Bazlı Kontroller

| Component | Dynamic Import | Memoization | Skeleton |
|-----------|---------------|-------------|----------|
| `CalendarView` | ⬜ | ⬜ | ⬜ |
| `ServiceTable` | ⬜ | ⬜ | ⬜ |
| `StatCard` | ⬜ | ⬜ | ⬜ |
| `IconPicker` | ⬜ | ⬜ | ⬜ |
| `Charts` | ⬜ | ⬜ | ⬜ |

---

**Bu kurallar UI Overhaul sürecinde tüm sayfalara uygulanacaktır.**
