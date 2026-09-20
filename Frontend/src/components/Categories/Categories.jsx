
import "./Categories.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => {
        console.log("Categories from database:", res.data);

        // Show ONLY product categories
        const productCategories = res.data.filter(
          (category) =>
            String(category.main_category_id) === "1"
        );

        setCategories(productCategories);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  return (
    <section className="categories">
      <div className="heading">
        <h2>OUR PRODUCTS</h2>
      </div>

      <div className="category-container">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.category_id}
              className="category-card"
              onClick={() =>
                navigate(
                  `/products?category=${encodeURIComponent(
                    category.category_name
                  )}`
                )
              }
            >
              {category.category_image ? (
                <img
                  src={`http://localhost:5000/uploads/${category.category_image}`}
                  alt={category.category_name}
                  className="category-image"
                />
              ) : (
                <div className="category-no-image">
                  No Image
                </div>
              )}

              <div className="category-overlay">
                <h3>{category.category_name}</h3>
                <span>Explore Products →</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-categories">
            No product categories found.
          </p>
        )}
      </div>
    </section>
  );
}

export default Categories;


