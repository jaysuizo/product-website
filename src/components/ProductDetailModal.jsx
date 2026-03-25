import { useEffect, useState } from "react";
import { formatCurrency } from "../lib/format";
import { getProductStock } from "../lib/productModel";
import ProductInquiryButton from "./ProductInquiryButton";
import ProductVideo from "./ProductVideo";
import { SITE_CONFIG } from "../config/site";
import { getProductMessengerLink } from "../lib/messenger";

export default function ProductDetailModal({ product, messengerUrl, onClose }) {
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const parseSizes = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item || "").trim()).filter(Boolean);
    }

    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  useEffect(() => {
    if (!product) {
      return;
    }

    setActiveImage(product.image || "");
    const sizes = parseSizes(product.size);
    setSelectedSize(sizes[0] || "Free Size");
  }, [product]);

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

  const gallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image].filter(Boolean);
  const stocks = getProductStock(product);
  const sizeOptions = parseSizes(product.size);
  const sizeText = sizeOptions.length > 0 ? sizeOptions.join(", ") : "Free Size";
  const productMessengerUrl = getProductMessengerLink(product, messengerUrl || SITE_CONFIG.messengerUrl);

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
            className="min-h-10 rounded-full border border-cloud-200 bg-white px-3 py-1.5 text-xs font-bold text-cloud-700"
          >
            Close
          </button>
        </div>

        <div className="grid max-h-[92vh] gap-3 overflow-y-auto p-3 sm:max-h-[88vh] sm:gap-6 sm:p-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-2 sm:space-y-3">
            <div className="overflow-hidden rounded-2xl border border-cloud-100 bg-cloud-100">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center text-sm text-slate-500">No image</div>
              )}
            </div>

            {gallery.length > 1 ? (
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:gap-2 sm:overflow-visible sm:pb-0">
                {gallery.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`w-16 flex-none overflow-hidden rounded-xl border-2 sm:w-auto ${image === activeImage ? "border-cloud-500" : "border-transparent"}`}
                  >
                    <img src={image} alt={`${product.name} thumbnail`} className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-4 sm:space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {product.category || "Uncategorized"}
              </p>
              <h2 className="sky-title text-xl sm:text-3xl">{product.name}</h2>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Price</p>
              <p className="mt-1.5 text-lg font-black text-cloud-700 sm:text-xl">
                {product.price ? formatCurrency(product.price) : "Message for price"}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">
                {stocks > 0 ? `In Stock: ${stocks}` : "Out of stock"}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Sizes</p>
              <div className="flex flex-wrap gap-2">
                {(sizeOptions.length > 0 ? sizeOptions : ["Free Size"]).map((size) => {
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-h-10 rounded-xl border px-3 text-xs font-bold transition ${
                        active
                          ? "border-cloud-500 bg-cloud-500 text-white"
                          : "border-cloud-200 bg-white text-cloud-700 hover:border-cloud-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] font-semibold text-slate-500">Selected: {selectedSize || sizeText}</p>
            </div>

            {product.description ? (
              <div className="whitespace-pre-wrap rounded-2xl border border-cloud-100 bg-cloud-50/60 p-3.5 text-sm text-slate-700">
                {product.description}
              </div>
            ) : null}

            <div className="sticky bottom-0 z-10 -mx-1 rounded-2xl border border-cloud-100 bg-white/95 p-1.5 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
              <ProductInquiryButton href={productMessengerUrl} label="Message Us" />
            </div>

            {product.video ? (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Product Video</p>
                <ProductVideo productName={product.name} videoUrl={product.video} />
              </div>
            ) : null}
          </section>
        </div>
      </article>
    </div>
  );
}
