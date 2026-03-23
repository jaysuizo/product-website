import { SITE_CONFIG } from "../config/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/70 bg-white/60">
      <div className="mx-auto flex w-[min(1200px,94vw)] flex-col gap-2 py-8 text-sm text-cloud-900/80 md:flex-row md:items-center md:justify-between">
        <p>{new Date().getFullYear()} {SITE_CONFIG.brandName}. Product showcase website.</p>
        <p>No checkout on this site. Tap product cards to inquire via Messenger.</p>
      </div>
    </footer>
  );
}
