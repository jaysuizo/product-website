export const SITE_CONFIG = {
  brandName: "MyStore",
  brandTagline: "Simple. Clean. Quality.",
  messengerUrl: "https://m.me/jay.suizo.1999",
  supportLabel: "Message on Messenger"
};

export const DEFAULT_CATEGORIES = [
  { id: "fashion", name: "Fashion", slug: "fashion", image: "" },
  { id: "beauty", name: "Beauty", slug: "beauty", image: "" },
  { id: "gadgets", name: "Gadgets", slug: "gadgets", image: "" },
  { id: "home", name: "Home", slug: "home", image: "" },
  { id: "sports", name: "Sports", slug: "sports", image: "" }
];

export const MAX_PRODUCT_MEDIA_BYTES = 20 * 1024 * 1024;

export const DEFAULT_STORE_SETTINGS = {
  storeName: SITE_CONFIG.brandName,
  storeTagline: SITE_CONFIG.brandTagline,
  storeLogo: "",
  messengerLink: SITE_CONFIG.messengerUrl,
  contactDetails: ""
};
