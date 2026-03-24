import { Link } from "react-router-dom";
import { formatCurrency } from "../lib/format";
import { getProductAvailability, getProductStock } from "../lib/productModel";
import { SITE_CONFIG } from "../config/site";
import { useProducts } from "../contexts/ProductsContext";

const availabilityStyles = {
  in_stock: "bg-emerald-50 text-emerald-700",
  low_stock: "bg-amber-50 text-amber-700",
  out_of_stock: "bg-rose-50 text-rose-700",
  inactive: "bg-slate-100 text-slate-700"
};

const availabilityLabels = {
  in_stock: "In stock",
  low_stock: "Low",
  out_of_stock: "Out",
  inactive: "Unavailable"
};

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

export default function ProductCard({ product, onSelect, messengerUrl }) {
  const { settings } = useProducts();
  const stock = getProductStock(product);
  const availability = getProductAvailability(product);
  const variantCount = Array.isArray(product.sizes) ? product.sizes.length : 0;
  const imageUrl = product.featuredImage || product.image || "";
  const productMessengerUrl = buildMessengerLink(
    messengerUrl || settings.messengerLink || SITE_CONFIG.messengerUrl,
    product.name
  );

  const openDetails = () => {
    if (typeof onSelect === "function") {
      onSelect(product);
    }
  };

  return (
    <article className="group fade-in overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-card backdrop-blur transition hover:shadow-float sm:rounded-2xl">
      {typeof onSelect === "function" ? (
        <button type="button" onClick={openDetails} className="block w-full text-left">
          <div className="relative aspect-[4/3] overflow-hidden bg-cloud-100 sm:aspect-square">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="grid h-full place-items-center text-xs font-semibold text-cloud-700">No image</div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900/45 to-transparent sm:h-12" />
            <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 text-[10px] sm:bottom-2 sm:left-2 sm:right-2">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${availabilityStyles[availability] || availabilityStyles.in_stock}`}>
                {availabilityLabels[availability] || availabilityLabels.in_stock}
              </span>
              <span className="rounded-full bg-white/90 px-2 py-0.5 font-semibold text-cloud-700">{stock}</span>
            </div>
          </div>
        </button>
      ) : (
        <Link to={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-cloud-100 sm:aspect-square">
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="grid h-full place-items-center text-xs font-semibold text-cloud-700">No image</div>
            )}
          </div>
        </Link>
      )}

      <div className="space-y-2 p-2.5 sm:p-3">
        <button
          type="button"
          onClick={openDetails}
          className="block w-full text-left"
          disabled={typeof onSelect !== "function"}
        >
          <h3 className="line-clamp-1 text-[13px] font-extrabold text-cloud-900 sm:text-base">{product.name}</h3>
        </button>

        <div className="flex items-center justify-between gap-2">
          {product.price ? (
            <p className="text-[13px] font-extrabold text-cloud-700 sm:text-base">{formatCurrency(product.price)}</p>
          ) : (
            <p className="text-xs font-bold text-cloud-700 sm:text-sm">Message for price</p>
          )}
          <span className="rounded-full border border-cloud-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-cloud-700 sm:text-xs">
            {variantCount > 0 ? `${variantCount} sizes` : "One size"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={openDetails}
            className="min-h-9 rounded-lg border border-cloud-200 bg-white px-2 py-2 text-[11px] font-bold text-cloud-700"
          >
            View Details
          </button>
          <a
            href={productMessengerUrl}
            target="_blank"
            rel="noreferrer"
            className="min-h-9 rounded-lg bg-cloud-500 px-2 py-2 text-center text-[11px] font-bold text-white hover:bg-cloud-700"
          >
            Message Us
          </a>
        </div>
      </div>
    </article>
  );
}
