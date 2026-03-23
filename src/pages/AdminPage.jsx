import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import AdminAuthPanel from "../components/admin/AdminAuthPanel";
import AdminInventoryLogs from "../components/admin/AdminInventoryLogs";
import AdminProductForm from "../components/admin/AdminProductForm";
import AdminProductList from "../components/admin/AdminProductList";
import { MAX_PRODUCT_MEDIA_BYTES } from "../config/site";
import { useProducts } from "../contexts/ProductsContext";
import {
  createAdminRecord,
  deleteMediaFromStorage,
  deleteProductRecord,
  isUserAdmin,
  saveProductRecord,
  subscribeInventoryLogs,
  uploadProductFiles,
  writeInventoryLog
} from "../lib/adminApi";
import { auth, db } from "../lib/firebaseClient";
import { bytesToMbText, sumStock, toSlug } from "../lib/format";
import { buildProductPayload, createEmptyProductForm } from "../lib/productModel";

function getFriendlyError(error) {
  const code = String(error?.code || "");

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
    return "Permission denied. Check Firestore/Storage rules.";
  }

  return error?.message || "Unexpected error.";
}

function getMediaKey(item) {
  return item?.path || item?.url || "";
}

function sumMediaBytes(mediaItems) {
  return mediaItems.reduce((total, item) => {
    const bytes = Number(item?.sizeBytes || 0);
    return total + (Number.isFinite(bytes) && bytes > 0 ? bytes : 0);
  }, 0);
}

function sumSelectedFileBytes(files) {
  return files.reduce((total, file) => total + (Number(file?.size || 0) || 0), 0);
}

