import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/WishlistPage.css";

function WishlistPage({ wishlist, setWishlist }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadWishlist = async () => {
      if (!userId) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/wishlist/${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load wishlist");
        }

        const data = await response.json();

        console.log("Wishlist from database:", data);

        setWishlist(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [userId, setWishlist]);

  const removeFromWishlist = async (id, type) => {
    if (!userId) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: Number(userId),
            item_id: id,
            item_type: type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to remove from wishlist"
        );
      }

      setWishlist(
        wishlist.filter(
          (item) =>
            !(item.id === id && item.type === type)
        )
      );

      toast.success("Item removed from wishlist");
    } catch (error) {
      console.error(
        "Error removing wishlist item:",
        error
      );

      toast.error(
        error.message ||
          "Failed to remove item from wishlist."
      );
    }
  };

  const addToCart = async (item) => {
    if (!userId) {
      toast.info("Please login to add items to cart.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    try {
      const body = {
        user_id: Number(userId),
        quantity: 1,
      };

      if (item.type === "service") {
        body.service_id = item.id;
      } else {
        body.product_id = item.id;
      }

      const response = await fetch(
        "http://localhost:5000/api/cart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      console.log(
        "Wishlist add to cart response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add item to cart"
        );
      }

      window.dispatchEvent(new Event("cart-change"));

      toast.success(
        `🎉 ${item.name || item.title} added to cart!`
      );
    } catch (error) {
      console.error(
        "Wishlist add to cart error:",
        error
      );

      toast.error(
        error.message ||
          "Something went wrong while adding the item to cart."
      );
    }
  };

  // OPEN PARTICULAR ITEM PAGE
  const openItem = (item) => {
    if (item.type === "service") {
      navigate(`/service/${item.id}`);
    } else {
      navigate(`/product/${item.id}`);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-heading">
          <h1>My Wishlist</h1>
          <div className="heading-line"></div>
        </div>

        <p
          style={{
            textAlign: "center",
            margin: "40px",
          }}
        >
          Loading wishlist...
        </p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">

      <div className="wishlist-heading">
        <h1>My Wishlist</h1>
        <div className="heading-line"></div>
      </div>

      {wishlist.length === 0 ? (

        <div className="empty-wishlist">

          <h2>
            Your wishlist is empty
          </h2>

          <p>
            Add your favorite products and
            services to your wishlist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>

          <button
            type="button"
            onClick={() => navigate("/services")}
          >
            Browse Services
          </button>

        </div>

      ) : (

        <div className="wishlist-grid">

          {wishlist.map((item) => {

            const itemName =
              item.name ||
              item.title ||
              "Item";

            const imageUrl = item.image
              ? item.image.startsWith("http")
                ? item.image
                : `http://localhost:5000/uploads/${item.image}`
              : "/images/service-placeholder.jpg";

            return (
              <div
                className="wishlist-card"
                key={`${item.type}-${item.id}`}
              >

                {/* REMOVE ICON */}

                <button
                  type="button"
                  className="wishlist-remove-icon"
                  onClick={(e) => {
                    e.stopPropagation();

                    removeFromWishlist(
                      item.id,
                      item.type
                    );
                  }}
                  aria-label="Remove from wishlist"
                  title="Remove from wishlist"
                >
                  ×
                </button>

                {/* CLICKABLE ITEM */}

                <div
                  className="wishlist-item-content"
                  onClick={() => openItem(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === " "
                    ) {
                      openItem(item);
                    }
                  }}
                >

                  <img
                    src={imageUrl}
                    alt={itemName}
                    onError={(e) => {
                      e.currentTarget.src =
                        "/images/service-placeholder.jpg";
                    }}
                  />

                  <p className="wishlist-type">
                    {item.type === "product"
                      ? "Product"
                      : "Service"}
                  </p>

                  <h3>
                    {itemName}
                  </h3>

                  {item.type === "service" && (
                    <p className="wishlist-category">
                      Service
                    </p>
                  )}

                </div>

                {/* ADD TO CART */}

                <button
                  type="button"
                  className="wishlist-cart-btn"
                  onClick={() => addToCart(item)}
                >
                  ADD TO CART
                </button>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default WishlistPage;