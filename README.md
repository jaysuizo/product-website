# MyStore Product Showcase (React + Firebase)

Modern, conversion-focused e-commerce showcase inspired by Shopee browsing patterns, redesigned for cleaner UX and premium presentation.

## What This Version Includes

- Modern homepage with hero, featured products, and category overview
- Dedicated shop page with search + category + variant filters
- Product detail page with:
  - image gallery + thumbnails
  - variant selector (color/design)
  - instant variant preview image update
  - responsive product video (YouTube/Vimeo/Storage)
  - Messenger CTA
- Floating Messenger button across all pages
- No cart / no checkout / no payment flow
- Admin portal with Firebase Auth (Email/Password):
  - Sign in / Sign up admin
  - Add / edit / delete products
  - Upload multiple images and video
  - 20 MB total media limit per product (app-level validation)
  - Size + stock inventory input
  - Inventory logs
- Firebase Hosting compatible (Spark plan)
- GitHub Actions workflow for Firebase deploy

## Stack

- React + Vite
- Tailwind CSS
- Firebase Auth, Firestore, Storage
- Firebase Hosting (Spark-safe)

## Project Structure

```text
.
|- src/
|  |- app/App.jsx
|  |- components/
|  |  |- admin/
|  |  |  |- AdminAuthPanel.jsx
|  |  |  |- AdminInventoryLogs.jsx
|  |  |  |- AdminProductForm.jsx
|  |  |  |- AdminProductList.jsx
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

## Product Data Model

Products are normalized to this shape in code:

- `id`
- `slug`
- `name`
- `shortDescription`
- `fullDescription`
- `category`
- `featuredImage`
- `galleryImages[]`
- `variants[]`
  - `id`
  - `name`
  - `label`
  - `colorHex`
  - `previewImage`
- `videoUrl`
- `messengerLink`
- `featured`
- `price` (optional)
- `inventory[]` (`size`, `stock`)
- `media[]` (uploaded image/video references)

Backward compatibility is included for legacy docs using `description`, `sizes`, `flashSale`, and old `media` arrays.

## Firebase Setup (Spark Plan)

1. Open Firebase Console for project `my-store-website-5ec32`.
2. Enable Authentication -> Sign-in method -> Email/Password.
3. Enable Firestore Database.
4. Enable Storage.
5. Deploy rules:

```powershell
firebase deploy --only firestore:rules,storage
```

6. Authorized domains for Auth:
- Add your local/dev domain (`localhost` already default)
- Add your final domain (Firebase Hosting domain and/or custom domain)

## Local Setup

```powershell
npm install
copy .env.example .env.local
npm run dev
```

Then open the local URL shown by Vite (usually `http://localhost:5173`).

## Environment Variables

Use `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_MESSENGER_URL=https://m.me/YOUR_USERNAME
```

`VITE_MESSENGER_URL` is the global Messenger fallback URL.

## Build

```powershell
npm run build
npm run preview
```

## Manual Firebase Hosting Deploy

```powershell
npm run build
firebase deploy --only hosting
```

## Deploy Through GitHub Actions (Firebase Hosting)

Workflow file: `.github/workflows/firebase-hosting.yml`

In GitHub repo -> Settings -> Secrets and variables -> Actions, add:

- `FIREBASE_PROJECT_ID` = `my-store-website-5ec32`
- `FIREBASE_SERVICE_ACCOUNT` = service account JSON content

Create service account JSON with:

```powershell
firebase login
firebase projects:list
firebase init hosting
firebase serviceaccounts:keys:create service-account.json --iam-account <generated-service-account-email>
```

Copy JSON content into `FIREBASE_SERVICE_ACCOUNT` secret.

Every push to `main` will build and deploy.

## How To Update Store Content Later

### Update Messenger link globally

- Edit `VITE_MESSENGER_URL` in `.env.local`.

### Add products

1. Go to `/admin`
2. Sign in or sign up admin
3. Fill product form fields
4. Add variants (label + optional color + preview image)
5. Add size/stock rows
6. Upload images/videos
7. Save

### Make variant preview work correctly

For each variant, set `previewImage` to one of your gallery image URLs (or uploaded image URL).

### Add product video

- Put YouTube/Vimeo URL in `videoUrl`, or
- Upload a video file; first uploaded video can be used as fallback

### Mark featured products

Toggle `Show this as featured product` in admin form.

## Notes

- No checkout/cart/payment flow is included by design.
- Primary conversion action is Messenger inquiry.
- All pages are responsive and mobile-first.
- Media upload limit is enforced to 20 MB total per product in UI and 20 MB per file in Storage rules.
