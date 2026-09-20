import "./BestSellers.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

function BestSellers() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => {
        console.log("Best Seller Categories:", res.data);

        // ONLY product categories
        const productCategories = res.data.filter(
          (category) =>
            String(category.main_category_id) === "1"
        );

        setCategories(productCategories);
      })
      .catch((err) => {
        console.error(
          "Failed to fetch best seller categories:",
          err
        );
      });
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(
      `/products?category=${encodeURIComponent(categoryName)}`
    );
  };

  return (
    <section className="bestsellers">
      <div className="heading">
        <h2>Best Sellers</h2>
      </div>

      <Swiper
        modules={[Autoplay]}
        slidesPerView={4}
        spaceBetween={25}
        loop={categories.length >= 4}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        speed={1500}
        className="bestseller-swiper"
      >
        {categories.map((item) => (
          <SwiperSlide key={item.category_id}>
            <div
              className="bestseller-card"
              onClick={() =>
                handleCategoryClick(item.category_name)
              }
            >
              {item.category_image ? (
                <img
                  src={`http://localhost:5000/uploads/${item.category_image}`}
                  alt={item.category_name}
                  className="bestseller-image"
                />
              ) : (
                <div className="image-placeholder">
                  No Image
                </div>
              )}

              <h3>{item.category_name}</h3>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default BestSellers;