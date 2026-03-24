import { SITE_CONFIG } from "../config/site";
import { useProducts } from "../contexts/ProductsContext";

export default function Footer() {
  const { settings } = useProducts();
  const brandName = settings.storeName || SITE_CONFIG.brandName;

  return (
    <footer className="mt-10 border-t border-white/70 bg-white/70 sm:mt-14">
      <div className="mx-auto flex w-[min(1240px,95vw)] flex-wrap items-center justify-center gap-2 py-5 text-center sm:w-[min(1240px,94vw)] sm:justify-between sm:gap-3 sm:py-6 sm:text-left">
        <p className="text-sm font-semibold text-slate-700">{brandName}</p>
        <p className="text-xs text-slate-500">{settings.contactDetails || "Message us on Messenger for inquiries."}</p>
      </div>
    </footer>
  );
}
