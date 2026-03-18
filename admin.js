import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { auth, db, missingFirebaseConfigKeys, storage } from "./firebase-client.js";

const adminPanel = document.querySelector("#admin-panel");
const adminStatus = document.querySelector("#admin-auth-status");
const adminLoginForm = document.querySelector("#admin-login-form");
const adminEmailInput = document.querySelector("#admin-email");
const adminPasswordInput = document.querySelector("#admin-password");
const adminSignInBtn = document.querySelector("#admin-signin");
const adminSignUpBtn = document.querySelector("#admin-signup");
const adminLogoutBtn = document.querySelector("#admin-logout");
const adminAuthError = document.querySelector("#admin-auth-error");
const adminFirebaseWarning = document.querySelector("#admin-firebase-warning");

const productFormTitle = document.querySelector("#product-form-title");
const productForm = document.querySelector("#product-form");
const productNameInput = document.querySelector("#product-name");
const productCategoryInput = document.querySelector("#product-category");
const productPriceInput = document.querySelector("#product-price");
const productFlashSaleInput = document.querySelector("#product-flash-sale");
const productDescriptionInput = document.querySelector("#product-description");
const productMediaInput = document.querySelector("#product-media");
const sizeRows = document.querySelector("#size-rows");
const addSizeRowBtn = document.querySelector("#add-size-row");
const productSubmitBtn = document.querySelector("#product-submit");
const productCancelBtn = document.querySelector("#product-cancel");
const productFormMessage = document.querySelector("#product-form-message");

const existingMediaWrap = document.querySelector("#existing-media-wrap");
const existingMediaList = document.querySelector("#existing-media-list");

const adminProductLoading = document.querySelector("#admin-product-loading");
const adminProductList = document.querySelector("#admin-product-list");
const adminProductEmpty = document.querySelector("#admin-product-empty");

const inventoryLogList = document.querySelector("#inventory-log-list");
const inventoryLogEmpty = document.querySelector("#inventory-log-empty");

const adminYear = document.querySelector("#admin-year");

let productsUnsubscribe = null;
let logsUnsubscribe = null;
let currentUser = null;
let isCurrentUserAdmin = false;
let editingProduct = null;
let shouldJumpToInventory = false;
const removedMediaKeys = new Set();
const MAX_PRODUCT_MEDIA_BYTES = 20 * 1024 * 1024;
const ALLOWED_CATEGORIES = new Set(["fashion", "beauty", "gadgets", "home", "sports"]);

if (adminYear) {
  adminYear.textContent = new Date().getFullYear();
}

if (missingFirebaseConfigKeys.length > 0) {
  adminFirebaseWarning.hidden = false;
  adminFirebaseWarning.textContent = `Missing Firebase config values: ${missingFirebaseConfigKeys.join(", ")}. Update firebase-config.js first.`;
}

initializeSizeRows();
setupEventHandlers();
watchAuth();
revealElements();

