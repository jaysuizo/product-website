export const SITE_CONFIG = {
  brandName: "MyStore",
  brandTagline: "Premium Product Showcase",
  messengerUrl: import.meta.env.VITE_MESSENGER_URL || "https://m.me/YOUR_USERNAME",
  supportLabel: "Message on Messenger"
};

export const CATEGORY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "fashion", label: "Fashion" },
  { id: "beauty", label: "Beauty" },
  { id: "gadgets", label: "Gadgets" },
  { id: "home", label: "Home" },
  { id: "sports", label: "Sports" }
];

export const MAX_PRODUCT_MEDIA_BYTES = 20 * 1024 * 1024;
