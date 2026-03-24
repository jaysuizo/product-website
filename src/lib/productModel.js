import { toSlug } from "./format";
import { uniqueUrls } from "./media";
import { DEFAULT_STORE_SETTINGS } from "../config/site";

function normalizeCategory(input) {
  const value = toSlug(input || "uncategorized");
  return value || "uncategorized";
}

function normalizeInventory(source) {
  const list = Array.isArray(source) ? source : [];

  return list
    .map((row) => ({
      size: String(row?.size || "").trim(),
      stock: Math.max(0, Number.parseInt(String(row?.stock || 0), 10) || 0)
    }))
    .filter((row) => row.size);
}

function normalizeVariant(variant, index, galleryImages) {
  const label = String(variant?.label || variant?.name || variant?.value || `Option ${index + 1}`).trim();
  const image = String(variant?.image || variant?.previewImage || galleryImages[0] || "").trim();
  const stock = Math.max(0, Number.parseInt(String(variant?.stock || 0), 10) || 0);

  const rawPriceOverride = Number.parseFloat(String(variant?.priceOverride ?? ""));
  const priceOverride = Number.isFinite(rawPriceOverride) ? rawPriceOverride : null;

  return {
    id: String(variant?.id || `variant-${index + 1}`),
    type: String(variant?.type || "design").trim().toLowerCase() || "design",
    value: String(variant?.value || toSlug(label) || `option-${index + 1}`).trim(),
    label,
    image,
    colorHex: String(variant?.colorHex || "").trim(),
    stock,
    sku: String(variant?.sku || "").trim(),
    priceOverride
  };
}

function normalizeVariants(source, galleryImages) {
  const variants = Array.isArray(source) ? source : [];

  const cleaned = variants
    .map((variant, index) => normalizeVariant(variant, index, galleryImages))
    .filter((variant) => variant.label);

  if (cleaned.length > 0) {
    return cleaned;
  }

  if (galleryImages.length === 0) {
    return [];
  }

  return galleryImages.slice(0, 4).map((image, index) =>
    normalizeVariant(
      {
        id: `variant-${index + 1}`,
        type: "design",
        value: `style-${index + 1}`,
        label: `Style ${index + 1}`,
        image,
        stock: 0
      },
      index,
      galleryImages
    )
  );
}

export function getVariantStock(variant) {
  const amount = Number(variant?.stock || 0);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

export function getProductStock(product) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  if (variants.length > 0) {
    return variants.reduce((total, variant) => total + getVariantStock(variant), 0);
  }

  const inventory = Array.isArray(product?.inventory) ? product.inventory : [];
  return inventory.reduce((total, row) => {
    const amount = Number(row?.stock || 0);
    return total + (Number.isFinite(amount) ? Math.max(0, amount) : 0);
  }, 0);
}

export function getProductAvailability(product) {
  const status = String(product?.status || "active").toLowerCase();
  const totalStock = getProductStock(product);

  if (status === "inactive") {
    return "inactive";
  }

  if (totalStock <= 0) {
    return "out_of_stock";
  }

  if (totalStock <= 5) {
    return "low_stock";
  }

  return "in_stock";
}

export function normalizeProduct(docId, raw = {}) {
  const mediaList = Array.isArray(raw.media) ? raw.media : [];

  const mediaImages = mediaList
    .filter((item) => item && item.type !== "video" && typeof item.url === "string")
    .map((item) => item.url);

  const mediaVideos = mediaList
    .filter((item) => item && item.type === "video" && typeof item.url === "string")
    .map((item) => item.url);

  const galleryImages = uniqueUrls(raw.galleryImages?.length ? raw.galleryImages : mediaImages);
  const featuredImage = String(raw.mainImage || raw.featuredImage || galleryImages[0] || "").trim();
  const inventory = normalizeInventory(raw.inventory?.length ? raw.inventory : raw.sizes);

  const normalized = {
    id: docId,
    slug: toSlug(raw.slug || raw.name || docId),
    name: String(raw.name || "Untitled Product").trim(),
    shortDescription: String(raw.shortDescription || raw.description || "").trim(),
    fullDescription: String(raw.fullDescription || raw.description || "").trim(),
    category: normalizeCategory(raw.category),
    categoryLabel: String(raw.categoryLabel || raw.category || "Uncategorized").trim(),
    brand: String(raw.brand || "").trim(),
    status: String(raw.status || "active").toLowerCase() || "active",
    mainImage: featuredImage,
    featuredImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : featuredImage ? [featuredImage] : [],
    variants: normalizeVariants(raw.variants, galleryImages.length > 0 ? galleryImages : featuredImage ? [featuredImage] : []),
    videoUrl: String(raw.videoUrl || mediaVideos[0] || "").trim(),
    messengerLink: String(raw.messengerLink || DEFAULT_STORE_SETTINGS.messengerLink).trim(),
    featured: Boolean(raw.featured || raw.flashSale),
    price: Number.isFinite(Number(raw.price)) ? Number(raw.price) : null,
    inventory,
    media: mediaList,
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    createdBy: raw.createdBy || "",
    updatedBy: raw.updatedBy || "",
    updatedByEmail: raw.updatedByEmail || ""
  };

  return {
    ...normalized,
    totalStock: getProductStock(normalized),
    availability: getProductAvailability(normalized)
  };
}

export function buildProductPayload(form, options = {}) {
  const galleryImages = uniqueUrls([form.mainImage || form.featuredImage, ...form.galleryImages]);
  const mainImage = String(form.mainImage || form.featuredImage || galleryImages[0] || "").trim();

  const variants = form.variants
    .map((variant, index) => normalizeVariant(variant, index, galleryImages.length > 0 ? galleryImages : [mainImage]))
    .filter((variant) => variant.label);

  return {
    slug: toSlug(form.slug || form.name || options.fallbackId),
    name: String(form.name || "").trim(),
    shortDescription: String(form.shortDescription || "").trim(),
    fullDescription: String(form.fullDescription || "").trim(),
    description: String(form.fullDescription || "").trim(),
    category: normalizeCategory(form.category),
    categoryLabel: String(form.categoryLabel || form.category || "Uncategorized").trim(),
    brand: String(form.brand || "").trim(),
    status: String(form.status || "active").toLowerCase() || "active",
    mainImage,
    featuredImage: mainImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : mainImage ? [mainImage] : [],
    variants,
    videoUrl: String(form.videoUrl || "").trim(),
    messengerLink: String(form.messengerLink || DEFAULT_STORE_SETTINGS.messengerLink).trim(),
    featured: Boolean(form.featured),
    price: form.price,
    inventory: form.inventory,
    sizes: form.inventory,
    media: form.media,
    flashSale: Boolean(form.featured)
  };
}

export function createEmptyProductForm() {
  return {
    id: "",
    name: "",
    slug: "",
    category: "gadgets",
    categoryLabel: "Gadgets",
    brand: "",
    status: "active",
    shortDescription: "",
    fullDescription: "",
    mainImage: "",
    featuredImage: "",
    galleryImages: [],
    variants: [
      {
        id: "variant-1",
        type: "color",
        value: "default",
        label: "Default",
        image: "",
        colorHex: "#4d8ef7",
        stock: 0,
        sku: "",
        priceOverride: ""
      }
    ],
    videoUrl: "",
    messengerLink: DEFAULT_STORE_SETTINGS.messengerLink,
    featured: false,
    price: "",
    inventory: [{ size: "Standard", stock: 0 }],
    media: []
  };
}
