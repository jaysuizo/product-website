export function formatCurrency(value) {
  const amount = Number(value || 0);
  const safe = Number.isFinite(amount) && amount >= 0 ? amount : 0;

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2
  }).format(safe);
}

export function formatTimestamp(value) {
  if (!value) {
    return "just now";
  }

  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function toSlug(input) {
  const base = String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return base || `product-${Date.now()}`;
}

export function sumStock(inventory) {
  if (!Array.isArray(inventory)) {
    return 0;
  }

  return inventory.reduce((total, row) => {
    const amount = Number(row?.stock || 0);
    return total + (Number.isFinite(amount) ? Math.max(0, amount) : 0);
  }, 0);
}

export function bytesToMbText(bytes) {
  const value = Number(bytes || 0);
  if (!Number.isFinite(value) || value <= 0) {
    return "0 MB";
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}
