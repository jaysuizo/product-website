import { toSlug } from "./format";
import { uniqueUrls } from "./media";

function parsePrice(value) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }

  // Accept free-form symbol input and extract the first valid numeric token.
  const tokenMatch = raw.match(/[+-]?\d[\d,]*(?:\.\d+)?/);
  if (!tokenMatch) {
    return null;
  }

  const normalized = tokenMatch[0].replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseStocks(value) {
  const raw = String(value ?? "").trim();
  const normalized = raw.replace(/[^\d-]/g, "");
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function parseSizeText(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean).join(", ");
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

function parseImageList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeImage(raw = {}) {
  const image = String(raw.image || raw.mainImage || raw.featuredImage || "").trim();
  if (image) {
    return image;
  }

  if (Array.isArray(raw.images) && raw.images.length > 0) {
    return String(raw.images[0] || "").trim();
  }

  if (Array.isArray(raw.galleryImages) && raw.galleryImages.length > 0) {
    return String(raw.galleryImages[0] || "").trim();
  }

  return "";
}

function normalizeGallery(raw = {}, fallbackImage = "") {
  const images = parseImageList(raw.images);
  const galleryImages = parseImageList(raw.galleryImages);
  return uniqueUrls([fallbackImage, ...images, ...galleryImages]);
}

function normalizeStocks(raw = {}) {
  if (Number.isFinite(Number(raw.stocks))) {
    return parseStocks(raw.stocks);
  }

  if (Number.isFinite(Number(raw.totalStock))) {
    return parseStocks(raw.totalStock);
  }

  if (Array.isArray(raw.inventory) && raw.inventory.length > 0) {
    return raw.inventory.reduce((sum, row) => sum + parseStocks(row?.stock), 0);
  }

  if (Array.isArray(raw.variants) && raw.variants.length > 0) {
    return raw.variants.reduce((sum, row) => sum + parseStocks(row?.stock), 0);
  }

  return 0;
}

export function getProductStock(product) {
  return parseStocks(product?.stocks);
}

export function getProductAvailability(product) {
  const stocks = getProductStock(product);
  if (stocks <= 0) {
    return "out_of_stock";
  }
  return "in_stock";
}

export function normalizeProduct(docId, raw = {}) {
  const image = normalizeImage(raw);
  const images = normalizeGallery(raw, image);
  const size = parseSizeText(raw.size || raw.sizes || raw.variants?.map((item) => item?.label));

  const normalized = {
    id: docId,
    slug: toSlug(raw.slug || raw.name || docId),
    name: String(raw.name || "Untitled Product").trim(),
    category: String(raw.category || raw.categoryName || "Uncategorized").trim() || "Uncategorized",
    featured: Boolean(raw.featured),
    price: parsePrice(raw.price),
    stocks: normalizeStocks(raw),
    size: size || "Free Size",
    image,
    images,
    video: String(raw.video || raw.videoUrl || "").trim(),
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null
  };

  return {
    ...normalized,
    videoUrl: normalized.video,
    availability: getProductAvailability(normalized)
  };
}

export function buildProductPayload(form, options = {}) {
  const name = String(form.name || "").trim();
  const slug = toSlug(form.slug || name || options.fallbackId || "product");
  const images = uniqueUrls([
    ...parseImageList(form.images),
    ...parseImageList(form.imageUrlsText)
  ]);
  const coverImage = String(form.image || images[0] || "").trim();

  const payload = {
    name,
    slug,
    category: String(form.category || "").trim() || "General",
    featured: Boolean(form.featured),
    price: parsePrice(form.price),
    stocks: parseStocks(form.stocks),
    size: parseSizeText(form.size),
    image: coverImage,
    images,
    video: String(form.video || "").trim()
  };

  if (form.createdAt) {
    payload.createdAt = form.createdAt;
  }

  return payload;
}

export function createEmptyProductForm() {
  return {
    id: "",
    name: "",
    category: "General",
    featured: false,
    price: "",
    stocks: "",
    size: "",
    imageUrlsText: "",
    images: [],
    image: "",
    video: "",
    slug: "",
    createdAt: null
  };
}
