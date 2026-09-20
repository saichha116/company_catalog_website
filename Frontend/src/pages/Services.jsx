import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import HeroBanner from "../components/HeroBanner";
import CategoryBar from "../components/CategoryBar";
import ServiceGrid from "../components/ServiceGrid";

import "../styles/service.css";

function Services({
  searchTerm,
  wishlist,
  setWishlist,
}) {
  const [searchParams] = useSearchParams();

  const categoryFromURL = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState(
    categoryFromURL || "All"
  );

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // UPDATE CATEGORY FROM URL
  useEffect(() => {
    setActiveCategory(categoryFromURL || "All");
  }, [categoryFromURL]);

  // GET SERVICES FROM DATABASE
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/services"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await response.json();

        console.log("Services from database:", data);

        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // LOADING
  if (loading) {
    return (
      <>
        <HeroBanner />

        <p
          style={{
            textAlign: "center",
            margin: "40px",
          }}
        >
          Loading services...
        </p>
      </>
    );
  }

  return (
    <>
      <HeroBanner />

      <CategoryBar
  services={services}
  activeCategory={activeCategory}
  setActiveCategory={setActiveCategory}
/>

      <ServiceGrid
        services={services}
        activeCategory={activeCategory}
        searchTerm={searchTerm || ""}
        wishlist={wishlist || []}
        setWishlist={setWishlist}
      />
    </>
  );
}

export default Services;