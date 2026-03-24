export const DEMO_CATEGORIES = [
  {
    id: "gadgets",
    name: "Gadgets",
    slug: "gadgets",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "fashion",
    name: "Fashion",
    slug: "fashion",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "beauty",
    name: "Beauty",
    slug: "beauty",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "home",
    name: "Home",
    slug: "home",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "sports",
    name: "Sports",
    slug: "sports",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80"
  }
];

export const DEMO_PRODUCTS_RAW = [
  {
    id: "demo-earbuds",
    slug: "airstream-earbuds-pro",
    name: "AirStream Earbuds Pro",
    shortDescription: "Noise-canceling earbuds with crisp bass and 30-hour battery life.",
    fullDescription:
      "Premium wireless earbuds with adaptive ANC, game mode, and dual-device pairing.\nPerfect for calls, workouts, and daily commute.",
    category: "gadgets",
    categoryLabel: "Gadgets",
    brand: "AirStream",
    status: "active",
    featured: true,
    price: 3290,
    galleryImages: [
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80"
    ],
    videoUrl: "https://www.youtube.com/watch?v=3M5R7c9Qf7o",
    variants: [
      { id: "demo-earbuds-white", type: "color", value: "pearl-white", label: "Pearl White", stock: 14, colorHex: "#f3f5f9" },
      { id: "demo-earbuds-black", type: "color", value: "midnight-black", label: "Midnight Black", stock: 10, colorHex: "#1f2937" },
      { id: "demo-earbuds-blue", type: "color", value: "sky-blue", label: "Sky Blue", stock: 6, colorHex: "#60a5fa" }
    ],
    inventory: [{ size: "Standard", stock: 30 }]
  },
  {
    id: "demo-watch",
    slug: "pulsefit-smartwatch-series-8",
    name: "PulseFit Smartwatch Series 8",
    shortDescription: "AMOLED smartwatch with health tracking and 7-day battery.",
    fullDescription:
      "Track heart rate, sleep, workouts, and notifications on a bright AMOLED display.\nIncludes customizable faces and water resistance for daily wear.",
    category: "gadgets",
    categoryLabel: "Gadgets",
    brand: "PulseFit",
    status: "active",
    featured: true,
    price: 4590,
    galleryImages: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=1200&q=80"
    ],
    variants: [
      { id: "demo-watch-black", type: "design", value: "sport-black", label: "Sport Black", stock: 8, colorHex: "#0f172a" },
      { id: "demo-watch-silver", type: "design", value: "classic-silver", label: "Classic Silver", stock: 4, colorHex: "#cbd5e1" }
    ],
    inventory: [{ size: "42mm", stock: 12 }]
  },
  {
    id: "demo-sneakers",
    slug: "velocity-runner-lite",
    name: "Velocity Runner Lite",
    shortDescription: "Breathable daily sneakers with cloud-foam comfort.",
    fullDescription:
      "Lightweight sneakers designed for all-day wear and daily runs.\nBreathable mesh, flexible outsole, and grip traction for city movement.",
    category: "fashion",
    categoryLabel: "Fashion",
    brand: "Velocity",
    status: "active",
    featured: true,
    price: 2190,
    galleryImages: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465453869711-7e174808ace9?auto=format&fit=crop&w=1200&q=80"
    ],
    variants: [
      { id: "demo-shoes-gray", type: "color", value: "ash-gray", label: "Ash Gray", stock: 11, colorHex: "#94a3b8" },
      { id: "demo-shoes-white", type: "color", value: "ice-white", label: "Ice White", stock: 7, colorHex: "#f8fafc" },
      { id: "demo-shoes-size42", type: "size", value: "42", label: "Size 42", stock: 6 }
    ],
    inventory: [{ size: "42", stock: 6 }, { size: "43", stock: 5 }]
  },
  {
    id: "demo-bag",
    slug: "urbanpack-laptop-backpack",
    name: "UrbanPack Laptop Backpack",
    shortDescription: "Sleek anti-theft backpack with USB charging port.",
    fullDescription:
      "Water-resistant everyday backpack with hidden zippers and padded 15.6-inch laptop sleeve.\nIdeal for school, office, and travel.",
    category: "fashion",
    categoryLabel: "Fashion",
    brand: "UrbanPack",
    status: "active",
    featured: false,
    price: 1690,
    galleryImages: [
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?auto=format&fit=crop&w=1200&q=80"
    ],
    variants: [
      { id: "demo-bag-black", type: "color", value: "jet-black", label: "Jet Black", stock: 9, colorHex: "#111827" },
      { id: "demo-bag-blue", type: "color", value: "ocean-blue", label: "Ocean Blue", stock: 5, colorHex: "#1d4ed8" }
    ],
    inventory: [{ size: "15.6-inch", stock: 14 }]
  },
  {
    id: "demo-skincare",
    slug: "daily-glow-skincare-set",
    name: "Daily Glow Skincare Set",
    shortDescription: "Hydration-focused cleanser, toner, and serum trio.",
    fullDescription:
      "A complete daily skincare routine for brighter and smoother skin.\nGentle formula suitable for most skin types.",
    category: "beauty",
    categoryLabel: "Beauty",
    brand: "GlowLab",
    status: "active",
    featured: false,
    price: 1290,
    galleryImages: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80"
    ],
    variants: [
      { id: "demo-skincare-normal", type: "style", value: "normal", label: "Normal Skin", stock: 10 },
      { id: "demo-skincare-sensitive", type: "style", value: "sensitive", label: "Sensitive Skin", stock: 4 }
    ],
    inventory: [{ size: "3-piece kit", stock: 14 }]
  },
  {
    id: "demo-speaker",
    slug: "echo-boom-portable-speaker",
    name: "EchoBoom Portable Speaker",
    shortDescription: "Compact Bluetooth speaker with deep bass and RGB ring.",
    fullDescription:
      "Party-ready portable speaker with punchy audio, splash protection, and long battery life.\nPairs quickly with phones and tablets.",
    category: "gadgets",
    categoryLabel: "Gadgets",
    brand: "EchoBoom",
    status: "active",
    featured: true,
    price: 2490,
    galleryImages: [
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80"
    ],
    variants: [
      { id: "demo-speaker-blue", type: "color", value: "blue", label: "Neon Blue", stock: 7, colorHex: "#2563eb" },
      { id: "demo-speaker-red", type: "color", value: "red", label: "Flame Red", stock: 3, colorHex: "#dc2626" }
    ],
    inventory: [{ size: "Standard", stock: 10 }]
  },
  {
    id: "demo-pan",
    slug: "chefpro-nonstick-pan-set",
    name: "ChefPro Nonstick Pan Set",
    shortDescription: "3-piece nonstick cookware set for modern kitchens.",
    fullDescription:
      "Durable nonstick coating with ergonomic cool-touch handles.\nDesigned for daily frying, sauteing, and light grilling.",
    category: "home",
    categoryLabel: "Home",
    brand: "ChefPro",
    status: "active",
    featured: false,
    price: 1890,
    galleryImages: [
      "https://images.unsplash.com/photo-1584990347449-a0f43f1f89f9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=80"
    ],
    variants: [
      { id: "demo-pan-3", type: "size", value: "3-piece", label: "3-Piece Set", stock: 8 },
      { id: "demo-pan-5", type: "size", value: "5-piece", label: "5-Piece Set", stock: 2 }
    ],
    inventory: [{ size: "3-piece", stock: 8 }, { size: "5-piece", stock: 2 }]
  },
  {
    id: "demo-dumbbell",
    slug: "powercore-adjustable-dumbbell",
    name: "PowerCore Adjustable Dumbbell",
    shortDescription: "Space-saving dumbbell with quick-lock weight plates.",
    fullDescription:
      "Ideal for home training with smooth adjustment from light to heavy sets.\nStrong grip handle and compact storage base included.",
    category: "sports",
    categoryLabel: "Sports",
    brand: "PowerCore",
    status: "active",
    featured: false,
    price: 3990,
    galleryImages: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571019613576-2b22c76fd955?auto=format&fit=crop&w=1200&q=80"
    ],
    variants: [
      { id: "demo-db-20", type: "size", value: "20kg", label: "20 KG", stock: 4 },
      { id: "demo-db-30", type: "size", value: "30kg", label: "30 KG", stock: 1 }
    ],
    inventory: [{ size: "20kg", stock: 4 }, { size: "30kg", stock: 1 }]
  }
];