function setupEventHandlers() {
  adminLoginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAuthError();

    if (missingFirebaseConfigKeys.length > 0) {
      setAuthError("Firebase is not configured yet. Update firebase-config.js.");
      return;
    }

    const email = String(adminEmailInput?.value || "").trim();
    const password = String(adminPasswordInput?.value || "");

    if (!email || !password) {
      setAuthError("Enter both email and password.");
      return;
    }

    try {
      shouldJumpToInventory = true;
      await signInWithEmailAndPassword(auth, email, password);
      adminLoginForm.reset();
    } catch (error) {
      shouldJumpToInventory = false;
      setAuthError(getFriendlyError(error));
    }
  });

  adminSignUpBtn?.addEventListener("click", async () => {
    clearAuthError();

    if (missingFirebaseConfigKeys.length > 0) {
      setAuthError("Firebase is not configured yet. Update firebase-config.js.");
      return;
    }

    const email = String(adminEmailInput?.value || "").trim();
    const password = String(adminPasswordInput?.value || "");

    if (!email || !password) {
      setAuthError("Enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    try {
      shouldJumpToInventory = true;
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "admins", credential.user.uid), {
        email,
        role: "admin",
        createdAt: serverTimestamp()
      });

      adminLoginForm.reset();
    } catch (error) {
      shouldJumpToInventory = false;
      setAuthError(getFriendlyError(error));
    }
  });

  adminLogoutBtn?.addEventListener("click", async () => {
    try {
      shouldJumpToInventory = false;
      await signOut(auth);
    } catch (error) {
      setAuthError(getFriendlyError(error));
    }
  });

  addSizeRowBtn?.addEventListener("click", () => {
    sizeRows.append(createSizeRowElement("", 0));
  });

  productForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser || !isCurrentUserAdmin) {
      setFormMessage("Admin account required.", true);
      return;
    }

    try {
      setFormBusy(true);
      setFormMessage(editingProduct ? "Updating product..." : "Creating product...");

      const name = productNameInput.value.trim();
      const category = String(productCategoryInput?.value || "home").trim().toLowerCase();
      const price = Number.parseFloat(String(productPriceInput?.value || "0"));
      const flashSale = Boolean(productFlashSaleInput?.checked);
      const description = productDescriptionInput.value.trim();
      const sizes = collectSizes();

      if (!name) {
        throw new Error("Product name is required.");
      }

      if (!description) {
        throw new Error("Description is required.");
      }

      if (!ALLOWED_CATEGORIES.has(category)) {
        throw new Error("Choose a valid category.");
      }

      if (Number.isNaN(price) || price < 0) {
        throw new Error("Price must be 0 or higher.");
      }

      if (sizes.length === 0) {
        throw new Error("Add at least one size and stock row.");
      }

      const productRef = editingProduct
        ? doc(db, "products", editingProduct.id)
        : doc(collection(db, "products"));

      const existingMedia = Array.isArray(editingProduct?.media)
        ? await normalizeMediaWithSize(
            editingProduct.media.filter((item) => !removedMediaKeys.has(getMediaKey(item)))
          )
        : [];

      const selectedFiles = Array.from(productMediaInput?.files || []);
      const existingMediaBytes = calculateMediaBytes(existingMedia);
      const selectedFilesBytes = calculateSelectedFilesBytes(selectedFiles);

      if (existingMediaBytes + selectedFilesBytes > MAX_PRODUCT_MEDIA_BYTES) {
        throw new Error(
          `Product media exceeds 20 MB limit. Current: ${formatBytes(
            existingMediaBytes + selectedFilesBytes
          )}, allowed: ${formatBytes(MAX_PRODUCT_MEDIA_BYTES)}.`
        );
      }

      const uploadedMedia = await uploadSelectedMedia(productRef.id, selectedFiles);
      const mergedMedia = [...existingMedia, ...uploadedMedia];

      const payload = {
        name,
        category,
        price,
        flashSale,
        description,
        sizes,
        media: mergedMedia,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser.uid,
        updatedByEmail: currentUser.email || ""
      };

      if (!editingProduct) {
        payload.createdAt = serverTimestamp();
        payload.createdBy = currentUser.uid;
        payload.createdByEmail = currentUser.email || "";
      }

      await setDoc(productRef, payload, { merge: true });

      await deleteRemovedMediaFromStorage(editingProduct?.media || []);

      const oldStock = calculateTotalStock(editingProduct?.sizes || []);
      const newStock = calculateTotalStock(sizes);
      const action = editingProduct ? "updated" : "created";

      await createInventoryLog({
        action,
        productId: productRef.id,
        productName: name,
        previousStock: oldStock,
        currentStock: newStock
      });

      resetFormState();
      setFormMessage(`Product ${action} successfully.`);
    } catch (error) {
      setFormMessage(getFriendlyError(error), true);
    } finally {
      setFormBusy(false);
    }
  });

  productCancelBtn?.addEventListener("click", () => {
    resetFormState();
    setFormMessage("Edit canceled.");
  });
}

