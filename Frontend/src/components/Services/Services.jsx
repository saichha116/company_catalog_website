
import "./Services.css";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Services() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/categories")
      .then((res) => {
        console.log("Service categories from database:", res.data);

        // Show ONLY service categories
        const serviceCategories = res.data.filter(
          (category) =>
            String(category.main_category_id) === "2"
        );

        setServices(serviceCategories);
      })
      .catch((err) => {
        console.error(
          "Failed to fetch service categories:",
          err
        );
      });
  }, []);

  const handleServiceClick = (service) => {
    navigate(
      `/services?category=${encodeURIComponent(service)}`
    );
  };

  return (
    <section className="services">
      <div className="heading">
        <p className="subtitle">OUR SERVICES</p>
        <h2></h2>
      </div>

      <div className="service-container">
        {services.length > 0 ? (
          services.map((item) => (
            <div
              className="service-card"
              key={item.category_id}
              onClick={() =>
                handleServiceClick(item.category_name)
              }
            >
              {item.category_image ? (
                <img
                  src={`http://localhost:5000/uploads/${item.category_image}`}
                  alt={item.category_name}
                  className="service-image"
                />
              ) : (
                <div className="image-placeholder">
                  No Image
                </div>
              )}

              <h3>{item.category_name}</h3>
            </div>
          ))
        ) : (
          <p className="no-services">
            No service categories found.
          </p>
        )}
      </div>
    </section>
  );
}

export default Services;
