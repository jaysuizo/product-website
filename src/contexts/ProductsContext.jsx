import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, missingFirebaseConfigKeys } from "../lib/firebaseClient";
import { normalizeProduct } from "../lib/productModel";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (missingFirebaseConfigKeys.length > 0) {
      setError(
        `Missing Firebase config values: ${missingFirebaseConfigKeys.join(", ")}. Update .env or src/config/firebase.js.`
      );
      setLoading(false);
      return undefined;
    }

    const productsQuery = query(collection(db, "products"), orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(snapshot.docs.map((docItem) => normalizeProduct(docItem.id, docItem.data())));
        setLoading(false);
        setError("");
      },
      (snapshotError) => {
        setError(snapshotError.message || "Unable to load products.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      products,
      loading,
      error
    }),
    [products, loading, error]
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