export default function AdminPage() {
  const { products } = useProducts();
  const [authUser, setAuthUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authMessage, setAuthMessage] = useState("Sign in or create an admin account.");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState("form");
  const [logs, setLogs] = useState([]);

  const [form, setForm] = useState(createEmptyProductForm());
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [removedMediaKeys, setRemovedMediaKeys] = useState(() => new Set());
  const [formBusy, setFormBusy] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthError("");
      setAuthMessage(user ? "Checking admin permission..." : "Signed out.");

      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const allowed = await isUserAdmin(user.uid);
        setIsAdmin(allowed);

        if (allowed) {
          setAuthMessage(`Admin access granted: ${user.email || "Unknown email"}`);
          return;
        }

        setAuthError("This account is not in admins collection.");
      } catch (error) {
        setIsAdmin(false);
        setAuthError(getFriendlyError(error));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setLogs([]);
      return undefined;
    }

    const unsubscribe = subscribeInventoryLogs(
      (items) => setLogs(items),
      () => setLogs([])
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const adminProducts = useMemo(() => products, [products]);

  function resetFormState() {
    setForm(createEmptyProductForm());
    setSelectedFiles([]);
    setRemovedMediaKeys(new Set());
  }

  function setAuthFormValue(key, value) {
    setAuthForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSignIn() {
    setAuthBusy(true);
    setAuthError("");

    try {
      await signInWithEmailAndPassword(auth, authForm.email.trim(), authForm.password);
      setAuthForm({ email: "", password: "" });
      setActiveTab("inventory");
    } catch (error) {
      setAuthError(getFriendlyError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignUp() {
    setAuthBusy(true);
    setAuthError("");

    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        authForm.email.trim(),
        authForm.password
      );

      await createAdminRecord(credential.user.uid, credential.user.email || authForm.email.trim());
      setAuthForm({ email: "", password: "" });
      setActiveTab("inventory");
      setAuthMessage("Admin account created and signed in.");
    } catch (error) {
      setAuthError(getFriendlyError(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    setIsAdmin(false);
    resetFormState();
  }

  function handleEditProduct(product) {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      featuredImage: product.featuredImage,
      galleryImages: [...product.galleryImages],
      variants: product.variants.length
        ? product.variants.map((variant) => ({ ...variant }))
        : [{ id: "variant-1", name: "Default", label: "Default", colorHex: "", previewImage: "" }],
      videoUrl: product.videoUrl,
      messengerLink: product.messengerLink,
      featured: product.featured,
      price: product.price ?? "",
      inventory: product.inventory.length ? [...product.inventory] : [{ size: "Standard", stock: 0 }],
      media: Array.isArray(product.media) ? [...product.media] : []
    });

    setSelectedFiles([]);
    setRemovedMediaKeys(new Set());
    setFormMessage(`Editing ${product.name}`);
    setFormError(false);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleRemoveMedia(mediaKey) {
    setRemovedMediaKeys((current) => {
      const next = new Set(current);
      if (next.has(mediaKey)) {
        next.delete(mediaKey);
      } else {
        next.add(mediaKey);
      }
      return next;
    });
  }

  async function handleDeleteProduct(product) {
    if (!authUser || !isAdmin) {
      return;
    }

    const confirmed = window.confirm(`Delete \"${product.name}\"?`);
    if (!confirmed) {
      return;
    }

    setFormBusy(true);
    setFormMessage("Deleting product...");
    setFormError(false);

    try {
      await deleteMediaFromStorage(product.media || []);
      await deleteProductRecord(product.id);

      await writeInventoryLog({
        adminUid: authUser.uid,
        adminEmail: authUser.email || "",
        action: "deleted",
        productId: product.id,
        productName: product.name,
        previousStock: sumStock(product.inventory),
        currentStock: 0
      });

      if (form.id === product.id) {
        resetFormState();
      }

      setFormMessage("Product deleted successfully.");
      setFormError(false);
    } catch (error) {
      setFormMessage(getFriendlyError(error));
      setFormError(true);
    } finally {
      setFormBusy(false);
    }
  }

  async function handleSubmitProduct() {
    if (!authUser || !isAdmin) {
      setFormMessage("Admin account is required.");
      setFormError(true);
      return;
    }

    setFormBusy(true);
    setFormMessage(form.id ? "Updating product..." : "Creating product...");
    setFormError(false);

    try {
      const name = form.name.trim();
      if (!name) {
        throw new Error("Product name is required.");
      }

      const fullDescription = form.fullDescription.trim();
      if (!fullDescription) {
        throw new Error("Full description is required.");
      }

      const inventory = form.inventory
        .map((row) => ({
          size: String(row.size || "").trim(),
          stock: Math.max(0, Number.parseInt(String(row.stock || 0), 10) || 0)
        }))
        .filter((row) => row.size);

      if (inventory.length === 0) {
        throw new Error("Add at least one size and stock row.");
      }

      const productId = form.id || doc(collection(db, "products")).id;

      const keptMedia = (form.media || []).filter((item) => !removedMediaKeys.has(getMediaKey(item)));
      const existingBytes = sumMediaBytes(keptMedia);
      const selectedBytes = sumSelectedFileBytes(selectedFiles);

      if (existingBytes + selectedBytes > MAX_PRODUCT_MEDIA_BYTES) {
        throw new Error(
          `Media exceeds 20 MB. Current selection: ${bytesToMbText(
            existingBytes + selectedBytes
          )}. Limit: ${bytesToMbText(MAX_PRODUCT_MEDIA_BYTES)}.`
        );
      }

      const uploadedMedia = selectedFiles.length > 0 ? await uploadProductFiles(productId, selectedFiles) : [];
      const nextMedia = [...keptMedia, ...uploadedMedia];
      const imageUrls = nextMedia.filter((item) => item.type === "image").map((item) => item.url);
      const videoUrls = nextMedia.filter((item) => item.type === "video").map((item) => item.url);

      const galleryImages = [form.featuredImage, ...form.galleryImages, ...imageUrls]
        .map((entry) => String(entry || "").trim())
        .filter(Boolean);

      const videoUrl = String(form.videoUrl || videoUrls[0] || "").trim();

      const variants = form.variants
        .map((variant, index) => ({
          id: variant.id || `variant-${index + 1}`,
          name: String(variant.name || `Variant ${index + 1}`).trim(),
          label: String(variant.label || "").trim(),
          colorHex: String(variant.colorHex || "").trim(),
          previewImage: String(variant.previewImage || galleryImages[0] || "").trim()
        }))
        .filter((variant) => variant.label);

      if (variants.length === 0) {
        throw new Error("Add at least one variant label.");
      }

      const parsedPrice = Number.parseFloat(String(form.price || ""));
      const price = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : null;

      const payload = buildProductPayload(
        {
          ...form,
          slug: toSlug(form.slug || name),
          name,
          fullDescription,
          shortDescription: form.shortDescription.trim(),
          featuredImage: String(form.featuredImage || galleryImages[0] || "").trim(),
          galleryImages,
          variants,
          videoUrl,
          messengerLink: String(form.messengerLink || "").trim(),
          inventory,
          price,
          media: nextMedia
        },
        { fallbackId: productId }
      );

      const oldStock = sumStock(form.inventory);
      const newStock = sumStock(inventory);

      const savePayload = {
        ...payload,
        updatedBy: authUser.uid,
        updatedByEmail: authUser.email || ""
      };

      if (!form.id) {
        savePayload.createdAt = serverTimestamp();
        savePayload.createdBy = authUser.uid;
        savePayload.createdByEmail = authUser.email || "";
      }

      await saveProductRecord(productId, savePayload);

      const removedItems = (form.media || []).filter((item) => removedMediaKeys.has(getMediaKey(item)));
      if (removedItems.length > 0) {
        await deleteMediaFromStorage(removedItems);
      }

      await writeInventoryLog({
        adminUid: authUser.uid,
        adminEmail: authUser.email || "",
        action: form.id ? "updated" : "created",
        productId,
        productName: payload.name,
        previousStock: oldStock,
        currentStock: newStock
      });

      resetFormState();
      setFormMessage(form.id ? "Product updated successfully." : "Product created successfully.");
      setFormError(false);
      setActiveTab("inventory");
    } catch (error) {
      setFormMessage(getFriendlyError(error));
      setFormError(true);
    } finally {
      setFormBusy(false);
    }
  }

  const tabButtonClass = (tab) =>
    `rounded-full px-4 py-2 text-sm font-bold transition ${
      activeTab === tab
        ? "bg-cloud-500 text-white"
        : "border border-cloud-200 bg-white text-cloud-700 hover:border-cloud-400"
    }`;

  return (
    <div className="space-y-6">
      <AdminAuthPanel
        user={authUser}
        isAdmin={isAdmin}
        authForm={authForm}
        onAuthFormChange={setAuthFormValue}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onLogout={handleLogout}
        authMessage={authMessage}
        authError={authError}
        busy={authBusy}
      />

      {authUser && isAdmin ? (
        <>
          <section className="card-surface p-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setActiveTab("form")} className={tabButtonClass("form")}>
                Upload / Edit Product
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("inventory")}
                className={tabButtonClass("inventory")}
              >
                Inventory Logs
              </button>
              <button type="button" onClick={() => setActiveTab("manage")} className={tabButtonClass("manage")}>
                Manage Products
              </button>
            </div>
          </section>

          {activeTab === "form" ? (
            <AdminProductForm
              form={form}
              setForm={setForm}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              removedMediaKeys={removedMediaKeys}
              onToggleRemoveMedia={toggleRemoveMedia}
              onSubmit={handleSubmitProduct}
              onCancel={() => {
                resetFormState();
                setFormMessage("Edit cancelled.");
                setFormError(false);
              }}
              isEditing={Boolean(form.id)}
              busy={formBusy}
              formMessage={formMessage}
              formError={formError}
            />
          ) : null}

          {activeTab === "manage" ? (
            <AdminProductList
              products={adminProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              busy={formBusy}
            />
          ) : null}

          {activeTab === "inventory" ? <AdminInventoryLogs logs={logs} /> : null}
        </>
      ) : null}
    </div>
  );
}
