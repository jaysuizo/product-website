import { useEffect, useState } from "react";
import { getProductStock } from "../lib/productModel";
import ProductInquiryButton from "./ProductInquiryButton";
import ProductVideo from "./ProductVideo";
import { SITE_CONFIG } from "../config/site";
import { getProductInquiryText, getProductMessengerLink } from "../lib/messenger";

export default function ProductDetailModal({ product, messengerUrl, onClose }) {
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [inquiryHint, setInquiryHint] = useState("");

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
    setInquiryHint("");
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
    ? product.images.filter(Boolean).slice(0, 10)
    : [product.image].filter(Boolean).slice(0, 10);
  const stocks = getProductStock(product);
  const sizeOptions = parseSizes(product.size);
  const sizeText = sizeOptions.length > 0 ? sizeOptions.join(", ") : "Free Size";
  const inquiryProduct = {
    ...product,
    image: activeImage || product.image
  };
  const productMessengerUrl = getProductMessengerLink(inquiryProduct, messengerUrl || SITE_CONFIG.messengerUrl);
  const inquiryText = getProductInquiryText(inquiryProduct);

  const handleInquiryClick = async (event) => {
    event.preventDefault();

    if (inquiryText) {
      try {
        await navigator.clipboard.writeText(inquiryText);
        setInquiryHint("Copied product details. Paste in Messenger chat.");
      } catch {
        setInquiryHint("Open chat and send the product manually.");
      }
    }

    window.open(productMessengerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <article
        className="w-full max-w-5xl overflow-hidden rounded-t-2xl border border-white/70 bg-white shadow-float sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cloud-100 px-3 py-2.5 sm:px-6 sm:py-3">
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-cloud-700">Product Details</p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-full border border-cloud-200 bg-white px-3 py-1.5 text-xs font-bold text-cloud-700"
          >
            Close
          </button>
        </div>

        <div className="grid max-h-[92vh] gap-2.5 overflow-x-hidden overflow-y-auto p-2.5 sm:max-h-[88vh] sm:gap-6 sm:p-6 lg:grid-cols-[1.08fr_0.92fr]">
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
                    <img src={image} alt={`${product.name} thumbnail`} className="aspect-square w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="space-y-3.5 sm:space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {product.category || "Uncategorized"}
              </p>
              <h2 className="sky-title text-lg leading-tight sm:text-3xl">{product.name}</h2>
              <p className="mt-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
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

            <div className="sticky bottom-0 z-10 -mx-1 rounded-2xl border border-cloud-100 bg-white/95 p-1.5 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
              <p className="mb-2 px-1 text-xs font-semibold text-slate-600">
                Product: <span className="font-bold text-cloud-700">{product.name}</span>
              </p>
              <p className="mb-2 px-1 text-[11px] font-semibold text-slate-500">
                Product link and image are prepared automatically.
              </p>
              <ProductInquiryButton
                href={productMessengerUrl}
                label="Message about this product"
                onClick={handleInquiryClick}
              />
              {inquiryHint ? (
                <p className="mt-2 px-1 text-[11px] font-semibold text-cloud-700">{inquiryHint}</p>
              ) : null}
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
