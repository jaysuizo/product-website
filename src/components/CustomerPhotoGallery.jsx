import { useEffect, useState } from "react";

export default function CustomerPhotoGallery({ items = [], sectionId = "customer-photos" }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const [hasHistoryEntry, setHasHistoryEntry] = useState(false);

  const scrollToSection = () => {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openPhoto = (item) => {
    setActivePhoto(item);

    if (hasHistoryEntry) {
      return;
    }

    const url = new URL(window.location.href);
    url.hash = sectionId;
    window.history.pushState(
      { ...(window.history.state || {}), customerPhotoViewer: true },
      "",
      url.toString()
    );
    setHasHistoryEntry(true);
  };

  const closePhoto = () => {
    if (hasHistoryEntry) {
      window.history.back();
      return;
    }

    setActivePhoto(null);
    scrollToSection();
  };

  useEffect(() => {
    if (!activePhoto) {
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (hasHistoryEntry) {
          window.history.back();
        } else {
          setActivePhoto(null);
          scrollToSection();
        }
      }
    };

    const onPopState = () => {
      setActivePhoto(null);
      setHasHistoryEntry(false);
      scrollToSection();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
    };
  }, [activePhoto, hasHistoryEntry, sectionId]);

  if (!items.length) {
    return null;
  }

  return (
    <>
      <section id={sectionId} className="space-y-2 sm:space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="sky-title text-xl sm:text-4xl">Customer Photos</h2>
          <p className="text-xs font-semibold text-slate-600 sm:text-sm">{items.length} shared photos</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 lg:grid-cols-6">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openPhoto(item)}
              className="overflow-hidden rounded-xl border border-white/70 bg-white/90 shadow-card"
            >
              <img src={item.image} alt="Customer" className="aspect-square w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-3 sm:p-6"
          onClick={closePhoto}
        >
          <article
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-slate-950"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePhoto}
              className="absolute right-2 top-2 z-10 min-h-10 rounded-full border border-white/40 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white"
            >
              Close
            </button>
            <img src={activePhoto.image} alt="Customer full view" className="max-h-[85vh] w-full object-contain" />
          </article>
        </div>
      ) : null}
    </>
  );
}
