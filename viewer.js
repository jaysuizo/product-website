import {
  collection,
  onSnapshot,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, missingFirebaseConfigKeys } from "./firebase-client.js";

const CATEGORY_CONFIG = [
  { id: "all", label: "All" },
  { id: "fashion", label: "Fashion" },
  { id: "beauty", label: "Beauty" },
  { id: "gadgets", label: "Gadgets" },
  { id: "home", label: "Home" },
  { id: "sports", label: "Sports" }
];
const ALLOWED_CATEGORY_IDS = new Set(CATEGORY_CONFIG.map((item) => item.id));
const CART_STORAGE_KEY = "shopee_hub_cart_v2";

const searchInput = document.querySelector("#search-input");
const categoryTabs = document.querySelector("#category-tabs");
const productList = document.querySelector("#product-list");
const productEmpty = document.querySelector("#product-empty");
const productCount = document.querySelector("#product-count");
const productLoading = document.querySelector("#product-loading");

const flashProductList = document.querySelector("#flash-product-list");
const flashEmpty = document.querySelector("#flash-empty");
const showFlashDealsBtn = document.querySelector("#show-flash-deals");

const cartList = document.querySelector("#cart-list");
const cartEmpty = document.querySelector("#cart-empty");
const cartCount = document.querySelector("#cart-count");
const navCartCount = document.querySelector("#nav-cart-count");

const cartSubtotal = document.querySelector("#cart-subtotal");
const cartSavings = document.querySelector("#cart-savings");
const cartTotal = document.querySelector("#cart-total");
const summaryItems = document.querySelector("#summary-items");
const summaryTotal = document.querySelector("#summary-total");

const countHours = document.querySelector("#count-hours");
const countMinutes = document.querySelector("#count-minutes");
const countSeconds = document.querySelector("#count-seconds");

const firebaseWarning = document.querySelector("#firebase-warning");
const year = document.querySelector("#year");

let allProducts = [];
let selectedCategory = "all";
let showFlashDealsOnly = false;
let cartState = loadCartState();
let flashDeadline = getNextMidnight();
let focusedProduct = null;
let focusedMediaIndex = 0;

const focusModal = buildFocusModal();

if (year) {
  year.textContent = new Date().getFullYear();
}

setupEvents();
if (hasCountdown()) {
  startFlashCountdown();
}

renderCategoryTabs();
renderCatalogProducts();
renderFlashProducts();
renderCart();

if (missingFirebaseConfigKeys.length > 0) {
  showFirebaseWarning(
    `Missing Firebase config values: ${missingFirebaseConfigKeys.join(", ")}. Update firebase-config.js first.`
  );
  if (productLoading) {
    productLoading.hidden = true;
  }
} else {
  const productsQuery = query(collection(db, "products"), orderBy("updatedAt", "desc"));

  onSnapshot(
    productsQuery,
    (snapshot) => {
      allProducts = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));

      if (productLoading) {
        productLoading.hidden = true;
      }

      renderCategoryTabs();
      renderCatalogProducts();
      renderFlashProducts();
      renderCart();
    },
    (error) => {
      if (productLoading) {
        productLoading.hidden = true;
      }
      showFirebaseWarning(getFriendlyError(error));
    }
  );
}

function setupEvents() {
  searchInput?.addEventListener("input", () => {
    renderCatalogProducts();
  });

  showFlashDealsBtn?.addEventListener("click", () => {
    showFlashDealsOnly = !showFlashDealsOnly;
    showFlashDealsBtn.textContent = showFlashDealsOnly
      ? "Show All Products"
      : "Show Flash Deals";
    renderCatalogProducts();
  });
}

function renderCategoryTabs() {
  if (!categoryTabs) {
    return;
  }

  const counts = getCategoryCounts(allProducts);
  categoryTabs.replaceChildren();

  CATEGORY_CONFIG.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-tab";

    const count = counts.get(category.id) || 0;
    button.textContent = `${category.label} (${count})`;

    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(selectedCategory === category.id));

    if (selectedCategory === category.id) {
      button.classList.add("is-active");
    }

    button.addEventListener("click", () => {
      selectedCategory = category.id;
      renderCategoryTabs();
      renderCatalogProducts();
    });

    categoryTabs.append(button);
  });
}

