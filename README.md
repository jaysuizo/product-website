# MyStore Single-Store Catalog

Clean single-store homepage built with React + Vite + Tailwind + Firebase.

## What It Is

- One homepage for browsing all products
- No separate shop page
- No checkout/payment flow
- Product quick-view modal with:
  - large image
  - name
  - price
  - size/variant selector
  - optional video
  - Messenger CTA
- Admin page for simple product CRUD

## Simple Product Schema

`products/{productId}`:

- `name` (string, required)
- `slug` (string, required)
- `price` (number|null)
- `sizes` (string[])
- `images` (string[], required, max 5)
- `image` (string, required)
- `video` (string|null)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

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
VITE_ADMIN_ALLOWLIST=admin@example.com
```

## Notes

- When Firestore has no products, demo products are shown automatically so homepage never looks empty.
- Messenger link is centralized via store settings (with env fallback).
- Spark mode enabled: admin uses image/video URL inputs (no Firebase Storage upload required).
- Product media: up to `5` image URLs and optional `1` video URL.
- Store logo uses URL input in admin settings.
