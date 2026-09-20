import { useNavigate } from "react-router-dom";

function ServiceCard({
  id,
  image,
  title,
  category,
  price,
  fromHome,
  wishlist = [],
  setWishlist,
}) {
  const navigate = useNavigate();

  // GET LOGGED-IN USER
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

  // CHECK IF SERVICE IS LIKED
  const isLiked = wishlist.some(
    (item) =>
      Number(item.id) === Number(id) &&
      item.type === "service"
  );

  // OPEN SERVICE DETAILS
  const openDetails = () => {
    if (fromHome) {
      navigate("/services");
    } else {
      navigate(`/service/${id}`);
    }
  };

  // LOAD WISHLIST
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

  // TOGGLE WISHLIST
  const toggleWishlist = async (e) => {
    e.stopPropagation();

    if (!user || !user.id) {
      alert("Please login to use wishlist.");
      return;
    }

    const userId = user.id;

    try {
      // REMOVE SERVICE
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
              item_id: id,
              item_type: "service",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to remove service from wishlist"
          );
        }

        await loadWishlist();

        alert(`${title} removed from wishlist!`);

        return;
      }

      // ADD SERVICE TO WISHLIST
      const response = await fetch(
        "http://localhost:5000/api/wishlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            item_id: id,
            item_type: "service",
          }),
        }
      );

      const data = await response.json();

      if (response.status === 409) {
        await loadWishlist();

        alert(`${title} is already in your wishlist.`);

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add service to wishlist"
        );
      }

      await loadWishlist();

      alert(`${title} added to wishlist!`);
    } catch (error) {
      console.error("Wishlist error:", error);

      alert(
        error.message ||
          "Something went wrong with wishlist."
      );
    }
  };

  // ADD SERVICE TO CART
  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (!user || !user.id) {
      alert("Please login to add services to cart.");
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
            service_id: id,
            quantity: 1,
          }),
        }
      );

      const data = await response.json();

      console.log("ADD SERVICE TO CART RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add service to cart"
        );
      }

      alert(`${title} added to cart!`);
    } catch (error) {
      console.error("Add service to cart error:", error);

      alert(
        error.message ||
          "Something went wrong while adding the service to cart."
      );
    }
  };

  return (
    <div
      className="service-card"
      onClick={openDetails}
      style={{
        cursor: "pointer",
      }}
    >
      {/* IMAGE */}
      <div className="card-image">
        <img
          src={image}
          alt={title}
        />

        {/* WISHLIST */}
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
      </div>

      {/* CARD CONTENT */}
      <div className="card-content">
        <p className="category">
          {category}
        </p>

        <h3>{title}</h3>

        {/* ASK FOR PRICE */}
        <a
          href={`https://wa.me/919422588241?text=${encodeURIComponent(
            `Hello, I would like to ask for the price of ${title}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ask-price"
          onClick={(e) => e.stopPropagation()}
        >
          Ask for Price
        </a>

        {/* ADD TO CART */}
        <button
          type="button"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ServiceCard;