function renderCatalogProducts() {
  if (!productList) {
    return;
  }

  const keyword = String(searchInput?.value || "").trim().toLowerCase();
  const results = getFilteredProducts(keyword);

  const limitRaw = productList.dataset.limit;
  const limit = Number.parseInt(String(limitRaw || "0"), 10);
  const productsToRender = Number.isFinite(limit) && limit > 0 ? results.slice(0, limit) : results;

  if (productCount) {
    productCount.textContent = String(results.length);
  }

  if (productsToRender.length === 0) {
    productList.replaceChildren();
    if (productEmpty) {
      productEmpty.hidden = false;
    }
    return;
  }

  if (productEmpty) {
    productEmpty.hidden = true;
  }

  const cards = productsToRender.map((product) => createProductCard(product, false));
  productList.replaceChildren(...cards);
}

function renderFlashProducts() {
  if (!flashProductList) {
    return;
  }

  const keyword = String(searchInput?.value || "").trim().toLowerCase();
  const flashProducts = getFilteredProducts(keyword).filter((product) => Boolean(product.flashSale));

  const fallback = allProducts.slice(0, 6);
  const source = flashProducts.length > 0 ? flashProducts : fallback;
  const cards = source.slice(0, 8).map((product) => createProductCard(product, true));

  if (cards.length === 0) {
    flashProductList.replaceChildren();
    if (flashEmpty) {
      flashEmpty.hidden = false;
    }
    return;
  }

  if (flashEmpty) {
    flashEmpty.hidden = true;
  }

  flashProductList.replaceChildren(...cards);
}

function getFilteredProducts(keyword) {
  return allProducts.filter((product) => {
    const category = inferCategory(product);

    if (selectedCategory !== "all" && category !== selectedCategory) {
      return false;
    }

    if (showFlashDealsOnly && !product.flashSale) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const textBlob = [
      product.name,
      product.description,
      category,
      ...(Array.isArray(product.sizes) ? product.sizes.map((entry) => entry.size) : [])
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return textBlob.includes(keyword);
  });
}

function createProductCard(product, compact) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Open ${product.name || "product"} details`);

  card.addEventListener("click", () => {
    openProductFocus(product);
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProductFocus(product);
    }
  });

  const mediaBox = document.createElement("div");
  mediaBox.className = "media-box";
  const totalStock = calculateTotalStock(product.sizes || []);
  const inventoryTier = getInventoryTier(totalStock);
  card.classList.add(`inventory-${inventoryTier}`);
  mediaBox.style.setProperty("--media-bg", getProductBackground(product, inventoryTier));

  const firstMedia = getFirstMedia(product);
  if (firstMedia) {
    mediaBox.classList.add("has-media");
    if (firstMedia.type === "video") {
      const video = document.createElement("video");
      video.src = firstMedia.url;
      video.preload = "metadata";
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      mediaBox.append(video);
    } else {
      const image = document.createElement("img");
      image.src = firstMedia.url;
      image.alt = product.name ? `${product.name} image` : "Product image";
      image.loading = "lazy";
      mediaBox.append(image);
    }
  }

  if (product.flashSale) {
    const flashTag = document.createElement("span");
    flashTag.className = "flash-pill";
    flashTag.textContent = "FLASH";
    mediaBox.append(flashTag);
  }

  const body = document.createElement("div");
  body.className = "card-body";

  const title = document.createElement("h4");
  title.textContent = product.name || "Untitled Product";

  const rating = document.createElement("p");
  rating.className = "rating";
  rating.textContent = "★★★★★";

  const priceRow = document.createElement("p");
  priceRow.className = "price-row";

  const currentPrice = document.createElement("span");
  currentPrice.className = "price";
  currentPrice.textContent = formatCurrency(product.price);

  const comparePrice = document.createElement("span");
  comparePrice.className = "old-price";
  comparePrice.textContent = formatCurrency(getComparePrice(product.price));

  priceRow.append(currentPrice, comparePrice);

  const stock = document.createElement("p");
  stock.className = "stock";
  stock.textContent = `${totalStock} in stock`;

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "add-btn";
  addButton.textContent = compact ? "Add" : "Add to Cart";
  addButton.addEventListener("click", (event) => {
    event.stopPropagation();
    addToCart(product.id);
  });

  body.append(title, rating, priceRow, stock, addButton);
  card.append(mediaBox, body);

  return card;
}

function openProductFocus(product) {
  focusedProduct = product;
  focusedMediaIndex = 0;
  renderFocusedProduct();
  focusModal.root.hidden = false;
  document.body.classList.add("modal-open");
  focusModal.closeButton.focus();
}

function closeProductFocus() {
  focusModal.root.hidden = true;
  document.body.classList.remove("modal-open");
  focusedProduct = null;
  focusedMediaIndex = 0;
}

function renderFocusedProduct() {
  if (!focusedProduct) {
    return;
  }

  const mediaItems = getMediaItems(focusedProduct);
  focusModal.category.textContent = capitalize(inferCategory(focusedProduct));
  focusModal.title.textContent = focusedProduct.name || "Untitled Product";
  focusModal.price.textContent = formatCurrency(focusedProduct.price);
  focusModal.compare.textContent = formatCurrency(getComparePrice(focusedProduct.price));
  focusModal.description.textContent = focusedProduct.description || "No description provided.";
  focusModal.stock.textContent = `${calculateTotalStock(focusedProduct.sizes || [])} in stock`;
  focusModal.updated.textContent = `Updated: ${formatTimestamp(
    focusedProduct.updatedAt || focusedProduct.createdAt
  )}`;

  focusModal.sizeList.replaceChildren();
  const sizes = Array.isArray(focusedProduct.sizes) ? focusedProduct.sizes : [];
  if (sizes.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No size data";
    focusModal.sizeList.append(li);
  } else {
    sizes.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${String(entry.size || "N/A")}: ${Number(entry.stock || 0)}`;
      focusModal.sizeList.append(li);
    });
  }

  renderFocusedMedia(mediaItems);
}

