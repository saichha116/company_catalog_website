import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import HeroSection from "../components/HeroSection";
import CategoryFilter from "../components/CategoryFilter";
import ProductCard from "../components/ProductCard";

import "../styles/ProductPage.css";

function ProductPage({
  cart,
  setCart,
  wishlist,
  setWishlist,
}) {
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState(searchFromUrl);

  const [selectedCategory, setSelectedCategory] =
    useState(categoryFromUrl || "All");

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || "All");
  }, [categoryFromUrl]);

  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);

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

  const filteredProducts = products.filter((product) => {
    const productName =
      product.product_name || "";

    const categoryName =
      product.category_name || "";

    const subcategoryName =
      product.subcategory_name || "";

    const search = searchTerm
      .toLowerCase()
      .trim();

    const matchesSearch =
      search === "" ||
      productName
        .toLowerCase()
        .includes(search) ||
      categoryName
        .toLowerCase()
        .includes(search) ||
      subcategoryName
        .toLowerCase()
        .includes(search);

    const matchesCategory =
      selectedCategory === "All" ||
      categoryName === selectedCategory ||
      subcategoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = async (product) => {
  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    alert("Please login to add products to cart.");
    return;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch (error) {
    console.error("Invalid user data:", error);
    alert("Invalid user session. Please login again.");
    return;
  }

  if (!user?.id) {
    alert("Please login to add products to cart.");
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
          user_id: user.id,
          product_id: product.product_id,
          quantity: 1,
        }),
      }
    );

    const data = await response.json();

    console.log("ADD TO CART RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to add product to cart"
      );
    }

    // Keep React cart state synchronized too
    setCart((prevCart) => {
      const existingProduct = prevCart.find(
        (item) =>
          Number(item.product_id) ===
          Number(product.product_id)
      );

      if (existingProduct) {
        return prevCart.map((item) =>
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
        ...prevCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    alert(`${product.product_name} added to cart!`);
  } catch (error) {
    console.error("Add to cart error:", error);

    alert(
      error.message ||
        "Something went wrong while adding the product to cart."
    );
  }
};
  return (
    <div className="product-page">
      <div className="page-container">

        <HeroSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <section className="products-section">

          <div className="category-filter-wrapper">
            <CategoryFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          <div className="selected-category-heading">
            <h2>
              {searchTerm
                ? `Search Results for "${searchTerm}"`
                : selectedCategory === "All"
                ? "All Products"
                : selectedCategory}
            </h2>
          </div>

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
                <h3>No products found.</h3>
              </div>
            )}
          </div>

        </section>
      </div>
    </div>
  );
}

export default ProductPage;