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
    <div className="category-bar">
      {categories.map((category) => (
        <button
          key={category}
          className={
            activeCategory === category ? "active" : ""
          }
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryBar;