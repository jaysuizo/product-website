<<<<<<< HEAD
# product-website
website
=======
﻿# LiveCatalog (Firebase)

This project now includes a multi-screen Shopee-style storefront.

## Storefront Screens

- `index.html`: Home screen
- `flash-deals.html`: Flash deals screen
- `products.html`: Full product listing screen
- `cart.html`: Cart screen
- `account.html`: Account/login-style screen

## Admin Screen

- `admin.html`: Admin sign up/login + product management

## Data And Logic Files

- `viewer.css`: Shared storefront styling across all screens
- `viewer.js`: Shared storefront logic for products, flash section, filters, and cart
- `styles.css`: Admin page styling
- `admin.js`: Admin CRUD + media upload + inventory logs
- `firebase-config.js`: Firebase web config
- `firebase-client.js`: Shared Firebase initialization
- `firestore.rules`: Firestore security rules
- `storage.rules`: Storage security rules
- `vercel.json`: Route mapping for Vercel clean URLs

## Firebase Setup

1. Enable Auth Email/Password.
2. Enable Firestore.
3. Enable Storage.
4. Fill `firebase-config.js` values.
5. Publish `firestore.rules` and `storage.rules`.

## Local Run

```powershell
python -m http.server 5500
```

Open:

- Home: `http://localhost:5500/`
- Flash: `http://localhost:5500/flash-deals.html`
- Products: `http://localhost:5500/products.html`
- Cart: `http://localhost:5500/cart.html`
- Account: `http://localhost:5500/account.html`
- Admin: `http://localhost:5500/admin.html`

## Vercel Routes

After deploy, open:

- `/`
- `/flash-deals`
- `/products`
- `/cart`
- `/account`
- `/admin`
>>>>>>> b59c43d (djsd)