function watchAuth() {
  onAuthStateChanged(auth, async (user) => {
    clearAuthError();
    clearRealtimeListeners();

    currentUser = user;
    isCurrentUserAdmin = false;

    if (!user) {
      setLoggedOutState();
      return;
    }

    setLoggedInState(user.email || "Unknown user");
    adminStatus.textContent = "Checking admin permissions...";

    try {
      const adminDocRef = doc(db, "admins", user.uid);
      const adminDoc = await getDoc(adminDocRef);
      isCurrentUserAdmin = adminDoc.exists();
    } catch (error) {
      setAuthError(`Unable to check admin permission: ${getFriendlyError(error)}`);
      return;
    }

    if (!isCurrentUserAdmin) {
      adminStatus.textContent = "Signed in, but this account is not an approved admin.";
      setAuthError(
        "Ask the project owner to add your UID to Firestore collection admins/{uid}."
      );
      shouldJumpToInventory = false;
      adminPanel.hidden = true;
      return;
    }

    adminStatus.textContent = `Admin access granted: ${user.email}`;
    adminPanel.hidden = false;
    startRealtimeListeners();

    if (shouldJumpToInventory) {
      jumpToInventory();
      shouldJumpToInventory = false;
    }
  });
}

function startRealtimeListeners() {
  const productsQuery = query(collection(db, "products"), orderBy("updatedAt", "desc"));
  const logsQuery = query(
    collection(db, "inventoryLogs"),
    orderBy("createdAt", "desc"),
    limit(25)
  );

  productsUnsubscribe = onSnapshot(
    productsQuery,
    (snapshot) => {
      adminProductLoading.hidden = true;

      if (snapshot.empty) {
        adminProductList.replaceChildren();
        adminProductEmpty.hidden = false;
        return;
      }

      adminProductEmpty.hidden = true;
      const cards = snapshot.docs.map((docItem) =>
        renderAdminProductCard({ id: docItem.id, ...docItem.data() })
      );
      adminProductList.replaceChildren(...cards);
      revealElements();
    },
    (error) => {
      adminProductLoading.hidden = true;
      setFormMessage(getFriendlyError(error), true);
    }
  );

  logsUnsubscribe = onSnapshot(
    logsQuery,
    (snapshot) => {
      if (snapshot.empty) {
        inventoryLogList.replaceChildren();
        inventoryLogEmpty.hidden = false;
        return;
      }

      inventoryLogEmpty.hidden = true;
      const items = snapshot.docs.map((docItem) => renderInventoryLogItem(docItem.data()));
      inventoryLogList.replaceChildren(...items);
    },
    () => {
      inventoryLogEmpty.hidden = false;
      inventoryLogEmpty.textContent = "Inventory logs cannot be loaded.";
    }
  );
}

function clearRealtimeListeners() {
  if (typeof productsUnsubscribe === "function") {
    productsUnsubscribe();
    productsUnsubscribe = null;
  }

  if (typeof logsUnsubscribe === "function") {
    logsUnsubscribe();
    logsUnsubscribe = null;
  }

  adminProductLoading.hidden = false;
  adminProductList.replaceChildren();
  inventoryLogList.replaceChildren();
}

function renderAdminProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card admin-card";

  const title = document.createElement("h3");
  title.textContent = product.name || "Untitled product";

  const description = document.createElement("p");
  description.textContent = product.description || "No description.";

  const meta = document.createElement("p");
  meta.className = "meta";
  const mediaCount = Array.isArray(product.media) ? product.media.length : 0;
  const category = String(product.category || "home");
  const priceLabel = formatCurrency(product.price);
  const flashTag = product.flashSale ? " | Flash Sale" : "";
  meta.textContent = `${capitalize(category)} | ${priceLabel} | ${mediaCount} media item(s) | Total stock: ${calculateTotalStock(
    product.sizes || []
  )}${flashTag}`;

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "ghost-btn";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => startEditingProduct(product));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger-btn";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", async () => {
    await deleteProduct(product);
  });

  actions.append(editButton, deleteButton);
  card.append(title, description, meta, actions);

  return card;
}

function renderInventoryLogItem(logEntry) {
  const item = document.createElement("li");

  const action = String(logEntry.action || "updated").toUpperCase();
  const name = logEntry.productName || "Unknown product";
  const fromStock = Number(logEntry.previousStock || 0);
  const toStock = Number(logEntry.currentStock || 0);
  const timestamp = formatTimestamp(logEntry.createdAt);
  const adminEmail = logEntry.adminEmail || "unknown admin";

  item.textContent = `${action}: ${name} | stock ${fromStock} -> ${toStock} | ${timestamp} | ${adminEmail}`;
  return item;
}

