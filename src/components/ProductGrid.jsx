import ProductCard from "./ProductCard";

export default function ProductGrid({ products, onSelect, messengerUrl }) {
  if (!products.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={onSelect} messengerUrl={messengerUrl} />
      ))}
    </div>
  );
}
