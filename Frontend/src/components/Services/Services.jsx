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
    <section className="home-services">
      <div className="heading">
        <h2>OUR SERVICES</h2>
      </div>

      <div className="home-service-container">
        {services.length > 0 ? (
          services.map((item) => (
            <div
              className="home-service-card"
              key={item.category_id}
              onClick={() =>
                handleServiceClick(item.category_name)
              }
            >
              {item.category_image ? (
                <img
                  src={`http://localhost:5000/uploads/${item.category_image}`}
                  alt={item.category_name}
                  className="home-service-image"
                />
              ) : (
                <div className="home-service-no-image">
                  No Image
                </div>
              )}

              <div className="home-service-overlay">
                <h3>{item.category_name}</h3>
                <span>Explore Services →</span>
              </div>
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
