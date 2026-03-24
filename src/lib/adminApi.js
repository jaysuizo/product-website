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
} from "firebase/firestore";
import { db } from "./firebaseClient";

export async function isUserAdmin(uid) {
  if (!uid) {
    return false;
  }

  const adminDoc = await getDoc(doc(db, "admins", uid));
  return adminDoc.exists();
}

export async function createAdminRecord(uid, email) {
  await setDoc(
    doc(db, "admins", uid),
    {
      email: email || "",
      role: "admin",
      createdAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function writeInventoryLog({
  adminUid,
  adminEmail,
  action,
  productId,
  productName,
  previousStock,
  currentStock
}) {
  await addDoc(collection(db, "inventoryLogs"), {
    adminUid,
    adminEmail,
    action,
    productId,
    productName,
    previousStock,
    currentStock,
    createdAt: serverTimestamp()
  });
}

export async function deleteProductRecord(productId) {
  await deleteDoc(doc(db, "products", productId));
}

export async function saveProductRecord(productId, payload) {
  await setDoc(doc(db, "products", productId), {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

export function subscribeInventoryLogs(onNext, onError) {
  const logsQuery = query(collection(db, "inventoryLogs"), orderBy("createdAt", "desc"), limit(40));

  return onSnapshot(
    logsQuery,
    (snapshot) => {
      onNext(snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })));
    },
    onError
  );
}

export async function saveCategoryRecord(categoryId, payload) {
  await setDoc(
    doc(db, "categories", categoryId),
    {
      ...payload,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function deleteCategoryRecord(categoryId) {
  await deleteDoc(doc(db, "categories", categoryId));
}

export async function saveStoreSettings(payload) {
  await setDoc(
    doc(db, "settings", "store"),
    {
      ...payload,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}
