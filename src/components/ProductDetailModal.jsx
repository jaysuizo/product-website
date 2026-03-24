import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../lib/format";
import { getProductStock, getVariantStock } from "../lib/productModel";
import ProductInquiryButton from "./ProductInquiryButton";
import ProductVideo from "./ProductVideo";
import VariantSelector from "./VariantSelector";
import { SITE_CONFIG } from "../config/site";

function buildMessengerLink(baseUrl, productName) {
  const safeBase = String(baseUrl || "").trim();
  if (!safeBase) {
    return SITE_CONFIG.messengerUrl;
  }

  try {
    const url = new URL(safeBase);
    if (url.hostname.includes("m.me") || url.hostname.includes("facebook.com")) {
      url.searchParams.set("ref", `product-${productName}`);
    }
    return url.toString();
  } catch {
    return safeBase;
  }
}

export default function ProductDetailModal({ product, messengerUrl, onClose }) {
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [activeImage, setActiveImage] = useState("");

  const selectedVariant = useMemo(() => {
    if (!product || !selectedVariantId) {
      return null;
    }
    return product.variants.find((variant) => variant.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const defaultVariant = product.variants.find((variant) => getVariantStock(variant) > 0) || product.variants[0] || null;
    setSelectedVariantId(defaultVariant?.id || "");
    setActiveImage(defaultVariant?.image || product.mainImage || product.image || "");
  }, [product]);

  useEffect(() => {
    if (selectedVariant?.image) {
      setActiveImage(selectedVariant.image);
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [product, onClose]);

  if (!product) {
    return null;
  }

  const gallery = product.galleryImages?.length ? product.galleryImages : [product.image || product.mainImage].filter(Boolean);
  const stock = selectedVariant ? getVariantStock(selectedVariant) : getProductStock(product);
  const productMessengerUrl = buildMessengerLink(messengerUrl, product.name);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <article
        className="w-full max-w-5xl overflow-hidden rounded-t-3xl border border-white/70 bg-white shadow-float sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cloud-100 px-4 py-3 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-cloud-700">Product Details</p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 rounded-full border border-cloud-200 bg-white px-3 py-1.5 text-xs font-bold text-cloud-700"
          >
            Close
          </button>
        </div>

        <div className="grid max-h-[92vh] gap-4 overflow-y-auto p-3.5 sm:max-h-[88vh] sm:gap-6 sm:p-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-2 sm:space-y-3">
            <div className="overflow-hidden rounded-2xl border border-cloud-100 bg-cloud-100">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center text-sm text-slate-500">No image</div>
              )}
            </div>

            {gallery.length > 1 ? (
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {gallery.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`overflow-hidden rounded-xl border-2 ${image === activeImage ? "border-cloud-500" : "border-transparent"}`}
                  >
                    <img src={image} alt={`${product.name} thumbnail`} className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-4 sm:space-y-5">
            <div>
              <h2 className="sky-title text-xl sm:text-3xl">{product.name}</h2>
              <p className="mt-1.5 text-lg font-black text-cloud-700 sm:text-xl">
                {product.price ? formatCurrency(product.price) : "Message for price"}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">Stock: {stock}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Size / Variant</p>
              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            </div>

            <ProductInquiryButton href={productMessengerUrl} label="Message us about this product" />

            {product.videoUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Product Video</p>
                <ProductVideo productName={product.name} videoUrl={product.videoUrl} />
              </div>
            ) : null}
          </section>
        </div>
      </article>
    </div>
  );
}
