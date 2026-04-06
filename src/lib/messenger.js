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

function getProductSlug(product) {
  return String(product?.slug || product?.id || "").trim();
}

export function getProductPublicLink(product) {
  const slug = getProductSlug(product);
  if (!slug) {
    return "";
  }

  if (typeof window === "undefined" || !window.location?.origin) {
    return "";
  }

  return `${window.location.origin}/?product=${encodeURIComponent(slug)}`;
}

export function getProductInquiryText(product) {
  const productName = String(product?.name || "").trim();
  const productLink = getProductPublicLink(product);

  const lines = [];
  if (productName) lines.push(`Product: ${productName}`);
  if (productLink) lines.push(`Link: ${productLink}`);

  return lines.join("\n").trim();
}

export function getProductMessengerLink(product, baseUrl) {
  const messengerUrl = getMessengerLink(baseUrl);
  const inquiryText = getProductInquiryText(product);

  if (!inquiryText) {
    return messengerUrl;
  }

  try {
    const url = new URL(messengerUrl);
    url.searchParams.set("text", inquiryText);
    return url.toString();
  } catch {
    return messengerUrl;
  }
}
