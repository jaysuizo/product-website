export default function ProductGallery({ productName, galleryImages, activeImage, onSelectImage }) {
  const images = galleryImages.length > 0 ? galleryImages : activeImage ? [activeImage] : [];

  return (
    <div className="space-y-3">
      <div className="card-surface aspect-square overflow-hidden p-0">
        {activeImage ? (
          <img src={activeImage} alt={productName} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-slate-500">No image available</div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image) => {
            const active = image === activeImage;

            return (
              <button
                key={image}
                type="button"
                onClick={() => onSelectImage(image)}
                className={`overflow-hidden rounded-2xl border-2 transition ${
                  active ? "border-cloud-500" : "border-transparent"
                }`}
              >
                <img src={image} alt={`${productName} thumbnail`} className="aspect-square w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
