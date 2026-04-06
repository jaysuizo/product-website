import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { DEFAULT_CATEGORIES, DEFAULT_STORE_SETTINGS } from "../config/site";
import { DEMO_CATEGORIES, DEMO_PRODUCTS_RAW } from "../config/demoCatalog";
import { db, missingFirebaseConfigKeys } from "../lib/firebaseClient";
import { toSlug } from "../lib/format";
import { normalizeProduct } from "../lib/productModel";

const ProductsContext = createContext(null);

function normalizeCategoryDoc(docId, raw = {}) {
  const name = String(raw.name || docId || "Category").trim();
  return {
    id: docId,
    name,
    slug: toSlug(raw.slug || name || docId),
    image: String(raw.image || "").trim(),
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null
  };
}

function normalizeSettings(raw = {}) {
  return {
    storeName: String(raw.storeName || DEFAULT_STORE_SETTINGS.storeName).trim(),
    storeTagline: String(raw.storeTagline || DEFAULT_STORE_SETTINGS.storeTagline).trim(),
    storeLogo: String(raw.storeLogo || DEFAULT_STORE_SETTINGS.storeLogo).trim(),
    messengerLink: String(raw.messengerLink || DEFAULT_STORE_SETTINGS.messengerLink).trim(),
    contactDetails: String(raw.contactDetails || DEFAULT_STORE_SETTINGS.contactDetails).trim()
  };
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [liveProducts, setLiveProducts] = useState([]);
  const [customerImages, setCustomerImages] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (missingFirebaseConfigKeys.length > 0) {
      setError(
        `Missing Firebase config values: ${missingFirebaseConfigKeys.join(", ")}. Update .env or src/config/firebase.js.`
      );
      setLoading(false);
      return undefined;
    }

    let loadedProducts = false;
    let loadedCustomerImages = false;
    let loadedCategories = false;
    let loadedSettings = false;

    const finishLoading = () => {
      if (loadedProducts && loadedCustomerImages && loadedCategories && loadedSettings) {
        setLoading(false);
      }
    };

    const productsQuery = query(collection(db, "products"), orderBy("updatedAt", "desc"));
    const customerImagesQuery = query(collection(db, "customerImages"), orderBy("createdAt", "desc"));
    const categoriesQuery = query(collection(db, "categories"), orderBy("name", "asc"));

    const unsubscribeProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((docItem) => normalizeProduct(docItem.id, docItem.data()));
        setLiveProducts(docs);
        setProducts(docs.length > 0 ? docs : DEMO_PRODUCTS_RAW.map((item) => normalizeProduct(item.id, item)));
        loadedProducts = true;
        setError("");
        setWarning(docs.length > 0 ? "" : "Showing demo products while your live catalog is still empty.");
        finishLoading();
      },
      (snapshotError) => {
        setLiveProducts([]);
        setProducts(DEMO_PRODUCTS_RAW.map((item) => normalizeProduct(item.id, item)));
        setWarning(snapshotError.message || "Unable to load live products. Showing demo catalog.");
        loadedProducts = true;
        finishLoading();
      }
    );

    const unsubscribeCustomerImages = onSnapshot(
      customerImagesQuery,
      (snapshot) => {
        const docs = snapshot.docs
          .map((docItem) => ({ id: docItem.id, ...docItem.data() }))
          .filter((item) => String(item.image || "").trim())
          .map((item) => ({ ...item, image: String(item.image || "").trim() }));
        setCustomerImages(docs);
        loadedCustomerImages = true;
        finishLoading();
      },
      () => {
        setCustomerImages([]);
        loadedCustomerImages = true;
        finishLoading();
      }
    );

    const unsubscribeCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((docItem) => normalizeCategoryDoc(docItem.id, docItem.data()));
        setCategories(docs.length > 0 ? docs : DEMO_CATEGORIES);
        loadedCategories = true;
        finishLoading();
      },
      () => {
        setCategories(DEMO_CATEGORIES);
        loadedCategories = true;
        finishLoading();
      }
    );

    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "store"),
      (snapshot) => {
        setSettings(snapshot.exists() ? normalizeSettings(snapshot.data()) : DEFAULT_STORE_SETTINGS);
        loadedSettings = true;
        finishLoading();
      },
      () => {
        setSettings(DEFAULT_STORE_SETTINGS);
        loadedSettings = true;
        finishLoading();
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeCustomerImages();
      unsubscribeCategories();
      unsubscribeSettings();
    };
  }, []);

  const value = useMemo(
    () => ({
      products,
      liveProducts,
      customerImages,
      categories,
      settings,
      loading,
      error,
      warning,
      usingDemoData: liveProducts.length === 0 && products.length > 0
    }),
    [products, liveProducts, customerImages, categories, settings, loading, error, warning]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider.");
  }

  return context;
}