function renderFocusedMedia(mediaItems) {
  focusModal.mainMedia.replaceChildren();
  focusModal.thumbs.replaceChildren();

  if (mediaItems.length === 0) {
    const empty = document.createElement("p");
    empty.className = "message";
    empty.textContent = "No media uploaded.";
    focusModal.mainMedia.append(empty);
    return;
  }

  const current = mediaItems[Math.min(focusedMediaIndex, mediaItems.length - 1)];
  appendMediaNode(focusModal.mainMedia, current, true);

  mediaItems.forEach((item, index) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "focus-thumb";
    if (index === focusedMediaIndex) {
      thumb.classList.add("is-active");
    }
    appendMediaNode(thumb, item, false);
    thumb.addEventListener("click", () => {
      focusedMediaIndex = index;
      renderFocusedMedia(mediaItems);
    });
    focusModal.thumbs.append(thumb);
  });
}

function appendMediaNode(container, media, controls) {
  if (media.type === "video") {
    const video = document.createElement("video");
    video.src = media.url;
    video.preload = "metadata";
    video.controls = controls;
    video.muted = !controls;
    video.playsInline = true;
    container.append(video);
    return;
  }

  const image = document.createElement("img");
  image.src = media.url;
  image.alt = "Product media";
  image.loading = "lazy";
  container.append(image);
}

function addToCart(productId) {
  const current = Number(cartState[productId] || 0);
  cartState[productId] = current + 1;
  renderCart();
}

function updateCartQuantity(productId, quantity) {
  const qty = Number(quantity || 0);
  if (qty <= 0) {
    delete cartState[productId];
  } else {
    cartState[productId] = qty;
  }

  renderCart();
}

function renderCart() {
  const productMap = new Map(allProducts.map((product) => [product.id, product]));
  const validEntries = Object.entries(cartState).filter(([id, qty]) => {
    return productMap.has(id) && Number(qty) > 0;
  });

  let itemCount = 0;
  let subtotal = 0;
  let compareSubtotal = 0;

  const cards = validEntries.map(([id, qtyRaw]) => {
    const qty = Number(qtyRaw);
    const product = productMap.get(id);
    const price = sanitizePrice(product.price);
    const compare = getComparePrice(price);

    itemCount += qty;
    subtotal += price * qty;
    compareSubtotal += compare * qty;

    return createCartItemCard(product, qty);
  });

  if (cartList) {
    cartList.replaceChildren(...cards);
  }

  if (cartEmpty) {
    cartEmpty.hidden = cards.length > 0;
  }

  const savings = Math.max(compareSubtotal - subtotal, 0);
  updateCartTotals(itemCount, subtotal, savings);
  saveCartState();
}