function startEditingProduct(product) {
  editingProduct = {
    id: product.id,
    name: product.name || "",
    category: String(product.category || "home"),
    price: Number(product.price || 0),
    flashSale: Boolean(product.flashSale),
    description: product.description || "",
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    media: Array.isArray(product.media) ? product.media : []
  };

  removedMediaKeys.clear();

  productFormTitle.textContent = "Edit Product";
  productSubmitBtn.textContent = "Update Product";
  productCancelBtn.hidden = false;

  productNameInput.value = editingProduct.name;
  if (productCategoryInput) {
    productCategoryInput.value = ALLOWED_CATEGORIES.has(editingProduct.category)
      ? editingProduct.category
      : "home";
  }
  if (productPriceInput) {
    productPriceInput.value = String(Number.isFinite(editingProduct.price) ? editingProduct.price : 0);
  }
  if (productFlashSaleInput) {
    productFlashSaleInput.checked = editingProduct.flashSale;
  }
  productDescriptionInput.value = editingProduct.description;

  sizeRows.replaceChildren();
  if (editingProduct.sizes.length === 0) {
    sizeRows.append(createSizeRowElement("", 0));
  } else {
    editingProduct.sizes.forEach((entry) => {
      sizeRows.append(createSizeRowElement(entry.size || "", Number(entry.stock || 0)));
    });
  }

  renderExistingMedia(editingProduct.media);
  setFormMessage(`Editing ${editingProduct.name}`);

  const productSection = document.querySelector("#product-form-card");
  productSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderExistingMedia(mediaList) {
  existingMediaList.replaceChildren();

  if (!Array.isArray(mediaList) || mediaList.length === 0) {
    existingMediaWrap.hidden = true;
    return;
  }

  existingMediaWrap.hidden = false;

  mediaList.forEach((item) => {
    const mediaCard = document.createElement("article");
    mediaCard.className = "media-admin-item";

    let preview;
    if (item.type === "video") {
      preview = document.createElement("video");
      preview.controls = true;
      preview.preload = "metadata";
    } else {
      preview = document.createElement("img");
      preview.loading = "lazy";
      preview.alt = "Product media";
    }

    preview.src = item.url || "";
    preview.className = "media-admin-preview";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "ghost-btn";
    removeBtn.textContent = "Remove";

    removeBtn.addEventListener("click", () => {
      const mediaKey = getMediaKey(item);
      const isMarked = removedMediaKeys.has(mediaKey);

      if (isMarked) {
        removedMediaKeys.delete(mediaKey);
        mediaCard.classList.remove("media-removed");
        removeBtn.textContent = "Remove";
        return;
      }

      removedMediaKeys.add(mediaKey);
      mediaCard.classList.add("media-removed");
      removeBtn.textContent = "Undo Remove";
    });

    mediaCard.append(preview, removeBtn);
    existingMediaList.append(mediaCard);
  });
}

async function uploadSelectedMedia(productId, files) {
  if (files.length === 0) {
    return [];
  }

  const uploaded = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `products/${productId}/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    uploaded.push({
      url,
      path: storagePath,
      type: file.type.startsWith("video/") ? "video" : "image",
      originalName: file.name,
      sizeBytes: Number(file.size || 0)
    });
  }

  return uploaded;
}

async function deleteRemovedMediaFromStorage(originalMedia) {
  const mediaList = Array.isArray(originalMedia) ? originalMedia : [];

  for (const item of mediaList) {
    if (!removedMediaKeys.has(getMediaKey(item))) {
      continue;
    }

    if (!item.path) {
      continue;
    }

    try {
      await deleteObject(ref(storage, item.path));
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  }
}

async function deleteProduct(product) {
  if (!currentUser || !isCurrentUserAdmin) {
    setFormMessage("Admin account required.", true);
    return;
  }

  const confirmed = window.confirm(`Delete "${product.name || "this product"}"?`);
  if (!confirmed) {
    return;
  }

  try {
    setFormMessage("Deleting product...");

    if (Array.isArray(product.media)) {
      for (const item of product.media) {
        if (!item.path) {
          continue;
        }

        try {
          await deleteObject(ref(storage, item.path));
        } catch (error) {
          console.error("Failed deleting media from storage:", error);
        }
      }
    }

    await deleteDoc(doc(db, "products", product.id));

    await createInventoryLog({
      action: "deleted",
      productId: product.id,
      productName: product.name || "Unnamed product",
      previousStock: calculateTotalStock(product.sizes || []),
      currentStock: 0
    });

    if (editingProduct && editingProduct.id === product.id) {
      resetFormState();
    }

    setFormMessage("Product deleted.");
  } catch (error) {
    setFormMessage(getFriendlyError(error), true);
  }
}

async function createInventoryLog(entry) {
  if (!currentUser) {
    return;
  }

  await addDoc(collection(db, "inventoryLogs"), {
    action: entry.action,
    productId: entry.productId,
    productName: entry.productName,
    previousStock: Number(entry.previousStock || 0),
    currentStock: Number(entry.currentStock || 0),
    adminUid: currentUser.uid,
    adminEmail: currentUser.email || "",
    createdAt: serverTimestamp()
  });
}

async function normalizeMediaWithSize(mediaList) {
  const list = Array.isArray(mediaList) ? mediaList : [];

  return Promise.all(
    list.map(async (item) => {
      let sizeBytes = Number(item?.sizeBytes);

      if ((!Number.isFinite(sizeBytes) || sizeBytes < 0) && item?.path) {
        try {
          const metadata = await getMetadata(ref(storage, item.path));
          sizeBytes = Number(metadata.size || 0);
        } catch (error) {
          console.warn("Unable to read media metadata:", error);
          sizeBytes = 0;
        }
      }

      return {
        ...item,
        sizeBytes: Number.isFinite(sizeBytes) && sizeBytes > 0 ? sizeBytes : 0
      };
    })
  );
}

function calculateMediaBytes(mediaList) {
  const list = Array.isArray(mediaList) ? mediaList : [];
  return list.reduce((sum, item) => {
    const value = Number(item?.sizeBytes || 0);
    return sum + (Number.isFinite(value) && value > 0 ? value : 0);
  }, 0);
}

function calculateSelectedFilesBytes(files) {
  const list = Array.isArray(files) ? files : [];
  return list.reduce((sum, file) => {
    const value = Number(file?.size || 0);
    return sum + (Number.isFinite(value) && value > 0 ? value : 0);
  }, 0);
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);

  if (!Number.isFinite(value) || value <= 0) {
    return "0 MB";
  }

  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function collectSizes() {
  const rows = Array.from(sizeRows.querySelectorAll(".size-row"));

  return rows
    .map((row) => {
      const sizeInput = row.querySelector(".size-input");
      const stockInput = row.querySelector(".stock-input");

      const size = String(sizeInput?.value || "").trim();
      const stock = Number.parseInt(String(stockInput?.value || "0"), 10);

      if (!size) {
        return null;
      }

      return {
        size,
        stock: Number.isNaN(stock) || stock < 0 ? 0 : stock
      };
    })
    .filter(Boolean);
}

function initializeSizeRows() {
  sizeRows.replaceChildren(createSizeRowElement("", 0));
}

function createSizeRowElement(sizeValue, stockValue) {
  const row = document.createElement("div");
  row.className = "size-row";

  const sizeInput = document.createElement("input");
  sizeInput.className = "size-input";
  sizeInput.type = "text";
  sizeInput.maxLength = 30;
  sizeInput.placeholder = "Size (S, M, L, 42, etc.)";
  sizeInput.value = sizeValue;

  const stockInput = document.createElement("input");
  stockInput.className = "stock-input";
  stockInput.type = "number";
  stockInput.min = "0";
  stockInput.step = "1";
  stockInput.placeholder = "Stock";
  stockInput.value = String(Number.isFinite(stockValue) ? stockValue : 0);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "ghost-btn";
  removeButton.textContent = "Remove";

  removeButton.addEventListener("click", () => {
    const allRows = sizeRows.querySelectorAll(".size-row");
    if (allRows.length <= 1) {
      sizeInput.value = "";
      stockInput.value = "0";
      return;
    }

    row.remove();
  });

  row.append(sizeInput, stockInput, removeButton);
  return row;
}

function setLoggedOutState() {
  adminStatus.textContent = "Signed out.";
  adminPanel.hidden = true;

  if (adminEmailInput) {
    adminEmailInput.disabled = false;
  }
  if (adminPasswordInput) {
    adminPasswordInput.disabled = false;
  }
  if (adminSignInBtn) {
    adminSignInBtn.hidden = false;
  }
  if (adminSignUpBtn) {
    adminSignUpBtn.hidden = false;
  }

  adminLogoutBtn.hidden = true;
  shouldJumpToInventory = false;
  adminLoginForm?.reset();
  resetFormState();
}

function setLoggedInState(email) {
  adminStatus.textContent = `Signed in as ${email}`;

  if (adminEmailInput) {
    adminEmailInput.disabled = true;
  }
  if (adminPasswordInput) {
    adminPasswordInput.disabled = true;
  }
  if (adminSignInBtn) {
    adminSignInBtn.hidden = true;
  }
  if (adminSignUpBtn) {
    adminSignUpBtn.hidden = true;
  }

  adminLogoutBtn.hidden = false;
}

function resetFormState() {
  editingProduct = null;
  removedMediaKeys.clear();

  productForm?.reset();
  productFormTitle.textContent = "Add Product";
  productSubmitBtn.textContent = "Save Product";
  productCancelBtn.hidden = true;
  if (productCategoryInput) {
    productCategoryInput.value = "home";
  }
  if (productPriceInput) {
    productPriceInput.value = "0";
  }
  if (productFlashSaleInput) {
    productFlashSaleInput.checked = false;
  }

  initializeSizeRows();
  existingMediaWrap.hidden = true;
  existingMediaList.replaceChildren();
}

function calculateTotalStock(sizes) {
  if (!Array.isArray(sizes)) {
    return 0;
  }

  return sizes.reduce((sum, entry) => {
    const current = Number(entry.stock || 0);
    return sum + (Number.isNaN(current) ? 0 : current);
  }, 0);
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

function formatCurrency(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount < 0) {
    return "PHP 0.00";
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount);
}

function capitalize(value) {
  const normalized = String(value || "");
  if (!normalized) {
    return "";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getMediaKey(mediaItem) {
  return mediaItem?.path || mediaItem?.url || "";
}

function setAuthError(message) {
  adminAuthError.textContent = message;
}

function clearAuthError() {
  adminAuthError.textContent = "";
}

function setFormMessage(message, isError = false) {
  productFormMessage.textContent = message;
  productFormMessage.classList.toggle("message-error", isError);
}

function setFormBusy(isBusy) {
  productSubmitBtn.disabled = isBusy;
  productCancelBtn.disabled = isBusy;
  addSizeRowBtn.disabled = isBusy;
  if (productCategoryInput) {
    productCategoryInput.disabled = isBusy;
  }
  if (productPriceInput) {
    productPriceInput.disabled = isBusy;
  }
  if (productFlashSaleInput) {
    productFlashSaleInput.disabled = isBusy;
  }
  if (productMediaInput) {
    productMediaInput.disabled = isBusy;
  }
}

function getFriendlyError(error) {
  const code = typeof error?.code === "string" ? error.code : "";

  if (code.includes("invalid-credential")) {
    return "Invalid email or password.";
  }

  if (code.includes("email-already-in-use")) {
    return "Email already in use. Sign in instead.";
  }

  if (code.includes("weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }

  if (code.includes("permission-denied")) {
    return "Permission denied. Check Firestore and Storage rules.";
  }

  if (code.includes("unauthenticated")) {
    return "Please sign in again.";
  }

  if (code.includes("network-request-failed")) {
    return "Network issue. Check your connection and try again.";
  }

  if (typeof error?.message === "string" && error.message.length > 0) {
    return error.message;
  }

  return "Unexpected error. Please try again.";
}

function revealElements() {
  const elements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  elements.forEach((element, index) => {
    if (element.classList.contains("is-visible")) {
      return;
    }

    element.style.transitionDelay = `${index * 35}ms`;
    observer.observe(element);
  });
}

function jumpToInventory() {
  const inventorySection = document.querySelector("#inventory-log-card");
  inventorySection?.scrollIntoView({ behavior: "smooth", block: "start" });
}
