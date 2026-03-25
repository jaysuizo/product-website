import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, serverTimestamp } from "firebase/firestore";
import AdminAuthPanel from "../components/admin/AdminAuthPanel";
import AdminProductForm from "../components/admin/AdminProductForm";
import AdminProductList from "../components/admin/AdminProductList";
import AdminStoreSettings from "../components/admin/AdminStoreSettings";
import { DEFAULT_STORE_SETTINGS, SITE_CONFIG } from "../config/site";
import { useProducts } from "../contexts/ProductsContext";
import {
  deleteProductRecord,
  isUserAdmin,
  saveProductRecord,
  saveStoreSettings
} from "../lib/adminApi";
import { auth, db } from "../lib/firebaseClient";
import { toSlug } from "../lib/format";
import { buildProductPayload, createEmptyProductForm, getProductStock } from "../lib/productModel";

function getFriendlyError(error) {
  const code = String(error?.code || "");

  if (code.includes("invalid-credential")) {
    return "Invalid email or password.";
  }
  if (code.includes("weak-password")) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (code.includes("permission-denied")) {
    return "Permission denied. Check Firestore rules.";
  }

  return error?.message || "Unexpected error.";
}

function parseImageUrls(value) {
  return String(value || "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { liveProducts, categories, settings, warning, usingDemoData } = useProducts();
  const [authUser, setAuthUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authMessage, setAuthMessage] = useState("Sign in with your admin account.");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState("form");
  const [form, setForm] = useState(createEmptyProductForm());
  const [formBusy, setFormBusy] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState(false);

  const [settingsForm, setSettingsForm] = useState(DEFAULT_STORE_SETTINGS);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [settingsError, setSettingsError] = useState(false);

  useEffect(() => {
    setSettingsForm({
      storeName: settings.storeName,
      storeTagline: settings.storeTagline,
      storeLogo: settings.storeLogo,
      messengerLink: SITE_CONFIG.messengerUrl,
      contactDetails: settings.contactDetails
    });
  }, [settings]);

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
        } else {
          setAuthError("Unauthorized account. This page is admin-only.");
        }
      } catch (error) {
        console.error("Admin role check failed:", error);
        setIsAdmin(false);
        setAuthError(getFriendlyError(error));
      }
    });

    return () => unsubscribe();
  }, []);

  const adminProducts = useMemo(() => liveProducts, [liveProducts]);
  const stats = useMemo(() => {
    const totalStock = adminProducts.reduce((sum, item) => sum + getProductStock(item), 0);
    const withVideo = adminProducts.filter((item) => item.video).length;
    const featuredCount = adminProducts.filter((item) => item.featured).length;

    return { totalStock, withVideo, featuredCount };
  }, [adminProducts]);

  function resetFormState() {
    setForm(createEmptyProductForm());
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
      setActiveTab("manage");
    } catch (error) {
      console.error("Admin sign-in failed:", error);
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
      name: product.name || "",
      category: product.category || "General",
      featured: Boolean(product.featured),
      price: product.price ?? "",
      stocks: String(product.stocks ?? ""),
      description: product.description || "",
      size: product.size || "",
      imageUrlsText: Array.isArray(product.images) && product.images.length > 0
        ? product.images.join("\n")
        : (product.image || ""),
      images: Array.isArray(product.images) ? product.images : [],
      image: product.image || "",
      video: product.video || "",
      slug: product.slug || "",
      createdAt: product.createdAt || null
    });

    setFormMessage(`Editing ${product.name}`);
    setFormError(false);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteProduct(product) {
    if (!authUser || !isAdmin) {
      return;
    }

    const confirmed = window.confirm(`Delete "${product.name}"?`);
    if (!confirmed) {
      return;
    }

    setFormBusy(true);
    setFormMessage("Deleting product...");
    setFormError(false);

    try {
      await deleteProductRecord(product.id);

      if (form.id === product.id) {
        resetFormState();
      }

      setFormMessage("Product deleted successfully.");
      setFormError(false);
    } catch (error) {
      console.error("Delete product failed:", error);
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
      const name = String(form.name || "").trim();
      const category = String(form.category || "").trim() || "General";
      const imageList = parseImageUrls(form.imageUrlsText);
      const image = imageList[0] || "";
      const descriptionRaw = String(form.description || "");
      const description = descriptionRaw.trim();
      const stocks = Number.parseInt(String(form.stocks ?? ""), 10);

      if (!name) {
        throw new Error("Product name is required.");
      }
      if (imageList.length === 0) {
        throw new Error("Add at least one image URL.");
      }
      if (!description) {
        throw new Error("Description is required.");
      }
      if (!Number.isFinite(stocks) || stocks < 0) {
        throw new Error("Stocks must be a valid number (0 or higher).");
      }

      const productId = form.id || doc(collection(db, "products")).id;
      const payload = buildProductPayload(
        {
          ...form,
          name,
          category,
          description: descriptionRaw,
          stocks,
          images: imageList,
          imageUrlsText: imageList.join("\n"),
          image,
          slug: toSlug(form.slug || name)
        },
        { fallbackId: productId }
      );

      await saveProductRecord(productId, {
        ...payload,
        createdAt: form.createdAt || serverTimestamp()
      });

      resetFormState();
      setFormMessage(form.id ? "Product updated successfully." : "Product created successfully.");
      setFormError(false);
      setActiveTab("manage");
    } catch (error) {
      console.error("Save product failed:", error);
      setFormMessage(getFriendlyError(error));
      setFormError(true);
    } finally {
      setFormBusy(false);
    }
  }

  function setSettingsValue(key, value) {
    setSettingsForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSaveSettings() {
    if (!authUser || !isAdmin) {
      return;
    }

    setSettingsMessage("");
    setSettingsError(false);

    try {
      await saveStoreSettings({
        storeName: String(settingsForm.storeName || "").trim(),
        storeTagline: String(settingsForm.storeTagline || "").trim(),
        storeLogo: String(settingsForm.storeLogo || "").trim(),
        messengerLink: SITE_CONFIG.messengerUrl,
        contactDetails: String(settingsForm.contactDetails || "").trim(),
        updatedBy: authUser.uid,
        updatedByEmail: authUser.email || ""
      });

      setSettingsMessage("Store settings updated.");
      setSettingsError(false);
    } catch (error) {
      console.error("Save settings failed:", error);
      setSettingsMessage(getFriendlyError(error));
      setSettingsError(true);
    }
  }

  const tabItems = [
    { id: "form", label: "Product Form" },
    { id: "manage", label: "Manage Products" },
    { id: "settings", label: "Store Settings" }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {warning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {warning}
        </div>
      ) : null}

      <AdminAuthPanel
        user={authUser}
        isAdmin={isAdmin}
        authForm={authForm}
        onAuthFormChange={setAuthFormValue}
        onSignIn={handleSignIn}
        onLogout={handleLogout}
        onGoHome={() => navigate("/")}
        authMessage={authMessage}
        authError={authError}
        busy={authBusy}
      />

      {authUser && isAdmin ? (
        <>
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <article className="card-surface p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Products</p>
              <p className="mt-1.5 text-2xl font-black text-cloud-900 sm:text-3xl">{adminProducts.length}</p>
            </article>
            <article className="card-surface p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Featured</p>
              <p className="mt-1.5 text-2xl font-black text-cloud-900 sm:text-3xl">{stats.featuredCount}</p>
            </article>
            <article className="card-surface p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">With Video</p>
              <p className="mt-1.5 text-2xl font-black text-cloud-900 sm:text-3xl">{stats.withVideo}</p>
            </article>
            <article className="card-surface p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Total Stock</p>
              <p className="mt-1.5 text-2xl font-black text-cloud-900 sm:text-3xl">{stats.totalStock}</p>
            </article>
          </section>

          {usingDemoData ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              You are viewing demo storefront data. Admin changes affect only your live Firestore products.
            </section>
          ) : null}

          <section className="grid gap-4 xl:grid-cols-[260px_1fr]">
            <aside className="card-surface p-3.5 sm:p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-500 sm:mb-3">Admin Sections</p>
              <div className="flex gap-2 overflow-x-auto pb-1 xl:grid xl:overflow-visible xl:pb-0">
                {tabItems.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                        active
                          ? "bg-cloud-500 text-white"
                          : "border border-cloud-200 bg-white text-cloud-700 hover:border-cloud-400"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="space-y-4">
              {activeTab === "form" ? (
                <AdminProductForm
                  form={form}
                  setForm={setForm}
                  categories={categories}
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
                <AdminProductList products={adminProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} busy={formBusy} />
              ) : null}

              {activeTab === "settings" ? (
                <AdminStoreSettings
                  settingsForm={settingsForm}
                  onSettingsChange={setSettingsValue}
                  onSettingsSubmit={handleSaveSettings}
                  settingsMessage={settingsMessage}
                  settingsError={settingsError}
                  busy={formBusy}
                />
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
