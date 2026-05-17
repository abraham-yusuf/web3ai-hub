# AI3 Brand Identity Guidelines

## Brand Core

- **Primary Name:** AI3
- **Descriptor:** AI3 Hub
- **Voice:** Futuristic, practical, and educational for Web3 + AI audience in Indonesia.

## Logo System

- **Primary Logo:** `AI3Logo` component (`src/components/branding/ai3-logo.tsx`)
- **Asset Favicon/Icons:** `public/icons/*`
- **Usage rule:** Keep clear space at least setara tinggi huruf `A` di sekeliling logo.

## Color Palette

Brand palette ditetapkan pada design tokens di `src/app/globals.css`:

- `--primary`: electric purple (brand utama)
- `--secondary`: tech blue (gradient pair)
- `--accent`: warm highlight
- `--brand-gradient`: kombinasi primary + secondary untuk logo/hero accents

## Typography Scale

Reusable scale ada di utility classes:

- `.text-display` untuk hero/headline utama
- `.text-heading` untuk section title
- `.text-body-lg` untuk body copy utama
- `.text-caption` untuk microcopy/caption

Semua typography menggunakan font utama Geist melalui `--font-sans`.

## Icon System

- Source icon terpusat di `src/components/icons/public-icons.tsx`
- Gunakan mapping ini untuk ikon area public agar gaya konsisten.
- Hindari import ikon acak langsung dari route public jika sudah tersedia di icon system.

## App & PWA Icons

- Favicon: `/icons/favicon.svg`
- Apple icon: `/icons/apple-touch-icon.svg`
- PWA icons: `/icons/icon-192.svg`, `/icons/icon-512.svg`, `/icons/icon-maskable.svg`
- Manifest: `src/app/manifest.ts`
