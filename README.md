# MyStore Dynamic Catalog (React + Tailwind + Firebase)

Production-ready Shopee-inspired catalog system with dynamic products, variant inventory, admin dashboard, and Messenger-first inquiry flow.

## What Was Reused vs Refactored

- Reused: Firebase project wiring, Spark-plan compatible architecture, auth/inventory foundations.
- Refactored: UI system, routing, product model, admin UX, category/settings management, variant-level stock behavior, storefront filtering/sorting.
- Removed: cart/checkout/payment flow.

## Core Features

- Public storefront
  - Home page with hero, featured products, categories
  - Shop page with dynamic products from Firestore
  - Search, category filter, variant filter, availability filter, max-price filter
  - Sorting + load-more pagination
  - Product details by slug with gallery, stock-aware variants, related products, video support
- Admin dashboard
  - Firebase Auth sign in/sign up for admin
  - Product CRUD
  - Category management
  - Store settings management (store name, logo, Messenger link, contact details)
  - Variant inventory management (type/value/label/image/stock/SKU/price override)
  - Media upload (images/videos) with 20MB cap per product
  - Inventory logs
- Messenger integration
  - Floating Messenger button site-wide
  - Messenger CTA on product detail
- No checkout/payment
  - Inquiry flow only

## Stack

- React + Vite
- Tailwind CSS
- Firebase Auth
- Firestore
- Firebase Storage
- Firebase Hosting

All compatible with Firebase Spark Plan.

## Project Structure

```text
.
|- src/
|  |- app/App.jsx
|  |- components/
|  |  |- admin/
|  |  |  |- AdminAuthPanel.jsx
|  |  |  |- AdminCategoryManager.jsx
|  |  |  |- AdminInventoryLogs.jsx
|  |  |  |- AdminProductForm.jsx
|  |  |  |- AdminProductList.jsx
|  |  |  |- AdminStoreSettings.jsx
|  |  |- AppLayout.jsx
|  |  |- CategoryFilterBar.jsx
|  |  |- Footer.jsx
|  |  |- LoadingState.jsx
|  |  |- MessengerFloatButton.jsx
|  |  |- NavigationBar.jsx
|  |  |- ProductCard.jsx
|  |  |- ProductGallery.jsx
|  |  |- ProductGrid.jsx
|  |  |- ProductInquiryButton.jsx
|  |  |- ProductVideo.jsx
|  |  |- SectionHeading.jsx
|  |  |- VariantSelector.jsx
|  |- config/
|  |  |- firebase.js
|  |  |- site.js
|  |- contexts/ProductsContext.jsx
|  |- lib/
|  |  |- adminApi.js
|  |  |- firebaseClient.js
|  |  |- format.js
|  |  |- media.js
|  |  |- productModel.js
|  |- pages/
|  |  |- AdminPage.jsx
|  |  |- HomePage.jsx
|  |  |- NotFoundPage.jsx
|  |  |- ProductPage.jsx
|  |  |- ShopPage.jsx
|  |- index.css
|  |- main.jsx
|- .github/workflows/firebase-hosting.yml
|- firebase.json
|- .firebaserc
|- firestore.rules
|- storage.rules
|- .env.example
|- package.json
```

## Firestore Schema

### `settings/store`
- `storeName`
- `storeTagline`
- `storeLogo`
- `messengerLink`
- `contactDetails`
- `updatedAt`

### `categories/{categorySlug}`
- `name`
- `slug`
- `image`
- `createdAt`
- `updatedAt`

### `products/{productId}`
- `slug`
- `name`
- `shortDescription`
- `fullDescription`
- `category`
- `categoryLabel`
- `brand`
- `price` (optional)
- `featured`
- `status` (`active`/`inactive`)
- `mainImage`
- `galleryImages[]`
- `videoUrl`
- `variants[]`
  - `type` (`color|size|design|style`)
  - `value`
  - `label`
  - `image`
  - `stock`
  - `sku` (optional)
  - `priceOverride` (optional)
  - `colorHex` (optional)
- `inventory[]` (optional extra size-stock rows)
- `media[]` (storage metadata)
- `createdAt`
- `updatedAt`

### `inventoryLogs/{logId}`
- `action`
- `productId`
- `productName`
- `previousStock`
- `currentStock`
- `adminUid`
- `adminEmail`
- `createdAt`

## Firebase Setup (Spark Plan)

1. Enable Authentication -> Email/Password.
2. Enable Firestore.
3. Enable Storage.
4. Deploy rules:

```powershell
firebase deploy --only firestore:rules,storage
```

5. Add authorized domains in Firebase Auth settings (localhost + your live domain).

## Local Run

```powershell
npm.cmd install
copy .env.example .env.local
npm.cmd run dev
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

## Build and Deploy

### Build

```powershell
npm.cmd run build
npm.cmd run preview
```

### Manual Firebase Hosting Deploy

```powershell
npm.cmd run build
npx.cmd firebase deploy --only hosting
```

### GitHub Actions Deploy

Workflow: `.github/workflows/firebase-hosting.yml`

Set GitHub repo secrets:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT`

Then push to `main`.

## Updating Content Later (Non-technical Flow)

1. Open `/admin`.
2. Sign in / sign up admin.
3. Use tabs:
   - `Product Form`: create or update product
   - `Manage Products`: edit/delete
   - `Inventory Logs`: stock history
   - `Categories`: create/delete categories
   - `Store Settings`: update store name/logo/Messenger/contact
4. In product form:
   - fill base fields
   - add variants with stock
   - upload images/video or set URLs
   - save

## Notes

- No checkout/payment is implemented by design.
- Out-of-stock variants are disabled on product page.
- Stock indicators are derived from variant stock first.
- Messenger link is centralized in store settings (with env fallback).