function createCartItemCard(product, qty) {
  const card = document.createElement("article");
  card.className = "cart-item";

  const media = document.createElement("div");
  media.className = "cart-item-media";

  const firstMedia = getFirstMedia(product);
  if (firstMedia) {
    if (firstMedia.type === "video") {
      const video = document.createElement("video");
      video.src = firstMedia.url;
      video.preload = "metadata";
      video.muted = true;
      video.loop = true;
      media.append(video);
    } else {
      const image = document.createElement("img");
      image.src = firstMedia.url;
      image.alt = product.name ? `${product.name} image` : "Product image";
      image.loading = "lazy";
      media.append(image);
    }
  }

  const content = document.createElement("div");

  const title = document.createElement("p");
  title.className = "cart-item-title";
  title.textContent = product.name || "Untitled Product";

  const price = document.createElement("p");
  price.className = "cart-item-price";
  price.textContent = formatCurrency(product.price);

  const qtyRow = document.createElement("div");
  qtyRow.className = "qty-row";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "qty-btn";
  minus.textContent = "-";
  minus.addEventListener("click", () => {
    updateCartQuantity(product.id, qty - 1);
  });

  const value = document.createElement("span");
  value.className = "qty-value";
  value.textContent = String(qty);

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "qty-btn";
  plus.textContent = "+";
  plus.addEventListener("click", () => {
    updateCartQuantity(product.id, qty + 1);
  });

  qtyRow.append(minus, value, plus);
  content.append(title, price, qtyRow);

  card.append(media, content);
  return card;
}

function updateCartTotals(items, subtotal, savings) {
  if (cartCount) {
    cartCount.textContent = String(items);
  }
  if (navCartCount) {
    navCartCount.textContent = String(items);
  }
  if (summaryItems) {
    summaryItems.textContent = String(items);
  }

  const subtotalText = formatCurrency(subtotal);
  const savingsText = formatCurrency(savings);

  if (cartSubtotal) {
    cartSubtotal.textContent = subtotalText;
  }
  if (cartSavings) {
    cartSavings.textContent = savingsText;
  }
  if (cartTotal) {
    cartTotal.textContent = subtotalText;
  }
  if (summaryTotal) {
    summaryTotal.textContent = subtotalText;
  }
}

function hasCountdown() {
  return Boolean(countHours && countMinutes && countSeconds);
}

function startFlashCountdown() {
  updateFlashCountdown();
  window.setInterval(updateFlashCountdown, 1000);
}

function updateFlashCountdown() {
  const now = Date.now();
  if (flashDeadline <= now) {
    flashDeadline = getNextMidnight();
  }

  const diff = flashDeadline - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  countHours.textContent = String(hours).padStart(2, "0");
  countMinutes.textContent = String(minutes).padStart(2, "0");
  countSeconds.textContent = String(seconds).padStart(2, "0");
}

function getNextMidnight() {
  const date = new Date();
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

function inferCategory(product) {
  const category = String(product?.category || "").trim().toLowerCase();
  if (ALLOWED_CATEGORY_IDS.has(category) && category !== "all") {
    return category;
  }

  return "home";
}

function getInventoryTier(totalStock) {
  if (totalStock <= 0) {
    return "empty";
  }

  if (totalStock <= 10) {
    return "low";
  }

  if (totalStock <= 30) {
    return "medium";
  }

  return "high";
}

function getProductBackground(product, tier) {
  const category = inferCategory(product);
  const baseByCategory = {
    fashion: ["#e8f2ff", "#d8e8ff"],
    beauty: ["#e9f7ff", "#d6edff"],
    gadgets: ["#dff0ff", "#cbe6ff"],
    home: ["#edf5ff", "#deecff"],
    sports: ["#e3f3ff", "#d3e9ff"]
  };

  const [a, b] = baseByCategory[category] || baseByCategory.home;
  const overlaysByTier = {
    high: "rgba(106, 179, 255, 0.30)",
    medium: "rgba(120, 191, 255, 0.22)",
    low: "rgba(149, 204, 255, 0.16)",
    empty: "rgba(164, 177, 196, 0.18)"
  };

  const overlay = overlaysByTier[tier] || overlaysByTier.medium;

  return `radial-gradient(circle at 22% 18%, ${overlay} 0, transparent 42%), radial-gradient(circle at 78% 74%, rgba(255, 255, 255, 0.58) 0, transparent 40%), linear-gradient(145deg, ${a} 0%, ${b} 100%)`;
}

function getCategoryCounts(products) {
  const counts = new Map();

  CATEGORY_CONFIG.forEach((category) => {
    counts.set(category.id, 0);
  });

  products.forEach((product) => {
    const category = inferCategory(product);
    counts.set(category, (counts.get(category) || 0) + 1);
    counts.set("all", (counts.get("all") || 0) + 1);
  });

  return counts;
}

function getFirstMedia(product) {
  const media = Array.isArray(product?.media)
    ? product.media.find((item) => item && typeof item.url === "string")
    : null;

  return media || null;
}

function getMediaItems(product) {
  if (!Array.isArray(product?.media)) {
    return [];
  }

  return product.media.filter((item) => item && typeof item.url === "string");
}

function calculateTotalStock(sizes) {
  if (!Array.isArray(sizes)) {
    return 0;
  }

  return sizes.reduce((sum, entry) => {
    const value = Number(entry.stock || 0);
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);
}

function sanitizePrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return amount;
}

function getComparePrice(value) {
  const base = sanitizePrice(value);
  return Math.round(base * 1.35 * 100) / 100;
}

function formatTimestamp(value) {
  if (!value || typeof value.toDate !== "function") {
    return "recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value.toDate());
}

function capitalize(value) {
  const text = String(value || "");
  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatCurrency(value) {
  const amount = sanitizePrice(value);
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount);
}

function loadCartState() {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }

    return {};
  } catch (error) {
    console.warn("Unable to load cart state:", error);
    return {};
  }
}

