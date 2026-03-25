import { formatCurrency } from "../lib/format";
import { getProductAvailability, getProductStock } from "../lib/productModel";
import { SITE_CONFIG } from "../config/site";
import { getProductMessengerLink } from "../lib/messenger";

const availabilityStyles = {
  in_stock: "bg-emerald-50 text-emerald-700",
  out_of_stock: "bg-rose-50 text-rose-700"
};

const availabilityLabels = {
  in_stock: "In stock",
  out_of_stock: "Out"
};

export default function ProductCard({ product, onSelect, messengerUrl }) {
  const stock = getProductStock(product);
  const availability = getProductAvailability(product);
  const imageUrl = product.image || "";
  const sizeText = String(product.size || "").trim();
  const productMessengerUrl = getProductMessengerLink(product, messengerUrl || SITE_CONFIG.messengerUrl);

  const openDetails = () => {
    if (typeof onSelect === "function") {
      onSelect(product);
    }
  };

  const onCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  };

  return (
    <article
      className="group fade-in overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-card backdrop-blur transition hover:shadow-float active:scale-[0.995] sm:rounded-2xl"
      role={typeof onSelect === "function" ? "button" : undefined}
      tabIndex={typeof onSelect === "function" ? 0 : undefined}
      onClick={openDetails}
      onKeyDown={onCardKeyDown}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cloud-100">
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
        {product.featured ? (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-amber-950 sm:left-2 sm:top-2">
            Featured
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-900/45 to-transparent sm:h-12" />
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 text-[10px] sm:bottom-2 sm:left-2 sm:right-2">
          <span className={`rounded-full px-2 py-0.5 font-semibold ${availabilityStyles[availability] || availabilityStyles.in_stock}`}>
            {availabilityLabels[availability] || availabilityLabels.in_stock}
          </span>
          <span className="rounded-full bg-white/90 px-2 py-0.5 font-semibold text-cloud-700">{stock}</span>
        </div>
      </div>

      <div className="space-y-1.5 p-2 sm:space-y-2 sm:p-3">
        <p className="line-clamp-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {product.category || "Uncategorized"}
        </p>
        <h3 className="line-clamp-1 text-[13px] font-extrabold text-cloud-900 sm:text-base">{product.name}</h3>

        <div className="flex items-center justify-between gap-2">
          {product.price ? (
            <p className="text-[13px] font-extrabold text-cloud-700 sm:text-base">{formatCurrency(product.price)}</p>
          ) : (
            <p className="text-xs font-bold text-cloud-700 sm:text-sm">Message for price</p>
          )}
          {sizeText ? (
            <span className="rounded-full border border-cloud-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-cloud-700 sm:text-xs">
              {sizeText}
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <span className="inline-flex min-h-10 items-center justify-center rounded-lg border border-cloud-200 bg-white px-2 py-2 text-[11px] font-bold text-cloud-700">
            View Details
          </span>
          <a
            href={productMessengerUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-cloud-500 px-2 py-2 text-center text-[11px] font-bold text-white hover:bg-cloud-700 active:scale-[0.99]"
          >
            Message Us
          </a>
        </div>
      </div>
    </article>
  );
}
