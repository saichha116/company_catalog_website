import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

import "../styles/CheckoutPage.css";

function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

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

  const getItemName = (item) => {
    if (item.type === "service") {
      return item.service_name || item.name || "Service";
    }

    return item.product_name || item.name || "Product";
  };

  const loadCart = async () => {
    if (!user?.id) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/cart/${user.id}`
      );

      const data = await response.json();

      console.log("Checkout cart from database:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load cart"
        );
      }

      setCart(data);
    } catch (error) {
      console.error(
        "Checkout cart loading error:",
        error
      );

      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [user?.id]);

  const handleChange = (e) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  const handleWhatsAppOrder = () => {
    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      alert("Please fill all customer details.");
      return;
    }

    if (!cart || cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    /*
      Replace this number with your actual WhatsApp number.

      Format:
      Country code + phone number
      No + sign
      No spaces
      No brackets
    */
    const whatsappNumber = "919403213361";

    let message =
      "Hello, I would like to place an order.\n\n";

    message += `Customer Name: ${customer.name}\n`;
    message += `Phone Number: ${customer.phone}\n`;
    message += `Address: ${customer.address}\n\n`;

    message += "Order Details:\n";

    cart.forEach((item) => {
      const quantity = Number(item.quantity || 1);
      const itemName = getItemName(item);

      if (item.type === "service") {
        message += `Service: ${itemName} - Quantity: ${quantity}\n`;
      } else {
        message += `Product: ${itemName} - Quantity: ${quantity}\n`;
      }
    });

    const encodedMessage = encodeURIComponent(message);

    const whatsappURL =
      `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappURL, "_blank");
  };

  if (loading) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">

          <div className="checkout-heading">
            <h1>Checkout</h1>
            <div className="heading-line"></div>
          </div>

          <div className="checkout-empty">
            <p>Loading your cart...</p>
          </div>

        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">

          <div className="checkout-heading">
            <h1>Checkout</h1>
            <div className="heading-line"></div>
          </div>

          <div className="checkout-empty">
            <h2>Please Login</h2>

            <p>
              Please login to continue with your order.
            </p>
          </div>

        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">

          <div className="checkout-heading">
            <h1>Checkout</h1>
            <div className="heading-line"></div>
          </div>

          <div className="checkout-empty">
            <h2>Your cart is empty</h2>

            <p>
              Please add products or services to your
              cart before checkout.
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        <div className="checkout-heading">
          <h1>Checkout</h1>
          <div className="heading-line"></div>
        </div>

        <div className="checkout-layout">

          {/* CUSTOMER DETAILS */}

          <div className="customer-details">

            <h2>Customer Details</h2>

            <div className="form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={customer.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                name="phone"
                value={customer.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">
                Address
              </label>

              <textarea
                id="address"
                name="address"
                value={customer.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="5"
              ></textarea>
            </div>

          </div>

          {/* ORDER SUMMARY */}

          <div className="order-summary">

            <h2>Order Summary</h2>

            <div className="checkout-items">

              {cart.map((item) => {
                const itemName = getItemName(item);

                return (
                  <div
                    className="checkout-item"
                    key={item.cart_item_id}
                  >

                    <img
                      src={getImageUrl(item.image)}
                      alt={itemName}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/images/product-placeholder.jpg";
                      }}
                    />

                    <div className="checkout-item-info">

                      <p className="checkout-item-type">
                        {item.type === "service"
                          ? "SERVICE"
                          : "PRODUCT"}
                      </p>

                      <h3>
                        {itemName}
                      </h3>

                      <p>
                        Quantity: {item.quantity}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

            <button
              type="button"
              className="whatsapp-order-btn"
              onClick={handleWhatsAppOrder}
            >
              <FaWhatsapp />
              PLACE ORDER ON WHATSAPP
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;