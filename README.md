# Product Website (Firebase)

This is a multi-page Shopee-style storefront with an admin panel.

## Pages

- `index.html` - Home
- `flash-deals.html` - Flash deals
- `products.html` - Product listing
- `cart.html` - Cart
- `account.html` - Client account screen (visual)
- `admin.html` - Admin login + product/inventory management

## Core Files

- `viewer.js`, `viewer.css` - Storefront logic and styling
- `admin.js`, `styles.css` - Admin logic and styling
- `firebase-config.js`, `firebase-client.js` - Firebase setup
- `firestore.rules`, `storage.rules` - Security rules

## Firebase Setup

1. Enable Authentication (Email/Password).
2. Enable Firestore Database.
3. Enable Storage.
4. Fill `firebase-config.js` with your Web app config.
5. Publish `firestore.rules` and `storage.rules`.

## Run Locally

```powershell
python -m http.server 5500
```

Open:

- `http://localhost:5500/index.html`
- `http://localhost:5500/flash-deals.html`
- `http://localhost:5500/products.html`
- `http://localhost:5500/cart.html`
- `http://localhost:5500/account.html`
- `http://localhost:5500/admin.html`

## Deploy To GitHub Pages

1. Push your code to GitHub repository `main` branch.
2. In GitHub repo: `Settings` -> `Pages`.
3. Under `Build and deployment`:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Save and wait for the published URL.

If your repo is `product-website` under user `jaysuizo`, the site URL is typically:

- `https://jaysuizo.github.io/product-website/`

## Important For Firebase Auth On GitHub Pages

In Firebase Console -> Authentication -> Settings -> Authorized domains,
add your GitHub Pages domain:

- `jaysuizo.github.io`
