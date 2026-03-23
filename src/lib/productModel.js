import { toSlug } from "./format";
import { uniqueUrls } from "./media";
import { SITE_CONFIG } from "../config/site";

const CATEGORY_FALLBACK = "home";
const categorySet = new Set(["fashion", "beauty", "gadgets", "home", "sports"]);

function normalizeCategory(input) {
  const value = String(input || "").trim().toLowerCase();
  return categorySet.has(value) ? value : CATEGORY_FALLBACK;
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

function normalizeVariants(source, galleryImages) {
  const variants = Array.isArray(source) ? source : [];
  const cleaned = variants
    .map((variant, index) => ({
      id: String(variant?.id || `variant-${index + 1}`),
      name: String(variant?.name || `Variant ${index + 1}`),
      label: String(variant?.label || variant?.name || `Style ${index + 1}`),
      colorHex: String(variant?.colorHex || "").trim(),
      previewImage: String(variant?.previewImage || "").trim()
    }))
    .filter((variant) => variant.label);

  if (cleaned.length > 0) {
    return cleaned.map((variant) => ({
      ...variant,
      previewImage: variant.previewImage || galleryImages[0] || ""
    }));
  }

  if (galleryImages.length === 0) {
    return [];
  }

  return galleryImages.slice(0, 4).map((image, index) => ({
    id: `variant-${index + 1}`,
    name: `Variant ${index + 1}`,
    label: `Style ${index + 1}`,
    colorHex: "",
    previewImage: image
  }));
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
  const featuredImage = String(raw.featuredImage || galleryImages[0] || "").trim();
  const inventory = normalizeInventory(raw.inventory?.length ? raw.inventory : raw.sizes);
  const slug = toSlug(raw.slug || raw.name || docId);

  return {
    id: docId,
    slug,
    name: String(raw.name || "Untitled Product").trim(),
    shortDescription: String(raw.shortDescription || raw.description || "").trim(),
    fullDescription: String(raw.fullDescription || raw.description || "").trim(),
    category: normalizeCategory(raw.category),
    featuredImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : featuredImage ? [featuredImage] : [],
    variants: normalizeVariants(raw.variants, galleryImages.length > 0 ? galleryImages : featuredImage ? [featuredImage] : []),
    videoUrl: String(raw.videoUrl || mediaVideos[0] || "").trim(),
    messengerLink: String(raw.messengerLink || SITE_CONFIG.messengerUrl).trim(),
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
}

export function buildProductPayload(form, options = {}) {
  const galleryImages = uniqueUrls([form.featuredImage, ...form.galleryImages]);
  const featuredImage = form.featuredImage || galleryImages[0] || "";

  const variants = form.variants
    .map((variant, index) => ({
      id: variant.id || `variant-${index + 1}`,
      name: variant.name || `Variant ${index + 1}`,
      label: variant.label,
      colorHex: variant.colorHex,
      previewImage: variant.previewImage || featuredImage
    }))
    .filter((variant) => variant.label);

  return {
    slug: toSlug(form.slug || form.name || options.fallbackId),
    name: form.name,
    shortDescription: form.shortDescription,
    fullDescription: form.fullDescription,
    description: form.fullDescription,
    category: normalizeCategory(form.category),
    featuredImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : featuredImage ? [featuredImage] : [],
    variants,
    videoUrl: form.videoUrl,
    messengerLink: form.messengerLink || SITE_CONFIG.messengerUrl,
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
    shortDescription: "",
    fullDescription: "",
    featuredImage: "",
    galleryImages: [],
    variants: [
      {
        id: "variant-1",
        name: "Default",
        label: "Default",
        colorHex: "#4d8ef7",
        previewImage: ""
      }
    ],
    videoUrl: "",
    messengerLink: SITE_CONFIG.messengerUrl,
    featured: false,
    price: "",
    inventory: [{ size: "Standard", stock: 0 }],
    media: []
  };
}
