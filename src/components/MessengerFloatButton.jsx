import { SITE_CONFIG } from "../config/site";

export default function MessengerFloatButton({ href }) {
  const messengerUrl = href || SITE_CONFIG.messengerUrl;

  return (
    <a
      href={messengerUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full border border-white/80 bg-cloud-500 px-4 py-3 text-sm font-bold text-white shadow-float transition hover:-translate-y-0.5 hover:bg-cloud-700"
      aria-label="Contact on Messenger"
      title="Message on Messenger"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-cloud-700">M</span>
      <span className="hidden sm:inline">Message us</span>
    </a>
  );
}