function saveCartState() {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  } catch (error) {
    console.warn("Unable to save cart state:", error);
  }
}

function buildFocusModal() {
  const root = document.createElement("div");
  root.className = "focus-modal";
  root.hidden = true;

  root.innerHTML = `
    <div class="focus-backdrop" data-close="true"></div>
    <section class="focus-dialog" role="dialog" aria-modal="true" aria-labelledby="focus-title">
      <button type="button" class="focus-close">Close</button>
      <div class="focus-layout">
        <div>
          <div class="focus-main-media"></div>
          <div class="focus-thumbs"></div>
        </div>
        <div class="focus-content">
          <p class="focus-category"></p>
          <h3 id="focus-title"></h3>
          <p class="focus-price-row">
            <span class="focus-price"></span>
            <span class="focus-compare"></span>
          </p>
          <p class="focus-description"></p>
          <p class="focus-stock"></p>
          <h4>Sizes</h4>
          <ul class="focus-size-list"></ul>
          <p class="focus-updated"></p>
          <button type="button" class="focus-add-btn">Add To Cart</button>
        </div>
      </div>
    </section>
  `;

  document.body.append(root);

  const closeButton = root.querySelector(".focus-close");
  const mainMedia = root.querySelector(".focus-main-media");
  const thumbs = root.querySelector(".focus-thumbs");
  const category = root.querySelector(".focus-category");
  const title = root.querySelector("#focus-title");
  const price = root.querySelector(".focus-price");
  const compare = root.querySelector(".focus-compare");
  const description = root.querySelector(".focus-description");
  const stock = root.querySelector(".focus-stock");
  const sizeList = root.querySelector(".focus-size-list");
  const updated = root.querySelector(".focus-updated");
  const addButton = root.querySelector(".focus-add-btn");

  closeButton?.addEventListener("click", closeProductFocus);
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLElement && target.dataset.close === "true") {
      closeProductFocus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !root.hidden) {
      closeProductFocus();
    }
  });

  addButton?.addEventListener("click", () => {
    if (!focusedProduct) {
      return;
    }

    addToCart(focusedProduct.id);
  });

  return {
    root,
    closeButton,
    mainMedia,
    thumbs,
    category,
    title,
    price,
    compare,
    description,
    stock,
    sizeList,
    updated
  };
}

function getFriendlyError(error) {
  const code = typeof error?.code === "string" ? error.code : "";

  if (code.includes("network-request-failed")) {
    return "Network issue. Check your connection and try again.";
  }

  if (code.includes("permission-denied")) {
    return "Permission denied. Check your Firebase security rules.";
  }

  if (typeof error?.message === "string" && error.message.length > 0) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function showFirebaseWarning(message) {
  if (!firebaseWarning) {
    return;
  }

  firebaseWarning.hidden = false;
  firebaseWarning.textContent = message;
}
