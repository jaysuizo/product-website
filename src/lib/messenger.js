import { SITE_CONFIG } from "../config/site";

export function getMessengerLink(baseUrl) {
  const fallback = SITE_CONFIG.messengerUrl;
  const value = String(baseUrl || "").trim();
  if (!value) {
    return fallback;
  }

  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    return fallback;
  }
}

export function getProductMessengerLink(product, baseUrl) {
  const base = getMessengerLink(baseUrl);
  const productName = String(product?.name || "").trim();
  if (!productName) {
    return base;
  }

  try {
    const url = new URL(base);
    const inquiryText = `Hi! I want to inquire about: ${productName}`;
    url.searchParams.set("ref", `product-${productName.toLowerCase().replace(/\s+/g, "-")}`);
    url.searchParams.set("text", inquiryText);
    return url.toString();
  } catch {
    return base;
  }
}
