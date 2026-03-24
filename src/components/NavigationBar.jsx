import { Link, NavLink } from "react-router-dom";
import { SITE_CONFIG } from "../config/site";
import { useProducts } from "../contexts/ProductsContext";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-cloud-500 text-white shadow"
      : "text-cloud-900 hover:bg-white/70 hover:text-cloud-700"
  }`;

export default function NavigationBar() {
  const { settings } = useProducts();
  const brandName = settings.storeName || SITE_CONFIG.brandName;
  const brandTagline = settings.storeTagline || SITE_CONFIG.brandTagline;

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1200px,94vw)] flex-wrap items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          {settings.storeLogo ? (
            <img src={settings.storeLogo} alt={brandName} className="h-10 w-10 rounded-2xl object-cover" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cloud-500 text-lg font-black text-white">
              {brandName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="sky-title text-xl">{brandName}</p>
            <p className="text-xs font-medium text-cloud-700">{brandTagline}</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/admin" className={navLinkClass}>
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
