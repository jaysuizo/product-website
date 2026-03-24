import { SITE_CONFIG } from "../config/site";
import { useProducts } from "../contexts/ProductsContext";

export default function MessengerFloatButton({ href }) {
  const { settings } = useProducts();
  const messengerUrl = href || settings.messengerLink || SITE_CONFIG.messengerUrl;

  return (
    <a
      href={messengerUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-3 right-3 z-50 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-gradient-to-br from-cloud-500 to-blue-600 px-3 py-2 text-xs font-bold text-white shadow-float transition hover:-translate-y-0.5 hover:from-cloud-700 hover:to-cloud-700 sm:bottom-5 sm:right-5 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
      aria-label="Contact on Messenger"
      title="Message on Messenger"
    >
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] text-cloud-700 sm:h-7 sm:w-7 sm:text-base">M</span>
      <span className="hidden sm:inline">Message us</span>
    </a>
  );
}
