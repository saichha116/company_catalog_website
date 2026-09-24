import "../styles/CategoryFilter.css";

function CategoryBar({
  services = [],
  activeCategory,
  setActiveCategory,
}) {
  const categories = [
    "All",
    ...new Set(
      services
        .map((service) => service.category)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="category-filter-wrapper category-bar-wrapper">
      <div className="category-container">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={
              activeCategory === category ? "active" : ""
            }
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategoryBar;