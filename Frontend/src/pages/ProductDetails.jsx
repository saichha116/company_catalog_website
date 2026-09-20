import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import "../styles/ProductDetails.css";

function ProductDetails({
  cart,
  setCart,
  wishlist,
  setWishlist,
}) {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

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
  // FETCH PRODUCT
  // =========================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        console.log("Product details:", data);

        setProduct(data);
      } catch (error) {
        console.error(
          "Error fetching product details:",
          error
        );

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="product-details-loading">
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  // =========================
  // PRODUCT NOT FOUND
  // =========================

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="product-not-found">
          <h2>Product not found</h2>

          <Link to="/products">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // PRODUCT DATA
  // =========================

  const productId = product.product_id;
  const productName = product.product_name;

  const productImage = product.image
    ? `http://localhost:5000/uploads/${product.image}`
    : "/images/product-placeholder.jpg";

  // =========================
  // CHECK WISHLIST
  // =========================

  const isWishlisted = wishlist.some(
    (item) =>
      Number(item.id) === Number(productId) &&
      item.type === "product"
  );

  // =========================
  // TOGGLE WISHLIST
  // =========================

  const toggleWishlist = async () => {
    if (!user?.id) {
      alert("Please login to use wishlist.");
      return;
    }

    try {
      // REMOVE FROM WISHLIST
      if (isWishlisted) {
        const response = await fetch(
          "http://localhost:5000/api/wishlist",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user.id,
              item_id: productId,
              item_type: "product",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to remove from wishlist"
          );
        }

        setWishlist(
          wishlist.filter(
            (item) =>
              !(
                Number(item.id) === Number(productId) &&
                item.type === "product"
              )
          )
        );

        alert(
          `${productName} removed from wishlist!`
        );

        return;
      }

      // ADD TO WISHLIST
      const response = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            item_id: productId,
            item_type: "product",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 409) {
        alert(
          `${productName} is already in your wishlist.`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add to wishlist"
        );
      }

      setWishlist([
        ...wishlist,
        {
          wishlist_id: data.wishlist_id,
          id: productId,
          name: productName,
          title: productName,
          description: product.description,
          image: product.image,
          min_price: product.min_price,
          max_price: product.max_price,
          stock: product.stock,
          type: "product",
        },
      ]);

      alert(
        `${productName} added to wishlist!`
      );
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong with wishlist."
      );
    }
  };

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = async () => {
    console.log(
      "🔥 PRODUCT DETAILS ADD TO CART CLICKED"
    );
     console.log("🚨🚨 HANDLE ADD TO CART RUNNING 🚨🚨");

    const savedUser =
      localStorage.getItem("user");

    console.log(
      "USER FROM LOCAL STORAGE:",
      savedUser
    );

    if (!savedUser) {
      alert(
        "Please login to add products to cart."
      );
      return;
    }

    let currentUser;

    try {
      currentUser = JSON.parse(savedUser);
    } catch (error) {
      console.error(
        "USER JSON ERROR:",
        error
      );

      alert(
        "Invalid login information."
      );

      return;
    }

    console.log(
      "CURRENT USER:",
      currentUser
    );

    console.log(
      "USER ID:",
      currentUser.id
    );

    console.log(
      "PRODUCT:",
      product
    );

    console.log(
      "PRODUCT ID:",
      product.product_id
    );

    console.log(
      "QUANTITY:",
      quantity
    );

    if (!currentUser?.id) {
      alert(
        "User ID not found. Please login again."
      );

      return;
    }

    if (!product?.product_id) {
      alert(
        "Product ID not found."
      );

      return;
    }

    if (Number(product.stock) <= 0) {
      alert(
        "This product is out of stock."
      );

      return;
    }

    try {
      // =========================
      // REQUEST BODY
      // =========================

      const requestBody = {
        user_id: Number(currentUser.id),
        product_id: Number(product.product_id),
        quantity: Number(quantity),
      };

      console.log(
        "SENDING TO CART API:",
        requestBody
      );

      // =========================
      // SEND TO BACKEND
      // =========================

      const response = await fetch(
        "http://localhost:5000/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            requestBody
          ),
        }
      );

      const responseText =
        await response.text();

      console.log(
        "CART API STATUS:",
        response.status
      );

      console.log(
        "CART API RESPONSE:",
        responseText
      );

      let data;

      try {
        data = JSON.parse(
          responseText
        );
      } catch (error) {
        console.error(
          "CART RESPONSE IS NOT JSON:",
          responseText
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      // =========================
      // API ERROR
      // =========================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to add product to cart"
        );
      }

      console.log(
        "PRODUCT SUCCESSFULLY ADDED:",
        data
      );

      // =========================
      // UPDATE FRONTEND CART
      // =========================

      const existingProduct =
        cart.find(
          (item) =>
            Number(
              item.product_id || item.id
            ) === Number(productId)
        );

      if (existingProduct) {
        setCart(
          cart.map((item) =>
            Number(
              item.product_id || item.id
            ) === Number(productId)
              ? {
                  ...item,
                  quantity:
                    Number(
                      item.quantity || 0
                    ) +
                    Number(quantity),
                }
              : item
          )
        );
      } else {
        setCart([
          ...cart,
          {
            ...product,
            id: productId,
            name: productName,
            quantity: Number(quantity),
          },
        ]);
      }

      alert(
        `${productName} (${quantity}) added to cart!`
      );
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );

      alert(
        error.message ||
          "Unable to add product to cart."
      );
    }
  };

  // =========================
  // ASK FOR PRICE
  // =========================

  const askForPrice = () => {
    const message =
      `Hello, I would like to ask for the price of ${productName}.`;

    const whatsappUrl =
      `https://wa.me/919422588241?text=` +
      encodeURIComponent(message);

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =========================
  // RETURN
  // =========================

  return (
    <div className="product-details-page">
      <div className="product-details-container">

        {/* MAIN PRODUCT CARD */}

        <div className="product-details-card">

          {/* IMAGE */}

          <div className="product-details-image-section">

            <Link
              to="/products"
              className="product-back-link"
            >
              ← Back to Products
            </Link>

            <div className="product-details-image-box">
              <img
                src={productImage}
                alt={productName}
                className="product-details-image"
              />
            </div>

          </div>

          {/* PRODUCT INFORMATION */}

          <div className="product-details-info">

            <p className="product-details-category">
              {product.category_name ||
                "Product"}
            </p>

            <h1 className="product-details-title">
              {productName}
            </h1>

            {product.subcategory_name && (
              <p className="product-details-subcategory">
                {product.subcategory_name}
              </p>
            )}

            {/* ASK FOR PRICE */}

            <button
              type="button"
              className="product-ask-price-button"
              onClick={askForPrice}
            >
              Ask for Price
            </button>

            {/* DESCRIPTION */}

            <div className="product-details-description">

              <h3>Description</h3>

              <p>
                {product.description ||
                  `We provide high-quality ${productName} products according to your requirements. Our products are suitable for personal and business requirements.`}
              </p>

            </div>

            {/* STOCK */}

            <div className="product-stock-section">

              {Number(product.stock) > 0 ? (
                <p className="product-in-stock">
                  In Stock: {product.stock}
                </p>
              ) : (
                <p className="product-out-of-stock">
                  Out of Stock
                </p>
              )}

            </div>

            {/* QUANTITY */}

            {Number(product.stock) > 0 && (
              <div className="quantity-section">

                <span className="quantity-label">
                  Quantity
                </span>

                <div className="quantity-controls">

                  <button
                    type="button"
                    onClick={() => {
                      if (quantity > 1) {
                        setQuantity(
                          quantity - 1
                        );
                      }
                    }}
                    disabled={
                      quantity === 1
                    }
                  >
                    −
                  </button>

                  <span>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        quantity <
                        Number(product.stock)
                      ) {
                        setQuantity(
                          quantity + 1
                        );
                      }
                    }}
                    disabled={
                      quantity >=
                      Number(product.stock)
                    }
                  >
                    +
                  </button>

                </div>

              </div>
            )}

            {/* ACTION BUTTONS */}

            <div className="product-details-actions">

              <button
  type="button"
  className="product-add-cart-button"
  onClick={() => {
    console.log("🔥 REAL PRODUCT DETAILS CLICK");
    handleAddToCart();
  }}
>
  Add to Cart
</button>
              <button
                type="button"
                className={`product-wishlist-button ${
                  isWishlisted
                    ? "wishlisted"
                    : ""
                }`}
                onClick={toggleWishlist}
              >
                {isWishlisted
                  ? "♥ Wishlisted"
                  : "♡ Wishlist"}
              </button>

            </div>

            {/* PRODUCT DETAILS */}

            <div className="product-extra-details">

              <h3>
                Product Details
              </h3>

              <ul>

                <li>
                  Category:{" "}
                  {product.category_name ||
                    "Product"}
                </li>

                {product.subcategory_name && (
                  <li>
                    Subcategory:{" "}
                    {product.subcategory_name}
                  </li>
                )}

                <li>
                  Product ID: {productId}
                </li>

                <li>
                  {Number(product.stock) > 0
                    ? `Available stock: ${product.stock}`
                    : "Currently out of stock"}
                </li>

              </ul>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;