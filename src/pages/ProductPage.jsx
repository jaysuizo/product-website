import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useProducts } from "../contexts/ProductsContext";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ProductGallery from "../components/ProductGallery";
import ProductInquiryButton from "../components/ProductInquiryButton";
import ProductVideo from "../components/ProductVideo";
import ProductGrid from "../components/ProductGrid";
import VariantSelector from "../components/VariantSelector";
import { formatCurrency, sumStock } from "../lib/format";
import { SITE_CONFIG } from "../config/site";

export default function ProductPage() {
  const { slug } = useParams();
  const { products, loading, error } = useProducts();

  const product = useMemo(() => {
    return products.find((item) => item.slug === slug || item.id === slug);
  }, [products, slug]);

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    if (!product) {
      return;
    }

    const defaultVariant = product.variants[0];
    const defaultImage = defaultVariant?.previewImage || product.featuredImage || product.galleryImages[0] || "";

    setSelectedVariantId(defaultVariant?.id || "");
    setActiveImage(defaultImage);
  }, [product]);

  useEffect(() => {
    if (!product || !selectedVariantId) {
      return;
    }

    const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);
    if (selectedVariant?.previewImage) {
      setActiveImage(selectedVariant.previewImage);
    }
  }, [selectedVariantId, product]);

  if (loading) {
    return <LoadingState label="Loading product details..." />;
  }

  if (error) {
    return <EmptyState title="Cannot load product" description={error} />;
  }

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="The product link may be outdated. Browse the shop for available products."
      />
    );
  }

  const inquiryLink = product.messengerLink || SITE_CONFIG.messengerUrl;
  const related = products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);
  const stock = sumStock(product.inventory);

  return (
    <div className="space-y-8">
      <div className="text-sm font-semibold text-cloud-700">
        <Link to="/shop" className="hover:text-cloud-900">
          Shop
        </Link>
        <span className="px-2 text-slate-400">/</span>
        <span className="text-slate-600">{product.name}</span>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <ProductGallery
          productName={product.name}
          galleryImages={product.galleryImages}
          activeImage={activeImage}
          onSelectImage={setActiveImage}
        />

        <article className="card-surface space-y-6 p-6">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-cloud-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cloud-700">
              {product.category}
            </p>
            <h1 className="sky-title text-4xl">{product.name}</h1>
            <p className="mt-3 text-slate-600">{product.shortDescription || product.fullDescription}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-slate-600">
              <span>{stock} in stock</span>
              {product.price ? <span>{formatCurrency(product.price)}</span> : null}
            </div>
          </div>

          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            onSelect={setSelectedVariantId}
          />

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Description</p>
            <p className="mt-2 whitespace-pre-line text-slate-600">{product.fullDescription || "No full description yet."}</p>
          </div>

          {product.inventory.length > 0 ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Inventory</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.inventory.map((row) => (
                  <span key={`${row.size}-${row.stock}`} className="rounded-full border border-cloud-200 bg-white px-3 py-1 text-xs font-semibold text-cloud-700">
                    {row.size}: {row.stock}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <ProductInquiryButton href={inquiryLink} label="Message on Messenger" />
            <Link
              to="/shop"
              className="inline-flex items-center justify-center rounded-2xl border border-cloud-200 bg-white px-6 py-3 text-sm font-bold text-cloud-700 hover:border-cloud-400"
            >
              Continue Browsing
            </Link>
          </div>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="sky-title text-3xl">Product Video</h2>
        <ProductVideo productName={product.name} videoUrl={product.videoUrl} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="sky-title text-3xl">Related Products</h2>
          <Link to="/shop" className="text-sm font-bold text-cloud-700 hover:text-cloud-900">
            View all &rarr;
          </Link>
        </div>
        {related.length > 0 ? (
          <ProductGrid products={related} />
        ) : (
          <EmptyState title="No related products yet" description="Add more products in the same category from the admin panel." />
        )}
      </section>
    </div>
  );
}
