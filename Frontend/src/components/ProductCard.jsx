import { Link } from "react-router-dom";

import "../styles/ProductCard.css";

function ProductCard({
  product,
  addToCart,
  wishlist = [],
  setWishlist,
}) {
  // =========================
  // DATABASE FIELD MAPPING
  // =========================

  const productId = product.product_id;
  const productName = product.product_name;

  const productImage = product.image
    ? `http://localhost:5000/uploads/${product.image}`
    : null;

  // =========================
  // GET LOGGED-IN USER
  // =========================

  const getUser = () => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
      return null;
    }
  };

  const user = getUser();

  // =========================
  // CHECK IF PRODUCT IS LIKED
  // =========================

  const isLiked = wishlist.some(
    (item) =>
      Number(item.id) === Number(productId) &&
      item.type === "product"
  );

  // =========================
  // LOAD WISHLIST FROM DATABASE
  // =========================

  const loadWishlist = async () => {
    if (!user?.id) {
      return [];
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/wishlist/${user.id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load wishlist");
      }

      const data = await response.json();

      setWishlist(data);

      return data;
    } catch (error) {
      console.error("Error loading wishlist:", error);
      return [];
    }
  };

  // =========================
  // TOGGLE WISHLIST
  // =========================

  const toggleWishlist = async (e) => {
    e.stopPropagation();

    // User must be logged in
    if (!user || !user.id) {
      alert("Please login to use wishlist.");
      return;
    }

    const userId = user.id;

    try {
      // =================================================
      // REMOVE FROM WISHLIST
      // =================================================

      if (isLiked) {
        const response = await fetch(
          "http://localhost:5000/api/wishlist",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              item_id: productId,
              item_type: "product",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to remove wishlist item"
          );
        }

        // Update React state
        setWishlist(
          wishlist.filter(
            (item) =>
              !(
                Number(item.id) === Number(productId) &&
                item.type === "product"
              )
          )
        );

        alert(`${productName} removed from wishlist!`);

        return;
      }

      // =================================================
      // ADD TO WISHLIST
      // =================================================

      const response = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            item_id: productId,
            item_type: "product",
          }),
        }
      );

      const data = await response.json();

      // =================================================
      // ITEM ALREADY EXISTS
      // =================================================

      if (response.status === 409) {
        console.log(
          "Product already exists. Synchronizing wishlist..."
        );

        const latestWishlist = await loadWishlist();

        const alreadyExists = latestWishlist.some(
          (item) =>
            Number(item.id) === Number(productId) &&
            item.type === "product"
        );

        if (alreadyExists) {
          alert(
            `${productName} is already in your wishlist.`
          );
        }

        return;
      }

      // =================================================
      // OTHER ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add wishlist item"
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      setWishlist([
        ...wishlist,
        {
          wishlist_id: data.wishlist_id,
          id: productId,
          name: productName,
          title: productName,
          description: product.description,
          image: productImage,
          min_price: product.min_price,
          max_price: product.max_price,
          stock: product.stock,
          type: "product",
        },
      ]);

      alert(`${productName} added to wishlist!`);
    } catch (error) {
      console.error("Wishlist error:", error);

      alert(
        error.message ||
          "Something went wrong with wishlist."
      );
    }
  };

  return (
    <div className="card">

      {/* =========================
          WISHLIST HEART
      ========================= */}

      <button
        type="button"
        className={`like-button ${
          isLiked ? "liked" : ""
        }`}
        onClick={toggleWishlist}
        aria-label={
          isLiked
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
      >
        {isLiked ? "♥" : "♡"}
      </button>

      {/* =========================
          PRODUCT IMAGE
      ========================= */}

      <Link
        to={`/product/${productId}`}
        className="product-card-link"
      >
        {productImage ? (
          <img
            src={productImage}
            alt={productName}
          />
        ) : (
          <div className="no-image">
            No Image
          </div>
        )}
      </Link>

      {/* =========================
          PRODUCT NAME
      ========================= */}

      <Link
        to={`/product/${productId}`}
        className="product-card-link"
      >
        <h3>{productName}</h3>
      </Link>

      {/* =========================
          ASK FOR PRICE
      ========================= */}

      <a
        href={`https://wa.me/919422588241?text=${encodeURIComponent(
          `Hello, I would like to ask for the price of ${productName}.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="ask-price"
        onClick={(e) => e.stopPropagation()}
      >
        Ask for Price
      </a>

      {/* =========================
          STOCK
      ========================= */}

      <p className="stock">
        {Number(product.stock) > 0
          ? `In Stock: ${product.stock}`
          : "Out of Stock"}
      </p>

      {/* =========================
          ADD TO CART
      ========================= */}

      <button
        type="button"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>

    </div>
  );
}

export default ProductCard;