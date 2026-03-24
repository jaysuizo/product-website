import { toSlug } from "./format";
import { uniqueUrls } from "./media";

function normalizeTextList(source) {
  if (Array.isArray(source)) {
    return source
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }

        if (item && typeof item === "object") {
          return String(item.label || item.size || item.value || "").trim();
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof source === "string") {
    return source
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parsePrice(value) {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeLegacyVariants(source, fallbackImage) {
  const variants = Array.isArray(source) ? source : [];

  return variants
    .map((variant, index) => {
      const label = String(variant?.label || variant?.name || variant?.value || "").trim();
      if (!label) {
        return null;
      }

      const stock = Math.max(0, Number.parseInt(String(variant?.stock || 0), 10) || 0);
      return {
        id: String(variant?.id || `variant-${index + 1}`),
        type: String(variant?.type || "size").trim().toLowerCase() || "size",
        value: String(variant?.value || toSlug(label) || `option-${index + 1}`).trim(),
        label,
        image: String(variant?.image || variant?.previewImage || fallbackImage || "").trim(),
        colorHex: String(variant?.colorHex || "").trim(),
        stock
      };
    })
    .filter(Boolean);
}

function normalizeSimpleVariants(sizes, fallbackImage, defaultStock) {
  const totalStock = Math.max(0, Number.parseInt(String(defaultStock || 0), 10) || 0);
  const itemCount = sizes.length || 1;
  const baseStock = Math.floor(totalStock / itemCount);
  const remainder = totalStock % itemCount;

  return sizes.map((size, index) => ({
    id: `size-${index + 1}`,
    type: "size",
    value: toSlug(size) || `size-${index + 1}`,
    label: size,
    image: fallbackImage,
    colorHex: "",
    stock: totalStock <= 0 ? 0 : baseStock + (index < remainder ? 1 : 0)
  }));
}

export function getVariantStock(variant) {
  const amount = Number(variant?.stock || 0);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

export function getProductStock(product) {
  const explicitTotal = Number(product?.totalStock);
  if (Number.isFinite(explicitTotal) && explicitTotal >= 0) {
    return explicitTotal;
  }

  const variants = Array.isArray(product?.variants) ? product.variants : [];

  if (variants.length > 0) {
    return variants.reduce((total, variant) => total + getVariantStock(variant), 0);
  }

  const inventory = Array.isArray(product?.inventory) ? product.inventory : [];
  const inventoryStock = inventory.reduce((total, row) => {
    const amount = Number(row?.stock || 0);
    return total + (Number.isFinite(amount) ? Math.max(0, amount) : 0);
  }, 0);

  if (inventoryStock > 0) {
    return inventoryStock;
  }

  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  return sizes.length > 0 ? sizes.length : 0;
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
  const legacyGallery = Array.isArray(raw.galleryImages) ? raw.galleryImages : [];
  const simpleImages = Array.isArray(raw.images) ? raw.images : [];
  const fallbackImage = String(raw.image || raw.mainImage || raw.featuredImage || simpleImages[0] || legacyGallery[0] || "").trim();
  const galleryImages = uniqueUrls([
    ...simpleImages,
    fallbackImage,
    ...legacyGallery
  ]).slice(0, 5);
  const mainImage = String(galleryImages[0] || fallbackImage || "").trim();
  const sizes = normalizeTextList(raw.sizes);
  const legacyVariants = normalizeLegacyVariants(raw.variants, mainImage);

  const computedTotalStock =
    Number.isFinite(Number(raw.totalStock)) && Number(raw.totalStock) >= 0
      ? Number(raw.totalStock)
      : legacyVariants.length > 0
      ? legacyVariants.reduce((sum, variant) => sum + getVariantStock(variant), 0)
      : sizes.length > 0
      ? sizes.length
      : 0;

  const variants =
    legacyVariants.length > 0
      ? legacyVariants
      : normalizeSimpleVariants(sizes, mainImage, computedTotalStock);

  const normalized = {
    id: docId,
    slug: toSlug(raw.slug || raw.name || docId),
    name: String(raw.name || "Untitled Product").trim(),
    price: parsePrice(raw.price),
    sizes,
    images: galleryImages,
    image: mainImage,
    video: String(raw.video || raw.videoUrl || "").trim(),
    status: String(raw.status || "active").toLowerCase() || "active",
    featured: Boolean(raw.featured),
    category: String(raw.category || raw.categoryId || "gadgets").trim() || "gadgets",
    categoryLabel: String(raw.categoryLabel || raw.categoryName || raw.category || raw.categoryId || "Gadgets").trim() || "Gadgets",
    shortDescription: String(raw.shortDescription || "").trim(),
    fullDescription: String(raw.fullDescription || "").trim(),
    mainImage,
    featuredImage: mainImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : mainImage ? [mainImage] : [],
    videoUrl: String(raw.video || raw.videoUrl || "").trim(),
    variants,
    inventory: [],
    totalStock: computedTotalStock,
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null
  };

  return {
    ...normalized,
    categoryId: normalized.category,
    categoryName: normalized.categoryLabel,
    availability: getProductAvailability(normalized)
  };
}

export function buildProductPayload(form, options = {}) {
  const name = String(form.name || "").trim();
  const slug = toSlug(form.slug || name || options.fallbackId || "product");
  const images = uniqueUrls(Array.isArray(form.images) ? form.images : []).slice(0, 5);
  const image = String(images[0] || form.image || form.mainImage || "").trim();
  const sizes = normalizeTextList(form.sizes || form.sizesText);

  const payload = {
    name,
    slug,
    price: parsePrice(form.price),
    featured: Boolean(form.featured),
    sizes,
    images: image ? (images.length ? images : [image]) : [],
    image,
    video: String(form.video || form.videoUrl || "").trim()
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
    price: "",
    featured: false,
    sizesText: "",
    imageUrlsText: "",
    images: [],
    image: "",
    video: "",
    slug: "",
    createdAt: null
  };
}
