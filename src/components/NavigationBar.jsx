import { Link, NavLink } from "react-router-dom";
import { SITE_CONFIG } from "../config/site";
import { useProducts } from "../contexts/ProductsContext";
import { getMessengerLink } from "../lib/messenger";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
    isActive
      ? "bg-cloud-500 text-white shadow"
      : "text-cloud-900 hover:bg-white/80 hover:text-cloud-700"
  }`;

export default function NavigationBar() {
  const { settings } = useProducts();
  const brandName = settings.storeName || SITE_CONFIG.brandName;
  const messengerUrl = getMessengerLink(SITE_CONFIG.messengerUrl);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1240px,96vw)] items-center justify-between gap-2 py-1.5 sm:w-[min(1240px,95vw)] sm:py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          {settings.storeLogo ? (
            <img src={settings.storeLogo} alt={brandName} className="h-9 w-9 rounded-xl object-cover shadow sm:h-11 sm:w-11 sm:rounded-2xl" />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-cloud-500 text-sm font-black text-white shadow sm:h-11 sm:w-11 sm:rounded-2xl sm:text-lg">
              {brandName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="sky-title truncate text-base sm:text-xl">{brandName}</p>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <a
            href={messengerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-full border border-cloud-200 bg-white px-2.5 py-1.5 text-xs font-bold text-cloud-700 hover:border-cloud-400 active:scale-[0.98] sm:px-4 sm:py-2 sm:text-sm"
          >
            <span className="sm:hidden">M</span>
            <span className="hidden sm:inline">Messenger</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
