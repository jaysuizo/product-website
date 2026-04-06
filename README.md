# MyStore Single-Store Catalog

Clean single-store homepage built with React + Vite + Tailwind + Firebase.

## What It Is

- One homepage for browsing all products
- Home category filter (All + product categories)
- No separate shop page
- No checkout/payment flow
- Product quick-view modal with:
  - large image
  - name
  - price
  - size
  - stocks
  - optional video
  - Messenger CTA
- Admin page for inventory CRUD at `/admin`
- Admin customer photo manager (URL-only) and homepage customer gallery

## Simple Product Schema

`products/{productId}`:

- `name` (string, required)
- `slug` (string, required)
- `category` (string, required)
- `featured` (boolean, required)
- `price` (number|null)
- `stocks` (number, required)
- `size` (string or string[])
- `images` (string[], required, no max limit)
- `image` (string, required)
- `video` (string|null)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

`customerImages/{imageId}`:

- `image` (string URL, required)
- `createdAt` (timestamp, required)

## Local Run

```powershell
npm.cmd install
copy .env.example .env.local
npm.cmd run dev
```

## Build

```powershell
npm.cmd run build
```

## Deploy

```powershell
npx.cmd firebase deploy --only firestore:rules
npm.cmd run build
npx.cmd firebase deploy --only hosting
```

## Env Variables

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_MESSENGER_URL=https://m.me/YOUR_USERNAME
```

## Notes

- When Firestore has no products, demo products are shown automatically so homepage never looks empty.
- Messenger link is centralized via store settings (with env fallback).
- Public navbar does not expose admin entry.
- Admin access is guarded by Firebase Auth + `admins/{uid}` Firestore check.
- Admin is manual-only: create `admins/{uid}` in Firebase Console for approved accounts.
- Spark mode enabled: admin uses image/video URL inputs (no Firebase Storage upload required).
- Store logo uses URL input in admin settings.
- Customer photos are URL-only (no storage upload), unlimited entries.
