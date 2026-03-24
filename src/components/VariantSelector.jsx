import { getVariantStock } from "../lib/productModel";

export default function VariantSelector({ variants, selectedVariantId, onSelect }) {
  if (!variants.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Variants</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const active = variant.id === selectedVariantId;
          const stock = getVariantStock(variant);
          const disabled = stock <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => !disabled && onSelect(variant.id)}
              disabled={disabled}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-cloud-500 bg-cloud-500 text-white"
                  : "border-cloud-200 bg-white text-cloud-700 hover:border-cloud-400"
              } ${disabled ? "cursor-not-allowed opacity-45" : ""}`}
              title={disabled ? "Out of stock" : `${stock} in stock`}
            >
              {variant.colorHex ? (
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/70"
                  style={{ backgroundColor: variant.colorHex }}
                />
              ) : null}
              <span>{variant.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-white/30" : "bg-cloud-50 text-cloud-700"}`}>
                {stock}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
