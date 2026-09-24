import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "../pages/CartPage.css";

function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================
  // GET LOGGED-IN USER
  // ======================================

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

  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getUser());
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const userId = user?.id || user?.user_id;

  // ======================================
  // IMAGE URL
  // ======================================

  const getImageUrl = (image) => {
    if (!image) {
      return "/images/product-placeholder.jpg";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `http://localhost:5000/uploads/${image}`;
  };

  // ======================================
  // GET ITEM NAME
  // ======================================

  const getItemName = (item) => {
    if (item.type === "service") {
      return item.service_name || item.name || "Service";
    }

    return item.product_name || item.name || "Product";
  };

  // ======================================
  // GET ITEM IMAGE
  // ======================================

  const getItemImage = (item) => {
    return getImageUrl(item.image);
  };

  // ======================================
  // LOAD CART
  // ======================================

  const loadCart = async () => {
    if (!userId) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${userId}`
      );

      const data = await response.json();

      console.log("Cart from database:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load cart"
        );
      }

      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Cart loading error:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();

    const handleCartChange = () => {
      loadCart();
    };

    window.addEventListener("cart-change", handleCartChange);

    return () => {
      window.removeEventListener("cart-change", handleCartChange);
    };
  }, [userId]);

  // ======================================
  // UPDATE QUANTITY
  // ======================================

  const updateQuantity = async (
    cartItemId,
    quantity
  ) => {
    if (quantity < 1) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${cartItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update quantity"
        );
      }

      setCartItems((items) =>
        items.map((item) =>
          item.cart_item_id === cartItemId
            ? {
                ...item,
                quantity: Number(quantity),
              }
            : item
        )
      );

      window.dispatchEvent(new Event("cart-change"));
    } catch (error) {
      console.error(
        "Quantity update error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to update quantity."
      );
    }
  };

  // ======================================
  // DELETE CART ITEM
  // ======================================

  const removeFromCart = async (
    cartItemId
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${cartItemId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to remove item"
        );
      }

      setCartItems((items) =>
        items.filter(
          (item) =>
            item.cart_item_id !== cartItemId
        )
      );

      window.dispatchEvent(new Event("cart-change"));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error
      );

      toast.error(
        error.message ||
          "Unable to remove item."
      );
    }
  };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="cart-container">

        <div className="cart-heading">
          <h1>Shopping Cart</h1>
          <div className="heading-line"></div>
        </div>

        <p>Loading cart...</p>

      </div>
    );
  }

  // ======================================
  // NOT LOGGED IN
  // ======================================

  if (!userId) {
    return (
      <div className="cart-container">
        <div className="cart-heading">
          <h1>Shopping Cart</h1>
          <div className="heading-line"></div>
        </div>

        <div className="empty-cart">
          <h2>Please Log In</h2>
          <p>
            You need to be logged in to view and manage your cart.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
          >
            Log In Now
          </button>
        </div>
      </div>
    );
  }

  // ======================================
  // EMPTY CART
  // ======================================

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">

        <div className="cart-heading">
          <h1>Shopping Cart</h1>
          <div className="heading-line"></div>
        </div>

        <div className="empty-cart">

          <h2>Your cart is empty</h2>

          <p>
            Add your favorite products and
            services to your cart.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Continue Shopping
          </button>

        </div>

      </div>
    );
  }

  // ======================================
  // CART
  // ======================================

  return (
    <div className="cart-container">

      {/* ==============================
          HEADING
      ============================== */}

      <div className="cart-heading">

        <h1>Shopping Cart</h1>

        <div className="heading-line"></div>

      </div>


      {/* ==============================
          CART LAYOUT
      ============================== */}

      <div className="cart-layout">

        <div className="cart-products">

          {cartItems.map((item) => {

            const isService =
              item.type === "service";

            const itemName =
              getItemName(item);

            const itemImage =
              getItemImage(item);

            return (
              <div
                className="cart-item"
                key={item.cart_item_id}
              >

                {/* ==========================
                    IMAGE
                ========================== */}

                <img
                  className="cart-item-image"
                  src={itemImage}
                  alt={itemName}
                  onError={(e) => {

                    console.error(
                      "Image failed to load:",
                      e.currentTarget.src
                    );

                    e.currentTarget.src =
                      "/images/product-placeholder.jpg";

                  }}
                />


                {/* ==========================
                    ITEM INFO
                ========================== */}

                <div className="cart-item-info">

                  <p className="cart-item-type">
                    {isService
                      ? "SERVICE"
                      : "PRODUCT"}
                  </p>

                  <h3>
                    {itemName}
                  </h3>

                </div>


                {/* ==========================
                    QUANTITY
                ========================== */}

                <div className="quantity-control">

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.cart_item_id,
                        Number(item.quantity) - 1
                      )
                    }
                    disabled={
                      Number(item.quantity) <= 1
                    }
                  >
                    −
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.cart_item_id,
                        Number(item.quantity) + 1
                      )
                    }
                    disabled={
                      !isService &&
                      Number(item.quantity) >=
                        Number(item.stock)
                    }
                  >
                    +
                  </button>

                </div>


                {/* ==========================
                    DELETE
                ========================== */}

                <button
                  type="button"
                  className="delete-btn"
                  onClick={() =>
                    removeFromCart(
                      item.cart_item_id
                    )
                  }
                  aria-label="Remove from cart"
                  title="Remove from cart"
                >
                  🗑
                </button>

              </div>
            );

          })}

        </div>

      </div>


      {/* ==============================
          CART BUTTONS
      ============================== */}

      <div className="cart-buttons">

        <button
          type="button"
          className="checkout-btn"
          onClick={() =>
            navigate("/checkout")
          }
        >
          CHECKOUT
        </button>

        <button
          type="button"
          className="continue-btn"
          onClick={() =>
            navigate("/products")
          }
        >
          CONTINUE SHOPPING
        </button>

      </div>

    </div>
  );
}

export default CartPage;