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
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes
} from "firebase/storage";
import { db, storage } from "./firebaseClient";

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

export async function uploadProductFiles(productId, files) {
  const uploaded = [];

  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `products/${productId}/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    uploaded.push({
      url,
      path,
      type: file.type.startsWith("video/") ? "video" : "image",
      originalName: file.name,
      sizeBytes: Number(file.size || 0)
    });
  }

  return uploaded;
}

export async function deleteMediaFromStorage(mediaItems) {
  const list = Array.isArray(mediaItems) ? mediaItems : [];

  for (const item of list) {
    if (!item?.path) {
      continue;
    }

    try {
      await deleteObject(ref(storage, item.path));
    } catch {
      // Keep going; missing files should not block admin flow.
    }
  }
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
  await setDoc(
    doc(db, "products", productId),
    {
      ...payload,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
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
