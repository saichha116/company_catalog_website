import "./BestSellers.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

function BestSellers() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios
        .get("http://localhost:5000/api/products")
        .catch((err) => {
          console.error("Products fetch error in BestSellers:", err);
          return { data: [] };
        }),
      axios
        .get("http://localhost:5000/api/services")
        .catch((err) => {
          console.error("Services fetch error in BestSellers:", err);
          return { data: [] };
        }),
    ]).then(([productsRes, servicesRes]) => {
      const products = Array.isArray(productsRes.data)
        ? productsRes.data
        : [];
      const services = Array.isArray(servicesRes.data)
        ? servicesRes.data
        : [];

      const formattedProducts = products.map((p) => ({
        id: p.product_id,
        name: p.product_name,
        image: p.image,
        type: "Product",
        category: p.category_name,
        link: `/product/${p.product_id}`,
      }));

      const formattedServices = services.map((s) => ({
        id: s.service_id,
        name: s.service_name,
        image: s.image,
        type: "Service",
        category: s.category || "Service",
        link: `/service/${s.service_id}`,
      }));

      // Combine and shuffle random items from products and services
      const combined = [...formattedProducts, ...formattedServices];
      const shuffled = combined.sort(() => 0.5 - Math.random());

      // Set items for sliding carousel
      setItems(shuffled.slice(0, 16));
      setLoading(false);
    });
  }, []);

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section className="bestsellers">
      <div className="heading">
        <h2>BEST SELLERS</h2>
      </div>

      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={4}
        spaceBetween={25}
        loop={items.length > 4}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={800}
        navigation
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 15,
          },
          600: {
            slidesPerView: 2,
            spaceBetween: 18,
          },
          900: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1100: {
            slidesPerView: 4,
            spaceBetween: 25,
          },
        }}
        className="bestseller-swiper"
      >
        {items.map((item) => (
          <SwiperSlide key={`${item.type}-${item.id}`}>
            <div
              className="bestseller-card"
              onClick={() => navigate(item.link)}
            >
              <span
                className={`bestseller-badge ${
                  item.type === "Product"
                    ? "bestseller-badge-product"
                    : "bestseller-badge-service"
                }`}
              >
                {item.type}
              </span>

              {item.image ? (
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  alt={item.name}
                  className="bestseller-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}

              <div
                className="bestseller-no-image"
                style={{
                  display: item.image ? "none" : "flex",
                }}
              >
                No Image
              </div>

              <div className="bestseller-overlay">
                <h3>{item.name}</h3>
                <span>Explore {item.type} →</span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default BestSellers;