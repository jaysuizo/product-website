export default function CategoryFilterBar({ activeCategory, onCategoryChange, categories = [] }) {
  const options = [{ id: "all", name: "All" }, ...categories];

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {options.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onCategoryChange(category.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeCategory === category.id
              ? "bg-cloud-500 text-white"
              : "border border-cloud-200 bg-white text-cloud-700 hover:border-cloud-300"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
