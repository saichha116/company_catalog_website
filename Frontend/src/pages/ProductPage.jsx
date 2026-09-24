import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import HeroSection from "../components/HeroSection";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";

import "../styles/ProductPage.css";

function ProductPage({
  cart = [],
  setCart,
  wishlist = [],
  setWishlist,
  searchTerm: propSearchTerm = "",
  setSearchTerm: propSetSearchTerm,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchFromUrl || propSearchTerm || "");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl || "All"
  );

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || "All");
  }, [categoryFromUrl]);

  useEffect(() => {
    setSearchTerm(searchFromUrl);
    if (typeof propSetSearchTerm === "function") {
      propSetSearchTerm(searchFromUrl);
    }
  }, [searchFromUrl, propSetSearchTerm]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((res) => {
        console.log("Products:", res.data);
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
      });
  }, []);

  const isSearching = Boolean(searchTerm && searchTerm.trim() !== "");

  const handleClearSearch = () => {
    setSearchTerm("");
    if (typeof propSetSearchTerm === "function") {
      propSetSearchTerm("");
    }
    navigate("/");
  };

  const handleBrowseAllProducts = () => {
    setSearchTerm("");
    if (typeof propSetSearchTerm === "function") {
      propSetSearchTerm("");
    }
    navigate("/products");
  };

  const filteredProducts = products.filter((product) => {
    const productName = product.product_name || "";
    const categoryName = product.category_name || "";
    const subcategoryName = product.subcategory_name || "";
    const description = product.description || "";

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      search === "" ||
      productName.toLowerCase().includes(search) ||
      categoryName.toLowerCase().includes(search) ||
      subcategoryName.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search);

    const matchesCategory =
      isSearching ||
      selectedCategory === "All" ||
      categoryName === selectedCategory ||
      subcategoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = async (product) => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      toast.info("Please login to add products to your cart.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      toast.error("Invalid user session. Please login again.");
      return;
    }

    const userId = user?.id || user?.user_id;

    if (!userId) {
      toast.info("Please login to add products to your cart.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: Number(userId),
            product_id: product.product_id,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add product to cart"
        );
      }

      // Keep React cart state synchronized if setCart was provided
      if (typeof setCart === "function") {
        setCart((prevCart = []) => {
          const list = Array.isArray(prevCart) ? prevCart : [];
          const existingProduct = list.find(
            (item) =>
              Number(item.product_id) ===
              Number(product.product_id)
          );

          if (existingProduct) {
            return list.map((item) =>
              Number(item.product_id) ===
              Number(product.product_id)
                ? {
                    ...item,
                    quantity:
                      Number(item.quantity || 1) + 1,
                  }
                : item
            );
          }

          return [
            ...list,
            {
              ...product,
              quantity: 1,
            },
          ];
        });
      }

      // Notify Navbar and app of cart change
      window.dispatchEvent(new Event("cart-change"));

      toast.success(`🎉 ${product.product_name} added to cart!`);
    } catch (error) {
      console.error("Add to cart error:", error);

      toast.error(
        error.message ||
          "Something went wrong while adding the product to cart."
      );
    }
  };

  return (
    <div className="product-page">
      <div className="page-container">

        {/* HIDE HeroSection WHEN SEARCHING */}
        {!isSearching && (
          <HeroSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        <section
          className="products-section"
          style={{
            marginTop: isSearching ? "30px" : undefined,
          }}
        >

          {/* HIDE CategoryFilter (Category Navigation) WHEN SEARCHING */}
          {!isSearching && (
            <div className="category-filter-wrapper">
              <CategoryFilter
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>
          )}

          {/* SEARCH HEADER vs NORMAL CATEGORY HEADING */}
          {isSearching ? (
            <div className="search-results-header">
              <div className="search-results-info">
                <h2>
                  Search Results for &ldquo;<span>{searchTerm}</span>&rdquo;
                </h2>
                <p className="search-results-count">
                  {filteredProducts.length === 1
                    ? "1 product found"
                    : `${filteredProducts.length} products found`}
                </p>
              </div>

              <button
                type="button"
                className="clear-search-btn"
                onClick={handleClearSearch}
              >
                ✕ Clear Search
              </button>
            </div>
          ) : (
            <div className="selected-category-heading">
              <h2>{selectedCategory}</h2>
            </div>
          )}

          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  addToCart={addToCart}
                  wishlist={wishlist}
                  setWishlist={setWishlist}
                />
              ))
            ) : (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>
                  {isSearching
                    ? `No products found for "${searchTerm}"`
                    : "No products found in this category."}
                </h3>
                <p>
                  {isSearching
                    ? "We couldn't find any products matching your search query. Try checking your spelling or searching for another keyword."
                    : "There are currently no products available in this category."}
                </p>
                {isSearching && (
                  <button
                    type="button"
                    className="clear-search-btn-primary"
                    onClick={handleBrowseAllProducts}
                  >
                    Browse All Products
                  </button>
                )}
              </div>
            )}
          </div>

        </section>
      </div>
    </div>
  );
}

export default ProductPage;