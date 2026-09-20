import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/service-details.css";

function ServiceDetails({
    wishlist,
    setWishlist,
}) {
    const { id } = useParams();

    const [quantity, setQuantity] = useState(1);
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    // =========================
    // GET SERVICE
    // =========================
    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/services/${id}`)
            .then((res) => {
                setService(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.log("Service fetch error:", err);
                setLoading(false);
            });
    }, [id]);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="details-page">
                <div className="details-container">
                    <h2>Loading service...</h2>
                </div>
            </div>
        );
    }

    // =========================
    // SERVICE NOT FOUND
    // =========================
    if (!service) {
        return (
            <div className="details-page">
                <div className="details-container">
                    <h2>Service not found</h2>

                    <Link
                        to="/services"
                        className="back-link"
                    >
                        ← Back to Services
                    </Link>
                </div>
            </div>
        );
    }

    // =========================
    // SERVICE IMAGE
    // =========================
    const imageUrl = service.image
        ? `http://localhost:5000/uploads/${service.image}`
        : "/placeholder.jpg";

    // =========================
    // CHECK WISHLIST
    // =========================
    const isWishlisted = wishlist.some(
        (item) =>
            item.id === service.service_id &&
            item.type === "service"
    );

    // =========================
    // WISHLIST FUNCTION
    // =========================
    const toggleWishlist = () => {
        if (isWishlisted) {
            setWishlist(
                wishlist.filter(
                    (item) =>
                        !(
                            item.id === service.service_id &&
                            item.type === "service"
                        )
                )
            );

            alert(
                `${service.service_name} removed from wishlist!`
            );
        } else {
            setWishlist([
                ...wishlist,
                {
                    id: service.service_id,
                    image: service.image,
                    title: service.service_name,
                    name: service.service_name,
                    category: service.category,
                    type: "service",
                },
            ]);

            alert(
                `${service.service_name} added to wishlist!`
            );
        }
    };

    // =========================
    // ADD SERVICE TO CART
    // =========================
    const handleAddToCart = async () => {
        try {
            // Get logged-in user ID
            const userId =
                localStorage.getItem("user_id") ||
                localStorage.getItem("userId");

            if (!userId) {
                alert("Please login to add items to cart.");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/cart",
                {
                    user_id: Number(userId),
                    service_id: service.service_id,
                    product_id: null,
                    quantity: quantity,
                }
            );

            alert(
                response.data.message ||
                    `${service.service_name} added to cart!`
            );
        } catch (error) {
            console.log(
                "Add service to cart error:",
                error
            );

            if (error.response) {
                alert(
                    error.response.data.message ||
                        "Failed to add service to cart."
                );
            } else {
                alert(
                    "Unable to connect to the server."
                );
            }
        }
    };

    return (
        <div className="details-page">
            <div className="details-container">

                {/* =========================
                    DETAILS CARD
                ========================= */}
                <div className="details-card">

                    {/* =========================
                        IMAGE SECTION
                    ========================= */}
                    <div className="details-image-section">

                        {/* BACK BUTTON */}
                        <Link
                            to="/services"
                            className="back-link"
                        >
                            ← Back to Services
                        </Link>

                        {/* IMAGE */}
                        <div className="details-image-box">
                            <img
                                src={imageUrl}
                                alt={service.service_name}
                                className="details-image"
                                onError={(e) => {
                                    e.target.src =
                                        "/placeholder.jpg";
                                }}
                            />
                        </div>
                    </div>

                    {/* =========================
                        SERVICE INFORMATION
                    ========================= */}
                    <div className="details-info">

                        {/* CATEGORY */}
                        <p className="details-category">
                            {service.category}
                        </p>

                        {/* TITLE */}
                        <h1 className="details-title">
                            {service.service_name}
                        </h1>

                        {/* DESCRIPTION */}
                        <p className="details-description">
                            {service.description ||
                                `We provide high-quality ${service.service_name.toLowerCase()} services according to your requirements. Our team provides reliable and professional solutions for your printing, branding and fabrication needs.`}
                        </p>

                        {/* =========================
                            QUANTITY
                        ========================= */}
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
                                    -
                                </button>

                                <span>
                                    {quantity}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setQuantity(
                                            quantity + 1
                                        )
                                    }
                                >
                                    +
                                </button>

                            </div>
                        </div>

                        {/* =========================
                            ACTION BUTTONS
                        ========================= */}
                        <div className="details-actions">

                            <button
                                type="button"
                                className="checkout-button"
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </button>

                            <button
                                type="button"
                                className="wishlist-button"
                                onClick={toggleWishlist}
                            >
                                {isWishlisted
                                    ? "♥ Wishlisted"
                                    : "♡ Wishlist"}
                            </button>

                        </div>

                        {/* =========================
                            SERVICE DETAILS
                        ========================= */}
                        <div className="product-details">

                            <h3>
                                Service Details
                            </h3>

                            <ul>
                                <li>
                                    Category:{" "}
                                    {service.category}
                                </li>

                                <li>
                                    Professional quality
                                    service
                                </li>

                                <li>
                                    Suitable for personal
                                    and business
                                    requirements
                                </li>
                            </ul>

                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServiceDetails;